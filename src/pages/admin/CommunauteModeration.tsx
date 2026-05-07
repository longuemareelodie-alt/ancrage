import { useEffect, useState } from "react";
import { Check, X, EyeOff, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type Post = {
  id: string;
  author_id: string;
  thread_id: string | null;
  kind: string;
  body: string;
  status: string;
  created_at: string;
};

type Report = {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: string;
  resolved: boolean;
  created_at: string;
};

const CommunauteModeration = () => {
  const [pending, setPending] = useState<Post[]>([]);
  const [reports, setReports] = useState<(Report & { post?: Post })[]>([]);

  const load = async () => {
    const { data: pPosts } = await supabase
      .from("community_posts")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    if (pPosts) setPending(pPosts as Post[]);

    const { data: rep } = await supabase
      .from("community_reports")
      .select("*")
      .eq("resolved", false)
      .order("created_at", { ascending: false });
    if (rep) {
      const ids = rep.map((r) => r.post_id);
      const { data: refPosts } = ids.length
        ? await supabase.from("community_posts").select("*").in("id", ids)
        : { data: [] as Post[] };
      const map = new Map((refPosts ?? []).map((p) => [p.id, p as Post]));
      setReports(rep.map((r) => ({ ...(r as Report), post: map.get(r.post_id) })));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id: string, status: "approved" | "rejected" | "hidden") => {
    const { error } = await supabase.from("community_posts").update({ status }).eq("id", id);
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else load();
  };

  const resolveReport = async (id: string) => {
    const { error } = await supabase
      .from("community_reports")
      .update({ resolved: true })
      .eq("id", id);
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else load();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <h1 className="font-serif text-2xl">Modération communauté</h1>
        </div>
      </header>
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-6">
        <section>
          <h2 className="mb-3 font-serif text-xl">Posts en attente ({pending.length})</h2>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">Rien à modérer ✨</p>
          ) : (
            <ul className="space-y-2">
              {pending.map((p) => (
                <li key={p.id} className="rounded-xl border border-border bg-card p-3">
                  <div className="mb-2 text-xs text-muted-foreground">
                    {p.kind} · {new Date(p.created_at).toLocaleString("fr-FR")}
                  </div>
                  <p className="mb-3 whitespace-pre-wrap text-sm">{p.body}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setStatus(p.id, "approved")} className="bg-[hsl(var(--lies))]">
                      <Check className="mr-1 h-3.5 w-3.5" /> Approuver
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setStatus(p.id, "rejected")}>
                      <X className="mr-1 h-3.5 w-3.5" /> Rejeter
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-serif text-xl">Signalements ({reports.length})</h2>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun signalement ouvert.</p>
          ) : (
            <ul className="space-y-2">
              {reports.map((r) => (
                <li key={r.id} className="rounded-xl border border-destructive/30 bg-card p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Flag className="h-3 w-3" /> {new Date(r.created_at).toLocaleString("fr-FR")}
                  </div>
                  {r.reason && <p className="mb-2 text-xs italic">Motif : {r.reason}</p>}
                  {r.post ? (
                    <p className="mb-3 whitespace-pre-wrap rounded bg-muted/40 p-2 text-sm">{r.post.body}</p>
                  ) : (
                    <p className="mb-3 text-xs text-muted-foreground">Post supprimé.</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {r.post && (
                      <Button size="sm" variant="outline" onClick={() => setStatus(r.post!.id, "hidden")}>
                        <EyeOff className="mr-1 h-3.5 w-3.5" /> Masquer le post
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => resolveReport(r.id)}>
                      Marquer résolu
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default CommunauteModeration;
