import { useEffect, useState } from "react";
import { BookOpen, Plus, Trash2, Volume2, Type, Hash } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  type PronunciationEntry,
  type PronunciationMode,
  getLexicon,
  setLexicon,
  newEntry,
  applyLexicon,
  onLexiconChange,
} from "@/lib/pronunciationLexicon";
import {
  RATE_VALUES,
  getSpeechRate,
  getSpeechLang,
  getSpeechPitch,
  loadVoices,
  resolveVoice,
  LANG_LABELS,
  type SpeechLang,
} from "@/lib/speechPrefs";

const MAX_ENTRIES = 50;

const PronunciationLexicon = ({ className = "" }: { className?: string }) => {
  const [lang, setLang] = useState<SpeechLang>(() => getSpeechLang());
  const [entries, setEntries] = useState<PronunciationEntry[]>(() => getLexicon());

  // Reload when the active language changes (SpeechPrefs dispatches this event).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPrefs = () => {
      const next = getSpeechLang();
      setLang(next);
      setEntries(getLexicon(next));
    };
    window.addEventListener("calm-speech-prefs-change", onPrefs);
    return () => window.removeEventListener("calm-speech-prefs-change", onPrefs);
  }, []);

  // Reload when the lexicon itself changes (e.g. another tab).
  useEffect(() => onLexiconChange(() => setEntries(getLexicon(lang))), [lang]);

  const persist = (next: PronunciationEntry[]) => {
    setEntries(next);
    setLexicon(next, lang);
  };

  const updateField = <K extends keyof PronunciationEntry>(
    id: string,
    field: K,
    value: PronunciationEntry[K],
  ) => {
    persist(entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const addEntry = () => {
    if (entries.length >= MAX_ENTRIES) return;
    persist([...entries, newEntry()]);
  };

  const deleteEntry = (id: string) => {
    persist(entries.filter((e) => e.id !== id));
  };

  const testEntry = async (entry: PronunciationEntry) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const sample = entry.word ? `${entry.word}.` : (entry.replacement || "");
    if (!sample.trim()) return;
    const spoken = applyLexicon(sample, [entry]);
    const synth = window.speechSynthesis;
    synth.cancel();
    const voices = await loadVoices();
    const voice = resolveVoice(voices, lang);
    const u = new SpeechSynthesisUtterance(spoken);
    u.lang = lang;
    if (voice) u.voice = voice;
    u.rate = RATE_VALUES[getSpeechRate(lang)];
    u.pitch = getSpeechPitch(lang);
    synth.speak(u);
  };

  return (
    <div className={`space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
          <div>
            <h3 className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              Lexique de prononciation
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-normal text-muted-foreground">
                {LANG_LABELS[lang]}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Apprends à la voix comment lire certains mots (ou les épeler) pour cette langue.
              Le texte affiché reste inchangé.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={addEntry}
          disabled={entries.length >= MAX_ENTRIES}
          className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Ajouter
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
          Aucune correction pour l'instant. Ajoute par exemple
          <span className="mx-1 rounded bg-background px-1 font-mono">Hugo → Ugo</span>
          ou <span className="mx-1 rounded bg-background px-1 font-mono">SNCF</span>
          en mode « épeler ».
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="rounded-xl border border-border bg-background/40 p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <label className="flex-1 text-xs">
                  <span className="mb-1 block font-medium text-muted-foreground">
                    Mot écrit
                  </span>
                  <input
                    type="text"
                    value={entry.word}
                    onChange={(e) => updateField(entry.id, "word", e.target.value)}
                    placeholder="ex. Hugo"
                    className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>
                <span className="hidden self-center text-muted-foreground sm:block">→</span>
                <label className="flex-1 text-xs">
                  <span className="mb-1 block font-medium text-muted-foreground">
                    {entry.mode === "spell" ? "Lettres à épeler" : "Lu comme"}
                  </span>
                  <input
                    type="text"
                    value={entry.replacement}
                    onChange={(e) =>
                      updateField(entry.id, "replacement", e.target.value)
                    }
                    placeholder={entry.mode === "spell" ? "ex. SNCF" : "ex. Ugo"}
                    className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                <div
                  role="radiogroup"
                  aria-label="Mode"
                  className="flex overflow-hidden rounded-full border border-border"
                >
                  {(["phonetic", "spell"] as PronunciationMode[]).map((m) => {
                    const active = entry.mode === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => updateField(entry.id, "mode", m)}
                        className={`flex items-center gap-1 px-2.5 py-1 font-medium transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {m === "phonetic" ? (
                          <>
                            <Type className="h-3 w-3" aria-hidden="true" /> Lecture
                          </>
                        ) : (
                          <>
                            <Hash className="h-3 w-3" aria-hidden="true" /> Épeler
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>

                <label className="flex items-center gap-1.5 text-muted-foreground">
                  <Switch
                    checked={entry.wholeWord}
                    onCheckedChange={(c) => updateField(entry.id, "wholeWord", c)}
                    aria-label="Mot entier seulement"
                  />
                  Mot entier
                </label>

                <label className="flex items-center gap-1.5 text-muted-foreground">
                  <Switch
                    checked={entry.caseSensitive}
                    onCheckedChange={(c) => updateField(entry.id, "caseSensitive", c)}
                    aria-label="Sensible à la casse"
                  />
                  Maj/min
                </label>

                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => testEntry(entry)}
                    disabled={!entry.word.trim()}
                    aria-label="Tester cette prononciation"
                    title="Tester"
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 font-medium text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Volume2 className="h-3 w-3" aria-hidden="true" />
                    Tester
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteEntry(entry.id)}
                    aria-label="Supprimer cette entrée"
                    title="Supprimer"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {entries.length >= MAX_ENTRIES && (
        <p className="text-[11px] text-muted-foreground">
          Limite atteinte ({MAX_ENTRIES} entrées). Supprime-en une pour en ajouter
          une nouvelle.
        </p>
      )}
    </div>
  );
};

export default PronunciationLexicon;
