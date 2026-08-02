import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HubShell from "@/components/hub/HubShell";
import { SUPPORT_TYPES, SupportItem, SupportType } from "@/data/supportTemplates";
import { exportSupportPdf, PdfFormat } from "@/lib/exportSupportPdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, ArrowLeft, Star, Copy, Archive } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { describePersonalisation, softHaptic } from "@/lib/supportPersonalisation";
import { readCachedSupport } from "@/lib/supportsCache";
import SupportItemsReorder, {
  SupportRow,
  stripRowKeys,
  withRowKeys,
} from "@/components/autonomie/SupportItemsReorder";


type Profile = { id: string; first_name: string };

/** Éditeur unique pour les six types de supports : une seule surface à maintenir. */
const SupportEditor = () => {
  const { supportId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<SupportType>("routine");
  const [items, setItems] = useState<SupportRow[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [saving, setSaving] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [format, setFormat] = useState<PdfFormat>("a4");
  const [perso, setPerso] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const [{ data }, { data: p }] = await Promise.all([
        supabase
          .from("autonomy_supports")
          .select("title, support_type, content, profile_id, is_favorite, personalisation")
          .eq("id", supportId!)
          .maybeSingle(),
        supabase.from("family_medical_profiles").select("id, first_name").order("created_at"),
      ]);
      setProfiles(p ?? []);
      if (!data) {
        // Hors ligne : on repart de la copie locale plutôt que d'afficher une page vide.
        const cached = readCachedSupport(supportId!);
        if (cached) {
          setTitle(cached.title);
          setType(cached.support_type as SupportType);
          setProfileId(cached.profile_id);
          setFavorite(Boolean(cached.is_favorite));
          setItems(cached.content?.items?.length ? cached.content.items : [{ label: "" }]);
        }
      }
      if (data) {
        setPerso((data.personalisation as Record<string, string>) ?? {});
        setTitle(data.title);
        setType(data.support_type as SupportType);
        setProfileId(data.profile_id);
        setFavorite(Boolean(data.is_favorite));
        const content = data.content as { items?: SupportItem[] } | null;
        setItems(content?.items?.length ? content.items : [{ label: "" }]);
      }
      setLoading(false);
    })();
  }, [supportId]);

  const def = SUPPORT_TYPES[type];

  const save = async () => {
    setSaving(true);
    const clean = items.filter((i) => i.label.trim());
    const { error } = await supabase
      .from("autonomy_supports")
      .update({ title: title.trim() || def.label, content: { items: clean }, profile_id: profileId })
      .eq("id", supportId!);
    setSaving(false);
    if (!error) softHaptic();
    toast({
      description: error ? "Enregistrement impossible." : "Support enregistré.",
      variant: error ? "destructive" : undefined,
    });
  };

  const toggleFavorite = async () => {
    const next = !favorite;
    setFavorite(next);
    const { error } = await supabase
      .from("autonomy_supports")
      .update({ is_favorite: next })
      .eq("id", supportId!);
    if (error) {
      setFavorite(!next);
      toast({ description: "Impossible de mettre à jour.", variant: "destructive" });
    }
  };

  const duplicate = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    const { data, error } = await supabase
      .from("autonomy_supports")
      .insert({
        user_id: uid,
        profile_id: profileId,
        support_type: type,
        title: (title.trim() || def.label) + " (copie)",
        content: { items: items.filter((i) => i.label.trim()) },
      })
      .select("id")
      .single();
    if (error || !data) {
      toast({ description: "Impossible de dupliquer.", variant: "destructive" });
      return;
    }
    navigate("/autonomie/support/" + data.id);
  };

  const archive = async () => {
    const { error } = await supabase
      .from("autonomy_supports")
      .update({ archived: true })
      .eq("id", supportId!);
    if (error) {
      toast({ description: "Impossible de ranger ce support.", variant: "destructive" });
      return;
    }
    toast({ description: "Rangé. Tu le retrouveras dans Mes supports." });
    navigate("/autonomie/mes-supports");
  };

  const remove = async () => {
    await supabase.from("autonomy_supports").delete().eq("id", supportId!);
    navigate("/autonomie/studio");
  };


  /** Impression : on note l'usage pour faire remonter les supports les plus utilisés. */
  const printPdf = async () => {
    exportSupportPdf({
      title: title.trim() || def.label,
      type,
      childName,
      subtitle: describePersonalisation(perso as never),
      items: items.filter((i) => i.label.trim()),
      format,
    });
    softHaptic([10, 40, 10]);
    toast({ description: "Ton support est prêt à imprimer 🌸" });
    const { data } = await supabase
      .from("autonomy_supports")
      .select("use_count")
      .eq("id", supportId!)
      .maybeSingle();
    await supabase
      .from("autonomy_supports")
      .update({ use_count: (data?.use_count ?? 0) + 1, last_used_at: new Date().toISOString() })
      .eq("id", supportId!);
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  };

  const update = (index: number, patch: Partial<SupportItem>) =>
    setItems(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  if (loading) {
    return <HubShell title="Support">{null}</HubShell>;
  }

  const childName = profiles.find((p) => p.id === profileId)?.first_name;

  return (
    <HubShell title={def.label} subtitle={def.desc}>
      <button
        onClick={() => navigate("/autonomie/studio")}
        className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Studio
      </button>

      {describePersonalisation(perso as never) && (
        <p className="pb-1 text-[11px] font-medium text-muted-foreground">
          {describePersonalisation(perso as never)}
        </p>
      )}

      <div className="space-y-3 rounded-[20px] border border-border/70 bg-card px-5 py-5">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre du support"
          className="border-0 border-b border-border/60 px-0 font-serif text-lg focus-visible:ring-0"
        />
        {profiles.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">Pour</span>
            <select
              value={profileId ?? ""}
              onChange={(e) => setProfileId(e.target.value || null)}
              className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none"
            >
              <option value="">Toute la famille</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <SupportItemsReorder
        items={items}
        setItems={setItems}
        itemLabel={def.itemLabel}
        withTime={Boolean(def.withTime)}
      />


      <div className="flex items-center gap-2 pt-4">
        <span className="text-[11px] font-medium text-muted-foreground">Impression</span>
        {(["a4", "a5"] as PdfFormat[]).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-medium ${
              format === f
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-border/70 bg-card text-muted-foreground"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Button onClick={save} disabled={saving} className="flex-1">
          Enregistrer
        </Button>
        <Button
          variant="secondary"
          onClick={printPdf}
        >
          <Printer className="mr-2 h-4 w-4" strokeWidth={1.75} /> PDF
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3">
        <button
          onClick={toggleFavorite}
          className="flex flex-col items-center gap-1.5 rounded-[20px] border border-border/70 bg-card py-3 text-[11px] font-medium text-muted-foreground"
        >
          <Star
            className={`h-4 w-4 ${favorite ? "fill-primary text-primary" : ""}`}
            strokeWidth={1.75}
          />
          {favorite ? "Favori" : "Mettre en favori"}
        </button>
        <button
          onClick={duplicate}
          className="flex flex-col items-center gap-1.5 rounded-[20px] border border-border/70 bg-card py-3 text-[11px] font-medium text-muted-foreground"
        >
          <Copy className="h-4 w-4" strokeWidth={1.75} /> Dupliquer
        </button>
        <button
          onClick={archive}
          className="flex flex-col items-center gap-1.5 rounded-[20px] border border-border/70 bg-card py-3 text-[11px] font-medium text-muted-foreground"
        >
          <Archive className="h-4 w-4" strokeWidth={1.75} /> Ranger
        </button>
      </div>

      <button
        onClick={remove}
        className="mt-6 w-full text-center text-xs text-muted-foreground underline"
      >
        Supprimer ce support
      </button>

    </HubShell>
  );
};

export default SupportEditor;
