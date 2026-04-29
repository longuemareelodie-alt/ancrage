import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface SupportContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Short context string included in the email subject (e.g., page name). */
  context?: string;
  /** Pre-built diagnostic block (multi-line string) appended to the email. */
  diagnostics?: string;
  /** Optional ticket ID to attach to the request. */
  ticketId?: string;
}

const SupportContactDialog = ({
  open,
  onOpenChange,
  context,
  diagnostics,
  ticketId,
}: SupportContactDialogProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error(t("support_dialog.error_empty", "Décris brièvement le problème."));
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error(t("support_dialog.error_email", "Email invalide."));
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "send-transactional-email",
        {
          body: {
            templateName: "support-request",
            templateData: {
              fromName: name.trim() || null,
              fromEmail: email.trim(),
              message: message.trim(),
              ticketId: ticketId ?? null,
              context: context ?? null,
              diagnostics: diagnostics ?? null,
              url: typeof window !== "undefined" ? window.location.href : null,
              userAgent:
                typeof navigator !== "undefined" ? navigator.userAgent : null,
            },
          },
        },
      );

      if (error || (data && (data as { error?: string }).error)) {
        console.error("Support send error:", error, data);
        toast.error(
          t(
            "support_dialog.error_send",
            "Envoi impossible. Réessaie ou utilise le lien email.",
          ),
        );
        return;
      }

      setSubmitted(true);
      toast.success(
        t("support_dialog.success", "Message envoyé. On revient vers toi très vite 💛"),
      );
    } catch (err) {
      console.error("Support submit error:", err);
      toast.error(
        t(
          "support_dialog.error_send",
          "Envoi impossible. Réessaie ou utilise le lien email.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (next: boolean) => {
    if (!next) {
      // Reset success/message state on close so the next opening starts fresh.
      setSubmitted(false);
      setMessage("");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("support_dialog.title", "Contacter le support")}
          </DialogTitle>
          <DialogDescription>
            {submitted
              ? t(
                  "support_dialog.success_desc",
                  "Ton message est bien parti. On te répond par email très vite.",
                )
              : t(
                  "support_dialog.desc",
                  "Décris ton souci en quelques mots — on t'écrit en retour par email.",
                )}
          </DialogDescription>
        </DialogHeader>

        {!submitted && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="support-name">
                {t("support_dialog.name", "Prénom (optionnel)")}
              </Label>
              <Input
                id="support-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="given-name"
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="support-email">
                {t("support_dialog.email", "Email pour la réponse")}
              </Label>
              <Input
                id="support-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                maxLength={200}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="support-message">
                {t("support_dialog.message", "Message")}
              </Label>
              <Textarea
                id="support-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                required
                maxLength={2000}
                placeholder={t(
                  "support_dialog.message_placeholder",
                  "Explique ce qui s'est passé…",
                )}
              />
              <p className="text-[11px] text-muted-foreground">
                {ticketId
                  ? t(
                      "support_dialog.ticket_note",
                      "Ticket {{id}} et infos diagnostic seront joints automatiquement.",
                      { id: ticketId },
                    )
                  : t(
                      "support_dialog.diag_note",
                      "Quelques infos techniques (page, navigateur) seront jointes pour nous aider.",
                    )}
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="rounded-xl border px-4 py-2 text-sm"
              >
                {t("support_dialog.cancel", "Annuler")}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {submitting
                  ? t("support_dialog.sending", "Envoi…")
                  : t("support_dialog.send", "Envoyer")}
              </button>
            </DialogFooter>
          </form>
        )}

        {submitted && (
          <DialogFooter>
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              {t("support_dialog.close", "Fermer")}
            </button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SupportContactDialog;
