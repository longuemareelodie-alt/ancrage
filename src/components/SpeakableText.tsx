import { useEffect, useRef, useState } from "react";
import { Volume2, Pause, Play, Square, RotateCcw, SkipForward } from "lucide-react";
import {
  RATE_VALUES,
  getSpeechRate,
  getSpeechLang,
  getSpeechPitch,
  loadVoices,
  resolveVoice,
  buildUtteranceSegments,
  type UtteranceSegment,
} from "@/lib/speechPrefs";

type SpeechState = "idle" | "speaking" | "paused";

interface SpeakableTextProps {
  text: string;
  /** Optional secondary text (e.g. hint) appended after the main text. */
  hint?: string;
  lang?: string;
  className?: string;
  textClassName?: string;
}

/**
 * Splits a string into sentences while keeping their trailing punctuation,
 * and tracks the start offset of each sentence in the original string.
 */
interface Sentence {
  text: string;
  start: number;
  end: number;
}

function splitSentences(input: string): Sentence[] {
  const result: Sentence[] = [];
  // Match a run of non-terminator chars + the terminator (or end of string).
  const regex = /[^.!?…]+[.!?…]+|\S[^.!?…]*$/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(input)) !== null) {
    const raw = match[0];
    const trimmedStart = match.index + (raw.length - raw.trimStart().length);
    const text = raw.trim();
    if (!text) continue;
    result.push({
      text,
      start: trimmedStart,
      end: trimmedStart + text.length,
    });
  }
  if (result.length === 0 && input.trim()) {
    const t = input.trim();
    const start = input.indexOf(t);
    result.push({ text: t, start, end: start + t.length });
  }
  return result;
}

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

  const fullText = hint ? `${text}. ${hint}` : text;
  const sentences = splitSentences(fullText);

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

  const cancelAll = () => {
    if (pauseTimerRef.current !== null) {
      window.clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }
  };

  const handlePlay = async () => {
    if (!supported) return;
    cancelAll();

    const playbackId = ++playbackIdRef.current;
    const synth = window.speechSynthesis;
    const effectiveLang = lang ?? getSpeechLang();

    const voices = await loadVoices();
    if (playbackId !== playbackIdRef.current) return; // cancelled while loading
    const voice = resolveVoice(voices, effectiveLang);
    const baseRate = RATE_VALUES[getSpeechRate()];
    const pitch = getSpeechPitch();

    const segments: UtteranceSegment[] = buildUtteranceSegments(fullText);

    // Build mapping: each segment -> its sentence index.
    // Sentence breaks are pause segments >= 250ms; everything before is sentence N.
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

    // Estimate total duration: ~14 chars/second at rate 1, plus segment pauses.
    let charCount = 0;
    let pauseSeconds = 0;
    for (const seg of segments) {
      if (seg.pauseMs && seg.pauseMs > 0) pauseSeconds += seg.pauseMs / 1000;
      else if (seg.text) charCount += seg.text.length;
    }
    const speechSeconds = charCount / (14 * Math.max(0.5, baseRate));
    setEstimatedTotal(Math.max(1, speechSeconds + pauseSeconds));
    setElapsed(0);

    setState("speaking");
    setActiveIndex(sentences.length > 0 ? 0 : -1);
    sentenceCursorRef.current = 0;
    cursorRef.current = 0;
    skipToSegmentRef.current = null;

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
        return;
      }
      const seg = segments[cursorRef.current++];

      if (seg.pauseMs && seg.pauseMs > 0) {
        const isSentenceBreak = seg.pauseMs >= 250;
        pauseTimerRef.current = window.setTimeout(() => {
          if (playbackId !== playbackIdRef.current) return;
          if (isSentenceBreak) {
            sentenceCursorRef.current = Math.min(
              sentences.length - 1,
              sentenceCursorRef.current + 1,
            );
            setActiveIndex(sentenceCursorRef.current);
          }
          playNext();
        }, seg.pauseMs);
        return;
      }

      const u = new SpeechSynthesisUtterance(seg.text ?? "");
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
      };
      utteranceRef.current = u;
      synth.speak(u);
    };

    playNextRef.current = playNext;
    playNext();
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setState("paused");
  };

  const handleResume = () => {
    window.speechSynthesis.resume();
    setState("speaking");
  };

  const handleStop = () => {
    playbackIdRef.current++; // invalidate any pending callbacks
    cancelAll();
    setState("idle");
    setActiveIndex(-1);
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
              return (
                <span
                  key={`${s.start}-${i}`}
                  className={
                    isActive
                      ? "rounded-md bg-primary/15 px-1 text-foreground transition-colors"
                      : "transition-colors"
                  }
                >
                  {s.text}
                  {i < sentences.length - 1 ? " " : ""}
                </span>
              );
            })}
      </p>

      {/* Live region for screen readers, announces playback state changes */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {stateAnnouncement}
      </div>

      {supported && (
        <div
          className="mt-2 flex items-center gap-1"
          role="group"
          aria-label="Contrôles du guidage audio"
        >
          {state === "idle" ? (
            <button
              type="button"
              onClick={handlePlay}
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
                  title="Reprendre"
                  className={`${baseBtn} border-primary bg-primary text-primary-foreground`}
                >
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={handlePlay}
                aria-label="Répéter la lecture depuis le début"
                title="Répéter"
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
