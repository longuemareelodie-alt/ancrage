import { useEffect, useMemo, useState } from "react";
import { Users, Send, Flag, Clock, Lock } from "lucide-react";
import LiesShell from "@/components/lies/LiesShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useAccessTier, isFreemiumLimited } from "@/lib/freemium";
import UnlockDialog from "@/components/UnlockDialog";
import { PREMIUM_PRICE_LONG } from "@/lib/premiumOffer";
import CommunityAuthorLine from "@/components/lies/CommunityAuthorLine";
import { CommunityAuthorMap, fetchCommunityAuthors } from "@/lib/communityAuthors";
import FoundingBadge from "@/components/FoundingBadge";

type Member = { user_id: string; display_name: string };
type Thread = { id: string; slug: string; title: string; description: string };
type Post = {
  id: string;
  thread_id: string | null;
  author_id: string;
  kind: string;
  body: string;
  status: string;
  created_at: string;
};

const TABS = [
  { key: "threads", label: "Fils thématiques" },
  { key: "free", label: "Posts libres" },
  { key: "qa", label: "Questions & réponses" },
] as const;
type Tab = (typeof TABS)[number]["key"];

const CommunautePage = () => {
  const { user } = useAuth();
  const accessTier = useAccessTier();
  const readOnly = isFreemiumLimited(accessTier);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [member, setMember] = useState<Member | null>(null);
  const [loadingMember, setLoadingMember] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [tab, setTab] = useState<Tab>("threads");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [authors, setAuthors] = useState<CommunityAuthorMap>({});
  const [replies, setReplies] = useState<Record<string, Post[]>>({});
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [body, setBody] = useState("");

  // Membership check
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("community_members")
        .select("user_id, display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      setMember(data);
      setLoadingMember(false);
    })();
  }, [user]);

  // Threads
  useEffect(() => {
    if (!member) return;
    supabase
      .from("community_threads")
      .select("id, slug, title, description")
      .eq("is_active", true)
      .order("title")
      .then(({ data }) => {
        if (data) {
          setThreads(data);
          if (!activeThread && data[0]) setActiveThread(data[0].id);
        }
      });
  }, [member]);

  // Posts
  const loadPosts = async () => {
    if (!member) return;
    let q = supabase
      .from("community_posts")
      .select("id, thread_id, author_id, kind, body, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (tab === "threads") q = q.eq("kind", "thread_post").eq("thread_id", activeThread ?? "00000000-0000-0000-0000-000000000000");
    if (tab === "free") q = q.eq("kind", "free_post");
    if (tab === "qa") q = q.eq("kind", "question");
    const { data } = await q;
    if (!data) return;
    setPosts(data);

    // Commentaires (réponses) rattachés aux messages affichés
    const ids = data.map((p) => p.id);
    let grouped: Record<string, Post[]> = {};
    if (ids.length > 0) {
      const { data: rep } = await supabase
        .from("community_posts")
        .select("id, thread_id, author_id, kind, body, status, created_at, parent_id")
        .in("parent_id", ids)
        .order("created_at", { ascending: true });
      for (const r of rep ?? []) {
        const key = String((r as Post & { parent_id?: string }).parent_id ?? "");
        if (!key) continue;
        grouped[key] = [...(grouped[key] ?? []), r as Post];
      }
    }
    setReplies(grouped);

    const map = await fetchCommunityAuthors([
      ...data.map((p) => p.author_id),
      ...Object.values(grouped).flat().map((r) => r.author_id),
    ]);
    setAuthors(map);
  };
  useEffect(() => {
    loadPosts();
  }, [tab, activeThread, member]);

  const handleJoin = async () => {
    if (!user || !displayName.trim()) return;
    const { error } = await supabase
      .from("community_members")
      .insert({ user_id: user.id, display_name: displayName.trim().slice(0, 40) });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    setMember({ user_id: user.id, display_name: displayName.trim() });
  };

  const handlePost = async () => {
    if (readOnly) {
      setUnlockOpen(true);
      return;
    }
    if (!user || !body.trim()) return;
    const kind = tab === "threads" ? "thread_post" : tab === "free" ? "free_post" : "question";
    const insertPayload = {
      author_id: user.id,
      kind,
      body: body.trim(),
      status: "pending" as const,
      thread_id: kind === "thread_post" ? activeThread : null,
    };
    const { error } = await supabase.from("community_posts").insert(insertPayload);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    setBody("");
    toast({
      title: "Envoyé pour modération",
      description: "Votre message sera publié après validation.",
    });
    loadPosts();
  };

  /** Commentaire sous un message : même modération que les publications. */
  const handleReply = async (parentId: string, threadId: string | null) => {
    if (readOnly) {
      setUnlockOpen(true);
      return;
    }
    if (!user || !replyBody.trim()) return;
    const { error } = await supabase.from("community_posts").insert({
      author_id: user.id,
      kind: "reply",
      parent_id: parentId,
      thread_id: threadId,
      body: replyBody.trim(),
      status: "pending" as const,
    });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    setReplyBody("");
    setReplyFor(null);
    toast({
      title: "Envoyé pour modération",
      description: "Votre réponse sera publiée après validation.",
    });
    loadPosts();
  };

  const handleReport = async (postId: string) => {
    if (readOnly) {
      setUnlockOpen(true);
      return;
    }
    if (!user) return;
    const reason = window.prompt("Pourquoi signalez-vous ce message ? (optionnel)") ?? "";
    const { error } = await supabase
      .from("community_reports")
      .insert({ post_id: postId, reporter_id: user.id, reason });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Merci", description: "Le signalement a bien été transmis." });
  };

  const placeholder = useMemo(() => {
    if (tab === "qa") return "Posez votre question…";
    if (tab === "free") return "Partagez une expérience, une victoire, une difficulté…";
    return "Écrivez dans ce fil…";
  }, [tab]);

  if (loadingMember) {
    return (
      <LiesShell title="Communauté" icon={<Users className="h-6 w-6" />}>
        <p className="text-sm text-muted-foreground">Chargement…</p>
      </LiesShell>
    );
  }

  if (!member) {
    return (
      <LiesShell
        title="Communauté"
        subtitle="Un espace pour échanger entre parents qui vivent quelque chose de similaire."
        icon={<Users className="h-6 w-6" />}
      >
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-2 font-serif text-xl">Rejoindre la communauté</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Choisissez un pseudo. Il sera visible par les autres membres uniquement.
            Tous les messages sont relus par notre équipe avant publication.
            {readOnly && (
              <span className="mt-2 block rounded-lg bg-muted/50 px-3 py-2 text-xs">
                🔒 En version gratuite, tu peux lire les échanges. Pour poster ou commenter, déverrouille Eclosia complet.
              </span>
            )}
          </p>
          <Input
            placeholder="Votre pseudo (ex : Camille_M)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={40}
            className="mb-3"
          />
          <Button
            onClick={handleJoin}
            disabled={!displayName.trim()}
            className="bg-[hsl(var(--lies))] hover:bg-[hsl(var(--lies)/0.9)] text-[hsl(var(--lies-foreground))]"
          >
            Rejoindre la communauté
          </Button>
        </div>
      </LiesShell>
    );
  }

  return (
    <LiesShell
      title="Communauté"
      subtitle={`Bienvenue, ${member.display_name}.`}
      icon={<Users className="h-6 w-6" />}
    >
      <div className="mb-3">
        <FoundingBadge variant="chip" />
      </div>
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-full border border-border bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${
              tab === t.key
                ? "bg-[hsl(var(--lies))] text-[hsl(var(--lies-foreground))]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "threads" && threads.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {threads.map((th) => (
            <button
              key={th.id}
              onClick={() => setActiveThread(th.id)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                activeThread === th.id
                  ? "bg-[hsl(var(--lies-soft))] text-foreground ring-1 ring-[hsl(var(--lies))]"
                  : "border border-border text-muted-foreground"
              }`}
            >
              {th.title}
            </button>
          ))}
        </div>
      )}

      {readOnly ? (
        <button
          type="button"
          onClick={() => setUnlockOpen(true)}
          className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <Lock className="h-4 w-4 text-muted-foreground" aria-hidden />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Lecture seule en version gratuite</p>
            <p className="text-xs text-muted-foreground">
              Poster et commenter sont réservés à la version complète. Touche pour déverrouiller.
            </p>
          </div>
        </button>
      ) : (
        <div className="mb-4 rounded-2xl border border-border bg-card p-3">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="mb-2"
          />
          <Button
            onClick={handlePost}
            disabled={!body.trim() || (tab === "threads" && !activeThread)}
            size="sm"
            className="bg-[hsl(var(--lies))] hover:bg-[hsl(var(--lies)/0.9)] text-[hsl(var(--lies-foreground))]"
          >
            <Send className="mr-2 h-3.5 w-3.5" /> Envoyer (modération)
          </Button>
        </div>
      )}

      {posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Aucun message pour l'instant. Soyez la première personne à écrire ✨
        </p>
      ) : (
        <ul className="space-y-2">
          {posts.map((p) => {
            const isMine = p.author_id === user?.id;
            const isPending = p.status === "pending";
            return (
              <li
                key={p.id}
                className={`rounded-xl border bg-card p-3 ${
                  isPending ? "border-dashed border-[hsl(var(--lies))] bg-[hsl(var(--lies-soft))]" : "border-border"
                }`}
              >
                <div className="mb-1.5 flex items-start justify-between gap-2 text-xs text-muted-foreground">
                  <div className="flex flex-col gap-0.5">
                    <CommunityAuthorLine author={authors[p.author_id]} isMine={isMine} />
                    <span>{new Date(p.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <span className="inline-flex items-center gap-1 text-[hsl(var(--lies))]">
                        <Clock className="h-3 w-3" /> En attente
                      </span>
                    )}
                    {!isMine && !readOnly && (
                      <button onClick={() => handleReport(p.id)} className="hover:text-destructive" aria-label="Signaler">
                        <Flag className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm text-foreground">{p.body}</p>

                {(replies[p.id] ?? []).length > 0 && (
                  <ul className="mt-3 space-y-2 border-l-2 border-border pl-3">
                    {(replies[p.id] ?? []).map((r) => (
                      <li key={r.id}>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CommunityAuthorLine
                            author={authors[r.author_id]}
                            isMine={r.author_id === user?.id}
                          />
                          {r.status === "pending" && (
                            <span className="inline-flex items-center gap-1 text-[hsl(var(--lies))]">
                              <Clock className="h-3 w-3" /> En attente
                            </span>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-foreground">{r.body}</p>
                      </li>
                    ))}
                  </ul>
                )}

                {replyFor === p.id ? (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder="Votre réponse…"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReply(p.id, p.thread_id)}
                        disabled={!replyBody.trim()}
                        className="bg-[hsl(var(--lies))] hover:bg-[hsl(var(--lies)/0.9)] text-[hsl(var(--lies-foreground))]"
                      >
                        <Send className="mr-2 h-3.5 w-3.5" /> Répondre (modération)
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setReplyFor(null)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (readOnly) {
                        setUnlockOpen(true);
                        return;
                      }
                      setReplyBody("");
                      setReplyFor(p.id);
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Répondre
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <UnlockDialog
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
        title="La communauté t'attend de l'autre côté."
        description={`Poster et commenter sont réservés à Eclosia complet — ${PREMIUM_PRICE_LONG} · accès à vie. Pas d'abonnement, jamais.`}
      />
    </LiesShell>
  );
};

export default CommunautePage;
