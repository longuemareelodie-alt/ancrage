import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HubShell from "@/components/hub/HubShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronRight, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { emitPulseChange } from "@/lib/pulseBus";

/**
 * 💼 Business — un outil d'organisation, pas un CRM.
 * Tout est privé. Aucun envoi automatique, aucun objectif imposé, aucun classement.
 */
type Kind = "prospect" | "cliente" | "partenaire";
type Contact = {
  id: string;
  kind: Kind;
  first_name: string;
  last_name: string | null;
  instagram: string | null;
  tiktok: string | null;
  email: string | null;
  source: string | null;
  stage: string;
  pipeline_model: string;
  status: string | null;
  offer: string | null;
  first_contact_date: string | null;
  last_exchange_date: string | null;
  next_action: string | null;
  followup_date: string | null;
  personal_goal: string | null;
  notes: string | null;
};
type Interaction = { type: string; amount_cents: number | null; happened_on: string };

const PIPELINES: Record<string, { label: string; stages: string[] }> = {
  classique: {
    label: "Activité classique",
    stages: ["Nouveau contact", "Conversation", "Intéressée", "Offre présentée", "Réflexion", "Cliente", "Fidélisation"],
  },
  mlm: {
    label: "MLM / affiliation",
    stages: ["Prospect", "Découverte", "Présentation", "Réflexion", "Inscription", "Cliente / Partenaire"],
  },
};
const CLIENT_STATUS = ["Cliente active", "À suivre", "Ancienne cliente"];

const TABS = [
  ["relances", "Relances"],
  ["contacts", "Contacts"],
  ["pipeline", "Pipeline"],
  ["clientes", "Clientes"],
  ["equipe", "Équipe"],
  ["activite", "Activité"],
] as const;

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (d: string | null) =>
  d ? Math.round((Date.parse(today()) - Date.parse(d)) / 86400000) : null;
