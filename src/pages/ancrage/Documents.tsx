import { useState } from "react";
import { Search, Plus, FileText, Heart, GraduationCap, Landmark, Shield, Folder, ChevronRight } from "lucide-react";
import { Card, SectionTitle, Pill } from "./ui";

const categories = [
  { key: "sante", label: "Santé", icon: Heart, count: 12, tone: "blush" as const },
  { key: "ecole", label: "École", icon: GraduationCap, count: 8, tone: "sage" as const },
  { key: "caf", label: "CAF", icon: Landmark, count: 5, tone: "sand" as const },
  { key: "admin", label: "Administratif", icon: FileText, count: 14, tone: "sky" as const },
  { key: "assurances", label: "Assurances", icon: Shield, count: 4, tone: "sage" as const },
];

const recent = [
  { name: "Ordonnance Mathis", cat: "Santé", date: "12 mai", tone: "blush" as const },
  { name: "Attestation CAF avril", cat: "CAF", date: "8 mai", tone: "sand" as const },
  { name: "Bulletin Maëlys T2", cat: "École", date: "5 mai", tone: "sage" as const },
  { name: "Carte mutuelle 2026", cat: "Assurances", date: "2 mai", tone: "sage" as const },
];

const Documents = () => {
  const [q, setQ] = useState("");
  return (
    <div className="space-y-7">
      <header>
        <h1
          className="text-[26px] font-semibold leading-tight tracking-tight"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Coffre-fort
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: "var(--ancrage-ink-soft)" }}>
          Tes papiers importants, à portée de main.
        </p>
      </header>

      <div
        className="flex items-center gap-2 rounded-2xl px-4 py-3"
        style={{ background: "var(--ancrage-surface)", border: "1px solid var(--ancrage-soft)" }}
      >
        <Search className="h-4 w-4" style={{ color: "var(--ancrage-ink-soft)" }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un document…"
          className="flex-1 bg-transparent text-[14px] outline-none placeholder:opacity-60"
        />
      </div>

      <section>
        <SectionTitle>Catégories</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          {categories.map((c) => (
            <Card key={c.key} className="!p-4">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "var(--ancrage-soft)" }}
                >
                  <c.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold">{c.label}</p>
                  <p className="text-[11px]" style={{ color: "var(--ancrage-ink-soft)" }}>
                    {c.count} documents
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle action={<Pill tone="sage">Récents</Pill>}>Derniers ajouts</SectionTitle>
        <div className="space-y-2.5">
          {recent
            .filter((r) => r.name.toLowerCase().includes(q.toLowerCase()))
            .map((r) => (
              <Card key={r.name} className="flex items-center gap-3 !p-4">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "var(--ancrage-soft)" }}
                >
                  <Folder className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[14px] font-medium">{r.name}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Pill tone={r.tone}>{r.cat}</Pill>
                    <span className="text-[11px]" style={{ color: "var(--ancrage-ink-soft)" }}>
                      {r.date}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" style={{ color: "var(--ancrage-ink-soft)" }} />
              </Card>
            ))}
        </div>
      </section>

      <button
        className="fixed bottom-28 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_12px_30px_-10px_rgba(124,155,120,0.7)] active:scale-95"
        style={{ background: "var(--ancrage-sage-deep)" }}
        aria-label="Ajouter un document"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
};

export default Documents;
