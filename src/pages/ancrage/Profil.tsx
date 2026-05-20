import { User, Bell, Settings, Lock, CreditCard, HelpCircle, ShieldCheck, ChevronRight, LogOut } from "lucide-react";
import { Card, SectionTitle, Pill } from "./ui";

const groups = [
  {
    title: "Compte",
    items: [
      { icon: User, label: "Mon compte", hint: "Élodie · elodie@email.fr" },
      { icon: Bell, label: "Notifications", hint: "Quotidiennes" },
      { icon: Settings, label: "Préférences", hint: "Langue, affichage" },
    ],
  },
  {
    title: "Sécurité & abonnement",
    items: [
      { icon: Lock, label: "Sécurité", hint: "Mot de passe, 2FA" },
      { icon: CreditCard, label: "Abonnement", hint: "Accès à vie · actif", badge: "Vie" as const },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Aide & contact" },
      { icon: ShieldCheck, label: "Confidentialité" },
    ],
  },
];

const Profil = () => (
  <div className="space-y-7">
    <header className="flex items-center gap-4">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-3xl text-2xl font-semibold"
        style={{
          background:
            "linear-gradient(135deg, var(--ancrage-sage) 0%, var(--ancrage-sage-deep) 100%)",
          color: "#fff",
        }}
      >
        É
      </span>
      <div>
        <h1
          className="text-[24px] font-semibold leading-tight"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Élodie
        </h1>
        <p className="text-[13px]" style={{ color: "var(--ancrage-ink-soft)" }}>
          Maman de Mathis, Maëlys & Lilyanna
        </p>
        <div className="mt-1.5">
          <Pill tone="sage">✨ Accès à vie</Pill>
        </div>
      </div>
    </header>

    {groups.map((g) => (
      <section key={g.title}>
        <SectionTitle>{g.title}</SectionTitle>
        <Card className="!p-2">
          <ul>
            {g.items.map((it, i) => (
              <li key={it.label}>
                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[var(--ancrage-soft)]">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: "var(--ancrage-soft)" }}
                  >
                    <it.icon className="h-[16px] w-[16px]" strokeWidth={1.8} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium">{it.label}</p>
                    {"hint" in it && it.hint && (
                      <p className="text-[12px]" style={{ color: "var(--ancrage-ink-soft)" }}>
                        {it.hint}
                      </p>
                    )}
                  </div>
                  {"badge" in it && it.badge && <Pill tone="sage">{it.badge}</Pill>}
                  <ChevronRight className="h-4 w-4" style={{ color: "var(--ancrage-ink-soft)" }} />
                </button>
                {i < g.items.length - 1 && (
                  <div className="mx-3 h-px" style={{ background: "var(--ancrage-soft)" }} />
                )}
              </li>
            ))}
          </ul>
        </Card>
      </section>
    ))}

    <button
      className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-semibold transition-colors"
      style={{
        background: "var(--ancrage-surface)",
        border: "1px solid var(--ancrage-soft)",
        color: "#A75A48",
      }}
    >
      <LogOut className="h-4 w-4" /> Se déconnecter
    </button>

    <p className="pt-2 text-center text-[11px]" style={{ color: "var(--ancrage-ink-soft)" }}>
      Ancrage · v1.0 · fait avec douceur 🌿
    </p>
  </div>
);

export default Profil;