const eur = (c: number) => (c / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

const empty = (kind: Kind, model: string): Partial<Contact> => ({
  kind,
  first_name: "",
  pipeline_model: model,
  stage: PIPELINES[model].stages[0],
  status: kind === "cliente" ? CLIENT_STATUS[0] : null,
});

const Business = () => {
  const { tab = "relances" } = useParams();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [inter, setInter] = useState<Interaction[]>([]);
  const [editing, setEditing] = useState<Partial<Contact> | null>(null);
  const [model, setModel] = useState<string>(() => localStorage.getItem("eclosia_pipeline") || "classique");

  const load = async () => {
    const since = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const [c, i] = await Promise.all([
      supabase.from("business_contacts").select("*").order("updated_at", { ascending: false }),
      supabase.from("business_interactions").select("type, amount_cents, happened_on").gte("happened_on", since),
    ]);
    setContacts((c.data ?? []) as Contact[]);
    setInter((i.data ?? []) as Interaction[]);
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing?.first_name?.trim()) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { id, ...rest } = editing;
    const clean = Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, v === "" ? null : v]));
    const { error } = id
      ? await supabase.from("business_contacts").update(clean).eq("id", id)
      : await supabase.from("business_contacts").insert({ ...clean, first_name: editing.first_name!, user_id: auth.user.id });
    if (error) {
      toast({ description: "Ça n'a pas pu être enregistré. On réessaie ?" });
      return;
    }
    setEditing(null);
    toast({ description: "C'est noté." });
    load();
    emitPulseChange();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce contact ?")) return;
    await supabase.from("business_contacts").delete().eq("id", id);
    setEditing(null);
    load();
    emitPulseChange();
  };

  const log = async (c: Contact | null, type: string, amount_cents?: number) => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    await supabase.from("business_interactions").insert({
      user_id: auth.user.id,
      contact_id: c?.id ?? null,
      type,
      amount_cents: amount_cents ?? null,
    });
    if (c) await supabase.from("business_contacts").update({ last_exchange_date: today() }).eq("id", c.id);
    load();
  };

  const followupDone = async (c: Contact) => {
    await supabase
      .from("business_contacts")
      .update({ followup_date: null, next_action: null, last_exchange_date: today() })
      .eq("id", c.id);
    await log(null, "relance");
    toast({ description: "Relance faite. Une de moins à porter." });
    emitPulseChange();
  };

  const moveStage = async (c: Contact, dir: 1 | -1) => {
    const stages = PIPELINES[c.pipeline_model]?.stages ?? PIPELINES.classique.stages;
    const i = Math.max(0, stages.indexOf(c.stage));
    const next = stages[Math.min(stages.length - 1, Math.max(0, i + dir))];
    setContacts((all) => all.map((x) => (x.id === c.id ? { ...x, stage: next } : x)));
    await supabase.from("business_contacts").update({ stage: next }).eq("id", c.id);
    if (dir === 1 && /présent/i.test(next)) log(c, "presentation");
  };

  const due = contacts.filter((c) => c.followup_date && c.followup_date <= today());
  const soon = contacts.filter((c) => c.followup_date && c.followup_date > today());

  const Row = ({ c, sub }: { c: Contact; sub?: string }) => (
    <button
      onClick={() => setEditing(c)}
      className="flex w-full items-center gap-3 rounded-[18px] border border-border/70 bg-card px-4 py-3 text-left"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/50 text-sm font-semibold text-foreground">
        {c.first_name.slice(0, 1).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">
          {c.first_name} {c.last_name ?? ""}
        </span>
        {sub && <span className="block truncate text-xs text-muted-foreground">{sub}</span>}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <>
      <p className="pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {children}
    </>
  );

  const stats = useMemo(() => {
    const t = today();
    const count = (type: string, day?: boolean) =>
      inter.filter((i) => i.type === type && (!day || i.happened_on === t)).length;
    const weekStart = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
    return {
      day: [
        ["💬 Conversations", count("conversation", true)],
        ["📩 Relances", count("relance", true)],
        ["🛒 Ventes", count("vente", true)],
        ["👥 Nouveaux contacts", contacts.filter((c) => c.first_contact_date === t).length],
      ],
      week: [
        ["Conversations", count("conversation")],
        ["Présentations", count("presentation")],
        ["Relances", count("relance")],
        ["Clientes", contacts.filter((c) => c.kind === "cliente").length],
        ["Nouveaux contacts", contacts.filter((c) => (c.first_contact_date ?? "") >= weekStart).length],
        ["Chiffre d'affaires", eur(inter.filter((i) => i.type === "vente").reduce((s, i) => s + (i.amount_cents ?? 0), 0))],
      ],
    };
  }, [inter, contacts]);

  const addKind: Kind = tab === "clientes" ? "cliente" : tab === "equipe" ? "partenaire" : "prospect";

  return (
    <HubShell title="Business" subtitle="Ton activité, rangée. Privée, et sans pression.">
      <nav
        aria-label="Onglets Business"
        className="-mx-6 flex snap-x gap-1.5 overflow-x-auto scroll-px-6 px-6 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map(([k, l]) => (
          <Link
            key={k}
            ref={tab === k ? (el) => el?.scrollIntoView({ block: "nearest", inline: "nearest" }) : undefined}
            to={`/business/${k}`}
            className={`shrink-0 snap-start whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
              tab === k ? "border-primary bg-primary text-primary-foreground" : "border-border/70 bg-card text-foreground"
            }`}
          >
            {l}
          </Link>
        ))}
      </nav>

      {tab !== "activite" && (
        <Button className="w-full rounded-full" onClick={() => setEditing(empty(addKind, model))}>
          <Plus className="mr-1.5 h-4 w-4" />
          {addKind === "cliente" ? "Ajouter une cliente" : addKind === "partenaire" ? "Ajouter une partenaire" : "Ajouter un contact"}
        </Button>
      )}

      {tab === "relances" && (
        <>
          <div className="rounded-[20px] border border-border/70 bg-card px-5 py-4">
            <p className="text-sm font-semibold text-foreground">📩 Qui dois-je relancer ?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {due.length === 0
                ? "Personne aujourd'hui. Tu peux souffler."
                : `${due.length} personne${due.length > 1 ? "s" : ""} à relancer aujourd'hui. Elles apparaissent aussi dans ta prochaine action.`}
            </p>
          </div>
          {contacts.length === 0 && (
            <div className="rounded-[20px] border border-dashed border-border/70 px-5 py-4 text-center">
              <p className="text-sm font-semibold text-foreground">Ton espace Business est prêt. 🌸</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Ajoute ton premier contact pour organiser simplement tes conversations, relances et clientes.
              </p>
              <Button variant="outline" size="sm" className="mt-3 rounded-full" onClick={() => setEditing(empty("prospect", model))}>
                <Plus className="mr-1 h-4 w-4" />
                Ajouter mon premier contact
              </Button>
            </div>
          )}
          {due.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <Row c={c} sub={c.next_action || (c.kind === "cliente" ? "Cliente — prendre des nouvelles" : "À relancer")} />
              </div>
              <button
                onClick={() => followupDone(c)}
                aria-label={`Relance faite pour ${c.first_name}`}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/70 bg-card"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          ))}
          {soon.length > 0 && (
            <Section title="Plus tard">
              {soon.map((c) => (
                <Row key={c.id} c={c} sub={`${c.next_action ?? "Relance"} · ${new Date(c.followup_date!).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`} />
              ))}
            </Section>
          )}
        </>
      )}

      {tab === "contacts" &&
        (contacts.length === 0 ? (
          <p className="rounded-[20px] border border-dashed border-border bg-card/50 px-5 py-6 text-sm text-muted-foreground">
            Aucun contact pour l'instant. Un seul suffit pour commencer.
          </p>
        ) : (
          contacts.map((c) => {
            const d = daysAgo(c.last_exchange_date);
            return <Row key={c.id} c={c} sub={`${c.stage}${d !== null ? ` · échange il y a ${d} j` : ""}`} />;
          })
        ))}

      {tab === "pipeline" && (
        <>
          <div className="flex gap-1.5">
            {Object.entries(PIPELINES).map(([k, p]) => (
              <button
                key={k}
                onClick={() => {
                  setModel(k);
                  localStorage.setItem("eclosia_pipeline", k);
                }}
                className={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold ${
                  model === k ? "border-primary bg-primary/10 text-foreground" : "border-border/70 text-muted-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {PIPELINES[model].stages.map((stage) => {
            const list = contacts.filter((c) => c.pipeline_model === model && c.stage === stage);
            return (
              <div key={stage} className="rounded-[20px] border border-border/70 bg-card px-4 py-3">
                <p className="text-xs font-semibold text-foreground">
                  {stage} <span className="text-muted-foreground">· {list.length}</span>
                </p>
                {list.length > 0 && <div className="mt-2 space-y-1.5">
                  {list.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 rounded-xl bg-secondary/25 px-3 py-2">
                      <button onClick={() => setEditing(c)} className="min-w-0 flex-1 truncate text-left text-sm text-foreground">
                        {c.first_name} {c.last_name ?? ""}
                      </button>
                      <button onClick={() => moveStage(c, -1)} aria-label="Étape précédente" className="h-8 w-8 rounded-full border border-border/60 text-xs">←</button>
                      <button onClick={() => moveStage(c, 1)} aria-label="Étape suivante" className="h-8 w-8 rounded-full border border-border/60 text-xs">→</button>
                    </div>
                  ))}
                </div>}
              </div>
            );
          })}
        </>
      )}

      {tab === "clientes" &&
        CLIENT_STATUS.map((s) => {
          const list = contacts.filter((c) => c.kind === "cliente" && (c.status ?? CLIENT_STATUS[0]) === s);
          if (!list.length) return null;
          return (
            <Section key={s} title={s}>
              {list.map((c) => (
                <Row key={c.id} c={c} sub={[c.offer, c.followup_date && `suivi le ${new Date(c.followup_date).toLocaleDateString("fr-FR")}`].filter(Boolean).join(" · ")} />
              ))}
            </Section>
          );
        })}

      {tab === "equipe" && (
        <>
          {(() => {
            const weekEnd = new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10);
            const team = contacts.filter((c) => c.kind === "partenaire");
            const toHelp = team.filter((c) => c.followup_date && c.followup_date <= weekEnd);
            return (
              <>
                {toHelp.length > 0 && (
                  <Section title="🌱 À accompagner cette semaine">
                    {toHelp.map((c) => <Row key={c.id} c={c} sub={c.next_action ?? c.personal_goal ?? undefined} />)}
                  </Section>
                )}
                <Section title="Mon équipe">
                  {team.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Personne encore. Rien ne presse.</p>
                  ) : (
                    team.map((c) => <Row key={c.id} c={c} sub={c.status ?? c.personal_goal ?? undefined} />)
                  )}
                </Section>
              </>
            );
          })()}
        </>
      )}

      {tab === "activite" && (
        <>
          <Section title="Aujourd'hui">
            <div className="grid grid-cols-2 gap-2">
              {stats.day.map(([l, v]) => (
                <div key={l as string} className="rounded-[18px] border border-border/70 bg-card px-4 py-3">
                  <p className="text-lg font-semibold text-foreground">{v}</p>
                  <p className="text-xs text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Cette semaine">
            <div className="rounded-[20px] border border-border/70 bg-card px-5 py-2">
              {stats.week.map(([l, v]) => (
                <div key={l as string} className="flex justify-between border-b border-border/40 py-2 text-sm last:border-0">
                  <span className="text-muted-foreground">{l}</span>
                  <span className="font-semibold text-foreground">{v}</span>
                </div>
              ))}
            </div>
          </Section>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button size="sm" variant="secondary" onClick={() => log(null, "conversation").then(() => toast({ description: "Conversation notée." }))}>
              + Conversation
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const v = prompt("Montant de la vente (€), facultatif");
                const cents = v ? Math.round(parseFloat(v.replace(",", ".")) * 100) : undefined;
                log(null, "vente", Number.isFinite(cents) ? cents : undefined).then(() => toast({ description: "Vente notée." }));
              }}
            >
              + Vente
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Ces chiffres viennent seulement de ce que tu notes. Aucun objectif, aucun classement.</p>
        </>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 sm:items-center" onClick={() => setEditing(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-[24px] bg-background px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-5 sm:rounded-[24px]"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Pencil className="h-4 w-4" /> {editing.id ? "Modifier" : "Nouveau"}
              </p>
              <button onClick={() => setEditing(null)} aria-label="Fermer" className="p-1">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex gap-1.5 pb-3">
              {(["prospect", "cliente", "partenaire"] as Kind[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setEditing({ ...editing, kind: k, status: k === "cliente" ? editing.status ?? CLIENT_STATUS[0] : editing.status })}
                  className={`flex-1 rounded-full border px-2 py-1.5 text-xs font-semibold capitalize ${
                    editing.kind === k ? "border-primary bg-primary/10" : "border-border/70 text-muted-foreground"
                  }`}
                >
                  {k === "prospect" ? "Contact" : k}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["first_name", "Prénom *"],
                  ["last_name", "Nom"],
                  ["instagram", "Instagram"],
                  ["tiktok", "TikTok"],
                  ["email", "Email"],
                  ["source", "Source du contact"],
                  ...(editing.kind === "cliente" ? [["offer", "Offre / produit"]] : []),
                  ...(editing.kind === "partenaire" ? [["personal_goal", "Son objectif"], ["status", "Statut"]] : []),
                ] as [keyof Contact, string][]
              ).map(([k, l]) => (
                <Input
                  key={k}
                  placeholder={l}
                  value={(editing[k] as string) ?? ""}
                  onChange={(e) => setEditing({ ...editing, [k]: e.target.value })}
                  className="h-10 text-sm"
                />
              ))}
            </div>
            {editing.kind === "cliente" && (
              <div className="mt-2 flex gap-1.5">
                {CLIENT_STATUS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setEditing({ ...editing, status: s })}
                    className={`flex-1 rounded-full border px-2 py-1.5 text-[11px] ${editing.status === s ? "border-primary bg-primary/10" : "border-border/70 text-muted-foreground"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <select
              value={editing.stage}
              onChange={(e) => setEditing({ ...editing, stage: e.target.value })}
              className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              aria-label="Étape"
            >
              {(PIPELINES[editing.pipeline_model ?? "classique"] ?? PIPELINES.classique).stages.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <Input
              placeholder="Prochaine action (ex. envoyer le lien)"
              value={editing.next_action ?? ""}
              onChange={(e) => setEditing({ ...editing, next_action: e.target.value })}
              className="mt-2 h-10 text-sm"
            />
            <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              Relance / suivi le
              <Input
                type="date"
                value={editing.followup_date ?? ""}
                onChange={(e) => setEditing({ ...editing, followup_date: e.target.value })}
                className="h-10 flex-1 text-sm"
              />
            </label>
            <Textarea
              placeholder="Notes"
              value={editing.notes ?? ""}
              onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
              className="mt-2 min-h-[70px] text-sm"
            />
            <div className="mt-4 flex gap-2">
              <Button className="flex-1 rounded-full" onClick={save} disabled={!editing.first_name?.trim()}>
                Enregistrer
              </Button>
              {editing.id && (
                <Button variant="outline" className="rounded-full" onClick={() => remove(editing.id!)} aria-label="Supprimer">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </HubShell>
  );
};

export default Business;
