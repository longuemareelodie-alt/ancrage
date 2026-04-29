import { useEffect, useRef, useState } from "react";
import { Volume2, Pause, Play, Square, RotateCcw, SkipForward } from "lucide-react";
import {
  RATE_VALUES,
  getSpeechRate,
  getSpeechLang,
  getSpeechPitch,
  getSilentMode,
  getFocusFollow,
  loadVoices,
  resolveVoice,
  buildUtteranceSegments,
  type UtteranceSegment,
} from "@/lib/speechPrefs";
import { splitSentences } from "@/lib/sentenceSplit";
import { applyLexicon } from "@/lib/pronunciationLexicon";
import {
  getProgress,
  saveProgress,
  clearProgress,
  type SpeechProgress,
} from "@/lib/speechProgress";

type SpeechState = "idle" | "speaking" | "paused";

interface SpeakableTextProps {
  text: string;
  /** Optional secondary text (e.g. hint) appended after the main text. */
  hint?: string;
  lang?: string;
  className?: string;
  textClassName?: string;
}

// Sentence splitting is provided by `@/lib/sentenceSplit` (FR-aware).

const SpeakableText = ({
  text,
  hint,
  lang,
  className = "",
  textClassName = "",
}: SpeakableTextProps) => {
  const [state, setState] = useState<SpeechState>("idle");
  const [supported, setSupported] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [estimatedTotal, setEstimatedTotal] = useState(0); // seconds
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const pauseTimerRef = useRef<number | null>(null);
  const playbackIdRef = useRef(0); // increments on each new playback to invalidate old chains
  const skipToSegmentRef = useRef<number | null>(null);
  const segmentSentenceMapRef = useRef<number[]>([]);
  const sentenceSegmentStartRef = useRef<number[]>([]);
  const cursorRef = useRef(0);
  const sentenceCursorRef = useRef(0);
  const playNextRef = useRef<(() => void) | null>(null);
  const tickerRef = useRef<number | null>(null);
  // Frozen-pause support for silent pause segments (commas / sentence breaks).
  const pauseDeadlineRef = useRef<number | null>(null); // when timer should fire
  const pauseRemainingRef = useRef<number | null>(null); // remaining ms when paused
  const pauseAfterRef = useRef<(() => void) | null>(null); // callback after the silent pause
  const sentenceRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const fullText = hint ? `${text}. ${hint}` : text;
  const sentences = splitSentences(fullText);
  const [savedProgress, setSavedProgress] = useState<SpeechProgress | null>(null);
  const stateRef = useRef<SpeechState>("idle");
  const elapsedRef = useRef(0);
  const estimatedTotalRef = useRef(0);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);
  useEffect(() => { estimatedTotalRef.current = estimatedTotal; }, [estimatedTotal]);

  // Load any saved progress for this text on mount / when text changes.
  useEffect(() => {
    setSavedProgress(getProgress(fullText));
  }, [fullText]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current !== null) {
        window.clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          /* noop */
        }
      }
    };
  }, []);

  // Tick elapsed time only while actively speaking.
  useEffect(() => {
    if (state !== "speaking") {
      if (tickerRef.current !== null) {
        window.clearInterval(tickerRef.current);
        tickerRef.current = null;
      }
      return;
    }
    const start = Date.now();
    const startElapsed = elapsed;
    tickerRef.current = window.setInterval(() => {
      setElapsed(startElapsed + (Date.now() - start) / 1000);
    }, 250);
    return () => {
      if (tickerRef.current !== null) {
        window.clearInterval(tickerRef.current);
        tickerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Move keyboard focus onto the active sentence span when the user opted-in.
  // We only steal focus while actively speaking to avoid hijacking input.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!getFocusFollow(lang)) return;
    if (state !== "speaking") return;
    if (activeIndex < 0) return;
    const el = sentenceRefs.current[activeIndex];
    if (!el) return;
    // Don't steal focus if the user is currently interacting with a control
    // (typing in a field, etc.).
    const ae = document.activeElement as HTMLElement | null;
    const tag = ae?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || ae?.isContentEditable) return;
    try {
      el.focus({ preventScroll: false });
    } catch {
      /* noop */
    }
  }, [activeIndex, state]);

  const cancelAll = () => {
    if (pauseTimerRef.current !== null) {
      window.clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    pauseDeadlineRef.current = null;
    pauseRemainingRef.current = null;
    pauseAfterRef.current = null;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }
  };

  const restorePreviousFocus = () => {
    const prev = previousFocusRef.current;
    previousFocusRef.current = null;
    if (!prev || !getFocusFollow(lang)) return;
    const ae = document.activeElement as HTMLElement | null;
    if (ae && sentenceRefs.current.includes(ae as HTMLSpanElement)) {
      try {
        prev.focus({ preventScroll: true });
      } catch {
        /* noop */
      }
    }
  };

  const handlePlay = async (fromSentence = 0) => {
    if (!supported) return;
    cancelAll();

    if (typeof document !== "undefined" && getFocusFollow(lang)) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
    }

    const playbackId = ++playbackIdRef.current;
    const synth = window.speechSynthesis;
    const effectiveLang = lang ?? getSpeechLang();

    const voices = await loadVoices();
    if (playbackId !== playbackIdRef.current) return; // cancelled while loading
    const voice = resolveVoice(voices, effectiveLang);
    const baseRate = RATE_VALUES[getSpeechRate(effectiveLang)];
    const pitch = getSpeechPitch(effectiveLang);

    const segments: UtteranceSegment[] = buildUtteranceSegments(fullText, { lang: effectiveLang });

    // Build mapping: each segment -> its sentence index.
    const segMap: number[] = [];
    const sentStart: number[] = [0];
    {
      let s = 0;
      for (let k = 0; k < segments.length; k++) {
        segMap.push(s);
        const seg = segments[k];
        if (seg.pauseMs && seg.pauseMs >= 250) {
          s = Math.min(sentences.length - 1, s + 1);
          if (sentStart.length <= s) sentStart.push(k + 1);
        }
      }
    }
    segmentSentenceMapRef.current = segMap;
    sentenceSegmentStartRef.current = sentStart;

    // Clamp the starting sentence and resolve its first segment.
    const startSentence = Math.max(
      0,
      Math.min(sentences.length - 1, fromSentence | 0),
    );
    const startSegment =
      sentStart[startSentence] !== undefined ? sentStart[startSentence] : 0;

    // Estimate total duration of the *played* portion (from startSegment onward).
    let charCount = 0;
    let pauseSeconds = 0;
    for (let k = startSegment; k < segments.length; k++) {
      const seg = segments[k];
      if (seg.pauseMs && seg.pauseMs > 0) pauseSeconds += seg.pauseMs / 1000;
      else if (seg.text) charCount += seg.text.length;
    }
    const speechSeconds = charCount / (14 * Math.max(0.5, baseRate));
    setEstimatedTotal(Math.max(1, speechSeconds + pauseSeconds));
    setElapsed(0);

    setState("speaking");
    setActiveIndex(sentences.length > 0 ? startSentence : -1);
    sentenceCursorRef.current = startSentence;
    cursorRef.current = startSegment;
    skipToSegmentRef.current = null;

    const silentMode = getSilentMode(effectiveLang);

    const playNext = () => {
      if (playbackId !== playbackIdRef.current) return;

      // Honour pending skip request.
      if (skipToSegmentRef.current !== null) {
        cursorRef.current = skipToSegmentRef.current;
        skipToSegmentRef.current = null;
        const newSentence = segMap[cursorRef.current] ?? sentences.length - 1;
        sentenceCursorRef.current = newSentence;
        setActiveIndex(newSentence);
      }

      if (cursorRef.current >= segments.length) {
        setState("idle");
        setActiveIndex(-1);
        setElapsed(estimatedTotal); // snap to 100% on natural completion
        restorePreviousFocus();
        return;
      }
      const seg = segments[cursorRef.current++];

      // In silent mode, replace text segments with a timed pause matching the
      // estimated speech duration, so highlight progresses without audio.
      const isSilentTextSeg = silentMode && !!seg.text && (!seg.pauseMs || seg.pauseMs === 0);
      const effectiveSeg: UtteranceSegment = isSilentTextSeg
        ? {
            pauseMs: Math.max(
              120,
              Math.round(
                ((seg.text?.length ?? 0) /
                  (14 * Math.max(0.5, baseRate * (seg.rateMultiplier ?? 1)))) *
                  1000,
              ),
            ),
          }
        : seg;

      if (effectiveSeg.pauseMs && effectiveSeg.pauseMs > 0) {
        // Sentence-break detection only applies to *real* pause segments,
        // not to silent-mode text-as-pause stubs.
        const isSentenceBreak = !isSilentTextSeg && effectiveSeg.pauseMs >= 250;
        const after = () => {
          if (playbackId !== playbackIdRef.current) return;
          pauseDeadlineRef.current = null;
          pauseRemainingRef.current = null;
          pauseAfterRef.current = null;
          if (isSentenceBreak) {
            sentenceCursorRef.current = Math.min(
              sentences.length - 1,
              sentenceCursorRef.current + 1,
            );
            setActiveIndex(sentenceCursorRef.current);
          }
          playNext();
        };
        pauseAfterRef.current = after;
        pauseDeadlineRef.current = Date.now() + effectiveSeg.pauseMs;
        pauseRemainingRef.current = null;
        pauseTimerRef.current = window.setTimeout(after, effectiveSeg.pauseMs);
        return;
      }

      const u = new SpeechSynthesisUtterance(applyLexicon(seg.text ?? "", effectiveLang));
      u.lang = effectiveLang;
      if (voice) u.voice = voice;
      u.rate = Math.max(0.1, Math.min(2, baseRate * (seg.rateMultiplier ?? 1)));
      u.pitch = pitch;
      u.onend = () => {
        if (playbackId !== playbackIdRef.current) return;
        playNext();
      };
      u.onerror = () => {
        if (playbackId !== playbackIdRef.current) return;
        setState("idle");
        setActiveIndex(-1);
        restorePreviousFocus();
      };
      utteranceRef.current = u;
      synth.speak(u);
    };

    playNextRef.current = playNext;
    playNext();
  };

  const handlePause = () => {
    // Pause the speech itself.
    try {
      window.speechSynthesis.pause();
    } catch {
      /* noop */
    }
    // Freeze any in-flight silent pause timer so activeIndex doesn't advance
    // while the user is paused.
    if (pauseTimerRef.current !== null && pauseDeadlineRef.current !== null) {
      window.clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
      pauseRemainingRef.current = Math.max(
        0,
        pauseDeadlineRef.current - Date.now(),
      );
    }
    setState("paused");
  };

  const handleResume = () => {
    try {
      window.speechSynthesis.resume();
    } catch {
      /* noop */
    }
    // Resume a frozen silent pause with its remaining time.
    if (
      pauseRemainingRef.current !== null &&
      pauseAfterRef.current !== null &&
      pauseTimerRef.current === null
    ) {
      const remaining = pauseRemainingRef.current;
      const after = pauseAfterRef.current;
      pauseDeadlineRef.current = Date.now() + remaining;
      pauseRemainingRef.current = null;
      pauseTimerRef.current = window.setTimeout(after, remaining);
    }
    setState("speaking");
  };

  const handleStop = () => {
    playbackIdRef.current++; // invalidate any pending callbacks
    cancelAll();
    setState("idle");
    setActiveIndex(-1);
    setElapsed(0);
    restorePreviousFocus();
  };

  const handleSkipNext = () => {
    if (state === "idle") return;
    const sentStart = sentenceSegmentStartRef.current;
    if (sentStart.length === 0 || !playNextRef.current) return;
    const nextSentence = sentenceCursorRef.current + 1;
    // If already at the last sentence, stop playback cleanly.
    if (nextSentence >= sentences.length || nextSentence >= sentStart.length) {
      handleStop();
      return;
    }
    skipToSegmentRef.current = sentStart[nextSentence];

    // Cancel pending pause timer and any current utterance.
    if (pauseTimerRef.current !== null) {
      window.clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    // Detach onend so cancel() doesn't terminate the chain prematurely.
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
    }
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }

    // If paused, the synth was paused; cancel resets state. Resume not needed.
    if (state === "paused") {
      setState("speaking");
    }

    // Restart the chain — playNext will consume skipToSegmentRef and jump.
    const fn = playNextRef.current;
    window.setTimeout(() => fn(), 30);
  };

  const baseBtn =
    "flex h-8 w-8 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const stateAnnouncement =
    state === "speaking"
      ? "Lecture audio en cours."
      : state === "paused"
        ? "Lecture audio en pause."
        : "";

  return (
    <div className={className}>
      <p className={textClassName}>
        {sentences.length === 0
          ? fullText
          : sentences.map((s, i) => {
              const isActive = i === activeIndex;
              const activeClass =
                state === "paused"
                  ? "rounded-md bg-primary/10 px-1 text-foreground ring-1 ring-dashed ring-primary/60 transition-colors"
                  : "rounded-md bg-primary/15 px-1 text-foreground transition-colors";
              return (
                <span
                  key={`${s.start}-${i}`}
                  ref={(el) => {
                    sentenceRefs.current[i] = el;
                  }}
                  tabIndex={-1}
                  className={`${
                    isActive ? activeClass : "transition-colors"
                  } outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background rounded-md`}
                  aria-current={isActive ? (state === "paused" ? "false" : "true") : undefined}
                >
                  {isActive && state === "paused" && (
                    <Pause
                      className="mr-1 inline h-3 w-3 align-[-1px] text-primary"
                      aria-hidden="true"
                    />
                  )}
                  {s.text}
                  {i < sentences.length - 1 ? " " : ""}
                </span>
              );
            })}
      </p>

      {state === "paused" && (
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
          <Pause className="h-3 w-3" aria-hidden="true" />
          <span>En pause</span>
        </div>
      )}

      {/* Live region for screen readers, announces playback state changes */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {stateAnnouncement}
      </div>

      {supported && state !== "idle" && estimatedTotal > 0 && (() => {
        const clamped = Math.min(elapsed, estimatedTotal);
        const pct = Math.round((clamped / estimatedTotal) * 100);
        const remaining = Math.max(0, estimatedTotal - clamped);
        const fmt = (s: number) => {
          const m = Math.floor(s / 60);
          const sec = Math.floor(s % 60);
          return `${m}:${sec.toString().padStart(2, "0")}`;
        };
        return (
          <div className="mt-2" aria-label="Progression de la lecture audio">
            <div
              className="h-1 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-valuetext={`${pct} pour cent lu, ${fmt(remaining)} restant`}
            >
              <div
                className={`h-full rounded-full transition-[width] duration-200 ease-linear ${
                  state === "paused" ? "bg-primary/40" : "bg-primary"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted-foreground">
              <span>{fmt(clamped)}</span>
              <span>-{fmt(remaining)}</span>
            </div>
          </div>
        );
      })()}

      {supported && (
        <div
          className="mt-2 flex items-center gap-1"
          role="group"
          aria-label="Contrôles du guidage audio"
        >
          {state === "idle" ? (
            <button
              type="button"
              onClick={() => handlePlay(0)}
              aria-label="Lire à voix haute"
              aria-pressed={false}
              title="Guidage audio"
              className={`${baseBtn} border-border bg-background text-muted-foreground hover:bg-muted`}
            >
              <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : (
            <>
              {state === "speaking" ? (
                <button
                  type="button"
                  onClick={handlePause}
                  aria-label="Mettre la lecture en pause"
                  aria-pressed={true}
                  title="Pause"
                  className={`${baseBtn} border-primary bg-primary text-primary-foreground`}
                >
                  <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResume}
                  aria-label="Reprendre la lecture"
                  aria-pressed={true}
                  title="Reprendre la lecture"
                  className={`${baseBtn} border-primary bg-primary text-primary-foreground animate-pulse`}
                >
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handlePlay(Math.max(0, sentenceCursorRef.current))}
                aria-label="Répéter la phrase en cours"
                title="Répéter la phrase en cours"
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Répéter</span>
              </button>
              <button
                type="button"
                onClick={handleSkipNext}
                aria-label="Aller à l'étape suivante"
                title="Aller à l'étape suivante"
                className={`${baseBtn} border-border bg-background text-muted-foreground hover:bg-muted`}
              >
                <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleStop}
                aria-label="Arrêter la lecture audio"
                title="Arrêter"
                className={`${baseBtn} border-border bg-background text-muted-foreground hover:bg-muted`}
              >
                <Square className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SpeakableText;
