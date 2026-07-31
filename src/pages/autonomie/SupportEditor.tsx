import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HubShell from "@/components/hub/HubShell";
import { SUPPORT_TYPES, SupportItem, SupportType } from "@/data/supportTemplates";
import { exportSupportPdf } from "@/lib/exportSupportPdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Plus, Printer, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Profile = { id: string; first_name: string };

/** Éditeur unique pour les six types de supports : une seule surface à maintenir. */
const SupportEditor = () => {
  const { supportId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<SupportType>("routine");
  const [items, setItems] = useState<SupportItem[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data }, { data: p }] = await Promise.all([
        supabase
          .from("autonomy_supports")
          .select("title, support_type, content, profile_id")
          .eq("id", supportId!)
          .maybeSingle(),
        supabase.from("family_medical_profiles").select("id, first_name").order("created_at"),
      ]);
      setProfiles(p ?? []);
      if (data) {
        setTitle(data.title);
        setType(data.support_type as SupportType);
        setProfileId(data.profile_id);
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
    toast({
      description: error ? "Enregistrement impossible." : "Support enregistré.",
      variant: error ? "destructive" : undefined,
    });
  };

  const remove = async () => {
    await supabase.from("autonomy_supports").delete().eq("id", supportId!);
    navigate("/autonomie/studio");
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

      <div className="space-y-2 pt-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-[20px] border border-border/70 bg-card px-3 py-3"
          >
            <button
              onClick={() => move(i, -1)}
              aria-label="Monter"
              className="mt-2 text-muted-foreground"
            >
              <GripVertical className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <div className="min-w-0 flex-1 space-y-2">
              <Input
                value={item.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder={def.itemLabel + " " + (i + 1)}
                className="h-9 border-0 bg-transparent px-0 text-sm focus-visible:ring-0"
              />
              {def.withTime && (
                <Input
                  type="time"
                  value={item.time ?? ""}
                  onChange={(e) => update(i, { time: e.target.value })}
                  className="h-8 w-28 text-xs"
                />
              )}
            </div>
            <button
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              aria-label="Supprimer"
              className="mt-2 text-muted-foreground"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setItems([...items, { label: "" }])}
        className="flex w-full items-center justify-center gap-2 rounded-[20px] border border-dashed border-border bg-card/50 py-3 text-sm font-medium text-muted-foreground"
      >
        <Plus className="h-4 w-4" strokeWidth={2} /> Ajouter {def.itemLabel.toLowerCase()}
      </button>

      <div className="flex gap-3 pt-4">
        <Button onClick={save} disabled={saving} className="flex-1">
          Enregistrer
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            exportSupportPdf({
              title: title.trim() || def.label,
              type,
              childName,
              items: items.filter((i) => i.label.trim()),
            })
          }
        >
          <Printer className="mr-2 h-4 w-4" strokeWidth={1.75} /> PDF
        </Button>
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
