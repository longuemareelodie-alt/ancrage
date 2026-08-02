import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Users,
  FileText,
  Sprout,
  PenLine,
  CalendarDays,
  Pill,
  Phone,
  LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Recherche universelle — une seule barre pour tout retrouver :
 * enfant, document, support, journal, rendez-vous, traitement, professionnel.
 * L'utilisatrice ne doit jamais se demander « où était cette info ? ».
 */

type Result = {
  id: string;
  label: string;
  detail?: string;
  group: string;
  icon: LucideIcon;
  to: string;
};

const like = (q: string) => `%${q.replace(/[%_]/g, "")}%`;

const RechercheGlobale = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }

    let alive = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      const p = like(q);
      const [kids, docs, supports, journal, events, meds, contacts] = await Promise.all([
        supabase.from("family_medical_profiles").select("id, first_name, relation").ilike("first_name", p).limit(5),
        supabase.from("vault_documents").select("id, name, category").ilike("name", p).limit(5),
        supabase.from("autonomy_supports").select("id, title, support_type").ilike("title", p).limit(5),
        supabase.from("private_journal_entries").select("id, content, created_at").ilike("content", p).limit(5),
        supabase.from("agenda_events").select("id, title, event_date").ilike("title", p).limit(5),
        supabase.from("medications").select("id, name, dosage").ilike("name", p).limit(5),
        supabase.from("child_contacts").select("id, name, role, profile_id").ilike("name", p).limit(5),
      ]);

      if (!alive) return;

      const out: Result[] = [
        ...(kids.data ?? []).map((r) => ({
          id: `kid-${r.id}`,
          label: r.first_name,
          detail: r.relation,
          group: "Ma famille",
          icon: Users,
          to: `/famille/${r.id}`,
        })),
        ...(supports.data ?? []).map((r) => ({
          id: `sup-${r.id}`,
          label: r.title,
          detail: r.support_type,
          group: "Supports",
          icon: Sprout,
          to: `/autonomie/support/${r.id}`,
        })),
        ...(docs.data ?? []).map((r) => ({
          id: `doc-${r.id}`,
          label: r.name,
          detail: r.category,
          group: "Documents",
          icon: FileText,
          to: "/famille/coffre",
        })),
        ...(events.data ?? []).map((r) => ({
          id: `evt-${r.id}`,
          label: r.title,
          detail: r.event_date,
          group: "Agenda",
          icon: CalendarDays,
          to: "/organisation",
        })),
        ...(meds.data ?? []).map((r) => ({
          id: `med-${r.id}`,
          label: r.name,
          detail: r.dosage ?? undefined,
          group: "Traitements",
          icon: Pill,
          to: "/sante/medicaments",
        })),
        ...(contacts.data ?? []).map((r) => ({
          id: `ctc-${r.id}`,
          label: r.name,
          detail: r.role,
          group: "Professionnels",
          icon: Phone,
          to: `/famille/${r.profile_id}`,
        })),
        ...(journal.data ?? []).map((r) => ({
          id: `jrn-${r.id}`,
          label: r.content.slice(0, 60) + (r.content.length > 60 ? "…" : ""),
          detail: new Date(r.created_at).toLocaleDateString("fr-FR"),
          group: "Journal",
          icon: PenLine,
          to: "/lies-autrement/journal",
        })),
      ];

      setResults(out);
      setLoading(false);
    }, 250);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Result[]>();
    results.forEach((r) => {
      map.set(r.group, [...(map.get(r.group) ?? []), r]);
    });
    return [...map.entries()];
  }, [results]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-lg px-6 pb-10 pt-10">
        <h1 className="font-serif text-3xl text-foreground">Rechercher</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Un enfant, un document, un support, une note… tout est ici.
        </p>

        <div className="mt-6 flex items-center gap-3 rounded-[20px] border border-border/70 bg-card px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans Éclosia"
            aria-label="Rechercher dans Éclosia"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="mt-8 space-y-8">
          {query.trim().length >= 2 && !loading && results.length === 0 && (
            <p className="rounded-[20px] border border-dashed border-border bg-card/50 px-5 py-6 text-center text-sm text-muted-foreground">
              Rien trouvé pour « {query.trim()} ».
            </p>
          )}

          {grouped.map(([group, items]) => (
            <section key={group}>
              <p className="pb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {group}
              </p>
              <ul className="space-y-2">
                {items.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={r.to}
                      className="flex items-center gap-4 rounded-[20px] border border-border/70 bg-card px-5 py-4 transition-all active:scale-[0.99]"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-secondary/60">
                        <r.icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {r.label}
                        </span>
                        {r.detail && (
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {r.detail}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RechercheGlobale;
