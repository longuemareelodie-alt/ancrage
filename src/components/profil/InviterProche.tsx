import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, Loader2, Mail, UserPlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  INVITATION_ROLES,
  Invitation,
  InvitationRole,
  invitationUrl,
  listMyInvitations,
  revokeInvitation,
  roleEmoji,
  roleLabel,
  sendInvitation,
} from "@/lib/familyInvitations";

const statusLabel: Record<string, string> = {
  pending: "En attente",
  accepted: "A rejoint",
  revoked: "Annulée",
  expired: "Expirée",
};

/**
 * Inviter un proche depuis le profil : une adresse, un rôle, un petit mot.
 * Trois champs, pas plus — le reste est automatique.
 */
const InviterProche = ({ firstName }: { firstName?: string | null }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitationRole | null>(null);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setInvitations(await listMyInvitations());
    } catch {
      /* silencieux : la liste n'est pas essentielle */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const isExpired = (inv: Invitation) =>
    inv.status === "pending" && new Date(inv.expires_at) < new Date();

  const displayStatus = (inv: Invitation) =>
    isExpired(inv) ? "expired" : inv.status;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Lien copié 🌸" });
    } catch {
      toast({ title: "Impossible de copier le lien", variant: "destructive" });
    }
  };

  const submit = async () => {
    if (!email.trim() || !role) return;
    setSending(true);
    try {
      const { url } = await sendInvitation({
        email,
        role,
        note: note.trim() || undefined,
        inviterFirstName: firstName ?? undefined,
      });
      setLastLink(url);
      if (navigator.vibrate) navigator.vibrate(12);
      toast({
        title: "Invitation envoyée 🌸",
        description: `${email.trim()} va recevoir ton invitation.`,
      });
      setEmail("");
      setNote("");
      setRole(null);
      setOpen(false);
      load();
    } catch (e) {
      const err = e as { code?: string; message?: string };
      toast({
        title: "Invitation non envoyée",
        description: err.message ?? "Réessaie dans un instant.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const cancel = async (inv: Invitation) => {
    try {
      await revokeInvitation(inv.id);
      toast({ title: "Invitation annulée" });
      load();
    } catch (e) {
      toast({
        title: "Annulation impossible",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  const pending = invitations.filter((i) => displayStatus(i) === "pending");

  return (
    <div className="rounded-xl bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <UserPlus className="h-4 w-4 text-primary" />
            Inviter un proche
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Papa, maman, grand-parent, professionnel… Invite quelqu'un à
            t'accompagner dans Eclosia.
          </p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex-shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {open ? "Fermer" : "Inviter"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-5 space-y-5 border-t border-border/60 pt-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Son adresse e-mail
                </label>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/30">
                  <Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="off"
                    maxLength={255}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="prenom@exemple.com"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Son rôle
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {INVITATION_ROLES.map((r) => {
                    const active = role === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => {
                          setRole(r.value);
                          if (navigator.vibrate) navigator.vibrate(8);
                        }}
                        className={`rounded-2xl border px-3 py-3 text-left transition-colors ${
                          active
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background hover:bg-muted/40"
                        }`}
                      >
                        <span className="text-lg">{r.emoji}</span>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {r.label}
                        </p>
                        <p className="text-[11px] leading-snug text-muted-foreground">
                          {r.hint}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Un petit mot (optionnel)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Ce que tu aimerais partager avec cette personne…"
                  className="mt-1.5 w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <button
                onClick={submit}
                disabled={sending || !email.trim() || !role}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Envoyer l'invitation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {lastLink && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-4 py-3">
          <p className="truncate text-xs text-muted-foreground">{lastLink}</p>
          <button
            onClick={() => copy(lastLink)}
            className="flex flex-shrink-0 items-center gap-1.5 text-xs font-medium text-primary"
          >
            <Copy className="h-3.5 w-3.5" />
            Copier
          </button>
        </div>
      )}

      {!loading && invitations.length > 0 && (
        <div className="mt-5 space-y-2 border-t border-border/60 pt-4">
          <p className="text-xs font-medium text-muted-foreground">
            Invitations envoyées
            {pending.length > 0 ? ` · ${pending.length} en attente` : ""}
          </p>
          {invitations.slice(0, 8).map((inv) => {
            const status = displayStatus(inv);
            return (
              <div
                key={inv.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">
                    {roleEmoji(inv.role)} {inv.email}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {roleLabel(inv.role)} · {statusLabel[status] ?? status}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  {status === "pending" && (
                    <>
                      <button
                        onClick={() => copy(invitationUrl(""))}
                        className="hidden"
                        aria-hidden
                      />
                      <button
                        onClick={() => cancel(inv)}
                        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
                        aria-label="Annuler l'invitation"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                  {status === "accepted" && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InviterProche;
