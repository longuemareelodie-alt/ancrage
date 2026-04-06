import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SectionBlock from "@/components/SectionBlock";
import CTAButton from "@/components/CTAButton";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Plus, Trash2, Save, User, BookOpen, StickyNote, Lock, Pencil, Check, Bell, BellOff, Flame, Trophy, Download, Share } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Switch } from "@/components/ui/switch";
import { BADGES } from "@/lib/streaks";
import StreakCalendar from "@/components/StreakCalendar";
interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const Profil = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { isSupported, isSubscribed, subscribe, unsubscribe, loading: pushLoading } = usePushNotifications();

  const [profile, setProfile] = useState<{ first_name: string; email: string | null; is_premium: boolean; current_streak: number; longest_streak: number } | null>(null);
  const [completedPhases, setCompletedPhases] = useState<number[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [checkinDates, setCheckinDates] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<{ title: string; content: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profil" | "parcours" | "notes">("profil");
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  const loadData = useCallback(() => {
    if (!user) return;

    supabase
      .from("profiles")
      .select("first_name, email, is_premium, current_streak, longest_streak")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data as any);
      });

    supabase
      .from("user_badges")
      .select("badge_key")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setEarnedBadges(data.map((b) => b.badge_key));
      });

    supabase
      .from("user_progress")
      .select("completed_phases")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setCompletedPhases(data.completed_phases ?? []);
      });

    // Load checkin dates for calendar
    supabase
      .from("emotion_checkins")
      .select("created_at")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) {
          setCheckinDates(new Set(data.map((d) => d.created_at.split("T")[0])));
        }
      });

    loadNotes();
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh data when returning to this page
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") loadData();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", loadData);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", loadData);
    };
  }, [loadData]);

  const loadNotes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setNotes(data);
  };

  const saveNote = async () => {
    if (!user || !editingNote) return;
    setSaving(true);
    const { error } = await supabase.from("user_notes").insert({
      user_id: user.id,
      title: editingNote.title || "Sans titre",
      content: editingNote.content,
    });
    if (!error) {
      setEditingNote(null);
      await loadNotes();
    }
    setSaving(false);
  };

  const deleteNote = async (id: string) => {
    await supabase.from("user_notes").delete().eq("id", id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const startEditingName = () => {
    setNameValue(profile?.first_name || "");
    setEditingName(true);
  };

  const saveName = async () => {
    if (!user || !nameValue.trim()) return;
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ first_name: nameValue.trim() })
      .eq("user_id", user.id);
    if (!error) {
      setProfile((prev) => prev ? { ...prev, first_name: nameValue.trim() } : prev);
      setEditingName(false);
    }
    setSavingName(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  const phaseNames = ["Calmer ton corps", "Comprendre", "Reprendre du pouvoir", "Te reconstruire"];

  return (
    <div className="min-h-screen bg-background">
      <SectionBlock variant="blue">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {profile?.first_name ? `Bonjour ${profile.first_name} 💛` : "Mon espace"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{profile?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-lg bg-white/50 px-3 py-2 text-xs font-medium transition-colors hover:bg-white/70"
          >
            <LogOut className="h-3.5 w-3.5" />
            Déconnexion
          </button>
        </div>
      </SectionBlock>

      {/* Tabs */}
      <div className="flex border-b border-border bg-card">
        {([
          { key: "profil" as const, icon: User, label: "Profil", locked: false },
          { key: "parcours" as const, icon: BookOpen, label: "Parcours", locked: !profile?.is_premium },
          { key: "notes" as const, icon: StickyNote, label: "Notes", locked: !profile?.is_premium },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => !tab.locked && setActiveTab(tab.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
              tab.locked
                ? "text-muted-foreground/50 cursor-not-allowed"
                : activeTab === tab.key
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.locked ? <Lock className="h-3.5 w-3.5" /> : <tab.icon className="h-4 w-4" />}
            {tab.label}
          </button>
        ))}
      </div>

      <SectionBlock>
        <AnimatePresence mode="wait">
          {activeTab === "profil" && (
            <motion.div key="profil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="space-y-4 rounded-xl bg-card p-5 shadow-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Prénom</p>
                  {editingName ? (
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="Ton prénom"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && saveName()}
                      />
                      <button
                        onClick={saveName}
                        disabled={savingName || !nameValue.trim()}
                        className="rounded-lg bg-primary p-1.5 text-primary-foreground disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{profile?.first_name || "–"}</p>
                      <button
                        onClick={startEditingName}
                        className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Email</p>
                  <p className="text-sm font-semibold">{profile?.email || "–"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Progression</p>
                  <p className="mt-1 text-sm font-semibold">{completedPhases.length} / 4 phases terminées</p>
                  <Progress value={(completedPhases.length / 4) * 100} className="mt-2 h-2.5" />
                </div>

                {/* Streak */}
                <div className="flex items-center gap-4 rounded-xl bg-secondary/50 p-4">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-lg font-bold leading-none">{profile?.current_streak ?? 0}</p>
                      <p className="text-[10px] text-muted-foreground">jours de suite</p>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-lg font-bold leading-none">{profile?.longest_streak ?? 0}</p>
                      <p className="text-[10px] text-muted-foreground">record</p>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Badges gagnés</p>
                  <div className="grid grid-cols-4 gap-2">
                    {BADGES.map((badge) => {
                      const earned = earnedBadges.includes(badge.key);
                      return (
                        <div
                          key={badge.key}
                          className={`flex flex-col items-center gap-1 rounded-xl p-2.5 text-center transition-all ${
                            earned ? "bg-primary/10" : "bg-secondary/30 opacity-40 grayscale"
                          }`}
                          title={badge.description}
                        >
                          <span className="text-xl">{badge.emoji}</span>
                          <span className="text-[9px] font-medium leading-tight">{badge.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Streak Calendar */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Historique des check-ins</p>
                  <StreakCalendar checkinDates={checkinDates} />
                </div>

                {/* Push notifications toggle */}
                {isSupported && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isSubscribed ? (
                        <Bell className="h-4 w-4 text-primary" />
                      ) : (
                        <BellOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-semibold">Rappels quotidiens</p>
                        <p className="text-xs text-muted-foreground">
                          {isSubscribed
                            ? "Tu recevras un rappel doux chaque jour"
                            : "Active les rappels pour prendre soin de toi"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isSubscribed}
                      disabled={pushLoading}
                      onCheckedChange={(checked) => {
                        if (checked) subscribe();
                        else unsubscribe();
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "parcours" && (
            <motion.div key="parcours" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="space-y-3">
                {phaseNames.map((name, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-xl p-4 shadow-sm ${
                      completedPhases.includes(i + 1)
                        ? "bg-green-50 border border-green-200"
                        : "bg-card"
                    }`}
                  >
                    <span className="text-lg">{completedPhases.includes(i + 1) ? "✅" : "🌿"}</span>
                    <div>
                      <p className="text-xs font-medium text-primary">Phase {i + 1}</p>
                      <p className="text-sm font-semibold">{name}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <CTAButton to="/parcours">Continuer le parcours</CTAButton>
              </div>
            </motion.div>
          )}

          {activeTab === "notes" && (
            <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Tes notes sont privées et sécurisées 🔒</p>
                {!editingNote && (
                  <button
                    onClick={() => setEditingNote({ title: "", content: "" })}
                    className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Nouvelle
                  </button>
                )}
              </div>

              {editingNote && (
                <div className="mb-4 space-y-3 rounded-xl bg-card p-4 shadow-sm">
                  <input
                    type="text"
                    value={editingNote.title}
                    onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                    placeholder="Titre (optionnel)"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <textarea
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                    placeholder="Écris ce que tu ressens, ce que tu veux noter..."
                    rows={4}
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveNote}
                      disabled={saving || !editingNote.content.trim()}
                      className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {saving ? "..." : "Enregistrer"}
                    </button>
                    <button
                      onClick={() => setEditingNote(null)}
                      className="rounded-lg bg-secondary px-4 py-2 text-xs font-medium"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {notes.length === 0 && !editingNote && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Aucune note pour l'instant.<br />
                    Cet espace est à toi.
                  </p>
                )}
                {notes.map((note) => (
                  <div key={note.id} className="rounded-xl bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {note.title && <p className="text-sm font-semibold">{note.title}</p>}
                        <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{note.content}</p>
                        <p className="mt-2 text-[10px] text-muted-foreground/60">
                          {new Date(note.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="ml-2 shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SectionBlock>
    </div>
  );
};

export default Profil;
