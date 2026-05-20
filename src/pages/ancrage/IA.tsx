import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Leaf } from "lucide-react";

const suggestions = [
  "Organise ma journée",
  "Prépare ma semaine",
  "Que manque-t-il ?",
  "Fais ma checklist",
  "Idées de repas",
  "Activités enfants",
  "Routine retour au calme",
  "Aide-moi à gérer une surcharge",
];

type Msg = { role: "user" | "assistant"; text: string };

const fakeReply = (q: string): string => {
  if (/repas|manger|menu/i.test(q))
    return "Voici trois idées douces pour ce soir :\n\n• Pâtes au pesto + carottes râpées 🌿\n• Soupe potiron + tartines fromage\n• Œufs brouillés + pain grillé + compote\n\nJe peux préparer la liste de courses si tu veux ?";
  if (/journ[ée]e|aujourd|prio/i.test(q))
    return "Aujourd'hui, on garde l'essentiel :\n\n1. Orthophoniste Mathis · 14h\n2. Préparer le sac d'école\n3. Temps calme après l'école\n\nLe reste peut attendre. Tu fais déjà beaucoup. 💚";
  if (/surcharge|d[ée]bord/i.test(q))
    return "Respire avec moi.\n\nInspire 4s · garde 4s · expire 6s.\n\nIdentifie UNE chose qui peut attendre demain. Délègue-la (à toi-même, à plus tard). Le reste tiendra.";
  return "Je suis là. Dis-m'en un peu plus, et on avance ensemble — étape par étape, sans pression.";
};

const IA = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", text: fakeReply(text) }]);
    }, 600);
  };

  if (messages.length === 0) {
    return (
      <div className="space-y-8 pb-20">
        <header className="pt-4 text-center">
          <span
            className="inline-flex h-14 w-14 items-center justify-center rounded-3xl"
            style={{
              background:
                "linear-gradient(135deg, var(--ancrage-sage) 0%, var(--ancrage-sage-deep) 100%)",
            }}
          >
            <Sparkles className="h-6 w-6 text-white" />
          </span>
          <h1
            className="mt-4 text-[28px] font-semibold leading-tight tracking-tight"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            Bonjour Élodie 👋
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: "var(--ancrage-ink-soft)" }}>
            Comment puis-je vous aider aujourd'hui ?
          </p>
        </header>

        <div className="grid grid-cols-2 gap-2.5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-2xl p-4 text-left text-[13px] font-medium transition-all active:scale-[0.98]"
              style={{
                background: "var(--ancrage-surface)",
                border: "1px solid var(--ancrage-soft)",
                color: "var(--ancrage-ink)",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <Composer input={input} setInput={setInput} send={send} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
      <header className="flex items-center gap-3 pb-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, var(--ancrage-sage) 0%, var(--ancrage-sage-deep) 100%)",
          }}
        >
          <Sparkles className="h-4 w-4 text-white" />
        </span>
        <div>
          <p className="text-[14px] font-semibold">Ancrage IA</p>
          <p className="text-[11px]" style={{ color: "var(--ancrage-sage-deep)" }}>
            • en ligne
          </p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto py-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-[14px] leading-relaxed"
              style={
                m.role === "user"
                  ? {
                      background: "var(--ancrage-sage-deep)",
                      color: "#fff",
                      borderBottomRightRadius: "6px",
                    }
                  : {
                      background: "var(--ancrage-surface)",
                      color: "var(--ancrage-ink)",
                      border: "1px solid var(--ancrage-soft)",
                      borderBottomLeftRadius: "6px",
                    }
              }
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <Composer input={input} setInput={setInput} send={send} />
    </div>
  );
};

const Composer = ({
  input,
  setInput,
  send,
}: {
  input: string;
  setInput: (v: string) => void;
  send: (v: string) => void;
}) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      send(input);
    }}
    className="sticky bottom-0 flex items-center gap-2 rounded-3xl p-2"
    style={{
      background: "var(--ancrage-surface)",
      border: "1px solid var(--ancrage-soft)",
      boxShadow: "0 8px 24px -16px rgba(46,52,46,0.18)",
    }}
  >
    <Leaf className="ml-2 h-4 w-4" style={{ color: "var(--ancrage-sage-deep)" }} />
    <input
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Écris ton message…"
      className="flex-1 bg-transparent py-2 text-[14px] outline-none placeholder:opacity-50"
    />
    <button
      type="submit"
      disabled={!input.trim()}
      className="flex h-10 w-10 items-center justify-center rounded-2xl text-white transition-opacity disabled:opacity-40"
      style={{ background: "var(--ancrage-sage-deep)" }}
      aria-label="Envoyer"
    >
      <Send className="h-4 w-4" />
    </button>
  </form>
);

export default IA;
