/**
 * Lightweight performance metrics for the public homepage.
 *
 * Captures:
 *  - FCP (First Contentful Paint)
 *  - LCP (Largest Contentful Paint)
 *  - CLS (Cumulative Layout Shift)
 *  - INP (longest event delay observed)
 *  - Long tasks count + total blocking time
 *  - Animations triggered count (incremented manually from SectionBlock)
 *
 * Usage:
 *   import { initPerfMetrics, trackAnimation, getMetrics } from "@/lib/perfMetrics";
 *   initPerfMetrics();         // call once at app boot
 *   trackAnimation("section"); // call when an animation runs
 *   getMetrics();              // read current snapshot
 *
 * In production the snapshot is also logged to the console once the page is
 * idle, and exposed on `window.__perfMetrics` for live inspection.
 */

export interface PerfMetrics {
  fcp: number | null;        // ms since navigation start
  lcp: number | null;        // ms since navigation start
  cls: number;               // unitless (lower = better)
  inp: number | null;        // ms (longest event duration observed)
  longTasks: number;         // count of tasks > 50ms
  totalBlockingTime: number; // sum of (task duration - 50ms) for long tasks
  animationsTriggered: number;
  animationsByKind: Record<string, number>;
}

const metrics: PerfMetrics = {
  fcp: null,
  lcp: null,
  cls: 0,
  inp: null,
  longTasks: 0,
  totalBlockingTime: 0,
  animationsTriggered: 0,
  animationsByKind: {},
};

let initialized = false;

const safeObserve = (
  type: string,
  cb: (entries: PerformanceEntryList) => void,
  options: PerformanceObserverInit = { type, buffered: true } as PerformanceObserverInit
) => {
  if (typeof PerformanceObserver === "undefined") return;
  try {
    const obs = new PerformanceObserver((list) => cb(list.getEntries()));
    obs.observe(options);
  } catch {
    // Entry type not supported in this browser → ignore silently.
  }
};

export const initPerfMetrics = () => {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // FCP — from paint timing
  safeObserve("paint", (entries) => {
    for (const e of entries) {
      if (e.name === "first-contentful-paint" && metrics.fcp === null) {
        metrics.fcp = Math.round(e.startTime);
      }
    }
  });

  // LCP — keep the latest value
  safeObserve("largest-contentful-paint", (entries) => {
    const last = entries[entries.length - 1];
    if (last) metrics.lcp = Math.round(last.startTime);
  });

  // CLS — sum unexpected layout shifts (excluding ones caused by user input)
  safeObserve("layout-shift", (entries) => {
    for (const e of entries as unknown as Array<PerformanceEntry & {
      value: number;
      hadRecentInput: boolean;
    }>) {
      if (!e.hadRecentInput) metrics.cls += e.value;
    }
  });

  // INP — track longest event duration as a proxy
  safeObserve("event", (entries) => {
    for (const e of entries) {
      const d = (e as PerformanceEntry & { duration: number }).duration;
      if (d && (metrics.inp === null || d > metrics.inp)) {
        metrics.inp = Math.round(d);
      }
    }
  }, { type: "event", buffered: true, durationThreshold: 40 } as PerformanceObserverInit);

  // Long tasks — repaint/scroll jank indicator
  safeObserve("longtask", (entries) => {
    for (const e of entries) {
      metrics.longTasks += 1;
      metrics.totalBlockingTime += Math.max(0, e.duration - 50);
    }
  });

  // Expose for manual inspection.
  (window as unknown as { __perfMetrics: () => PerfMetrics }).__perfMetrics =
    () => ({ ...metrics, animationsByKind: { ...metrics.animationsByKind } });

  // Log a single snapshot once things settle (after load + 3s of idle scrolling).
  const logOnce = () => {
    const snapshot = {
      ...metrics,
      animationsByKind: { ...metrics.animationsByKind },
      tbt: Math.round(metrics.totalBlockingTime),
      cls: Number(metrics.cls.toFixed(3)),
    };
    // Single grouped console log — easy to spot in DevTools / remote logs.
    // eslint-disable-next-line no-console
    console.info("[perf] homepage snapshot", snapshot);
  };

  if (document.readyState === "complete") {
    setTimeout(logOnce, 3000);
  } else {
    window.addEventListener(
      "load",
      () => setTimeout(logOnce, 3000),
      { once: true }
    );
  }
};

export const trackAnimation = (kind = "default") => {
  metrics.animationsTriggered += 1;
  metrics.animationsByKind[kind] = (metrics.animationsByKind[kind] ?? 0) + 1;
};

export const getMetrics = (): PerfMetrics => ({
  ...metrics,
  animationsByKind: { ...metrics.animationsByKind },
});
