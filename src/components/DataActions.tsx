import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Download, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";

const CONFIRM_PHRASE = "SUPPRIMER";

const DataActions = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from("user_notes")
        .select("title, content, created_at, updated_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const payload = {
        exported_at: new Date().toISOString(),
        user_email: user.email ?? null,
        notes_count: data?.length ?? 0,
        notes: data ?? [],
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `ancrage-notes-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(
        `${data?.length ?? 0} note${(data?.length ?? 0) > 1 ? "s" : ""} exportée${(data?.length ?? 0) > 1 ? "s" : ""}`,
      );
    } catch (e) {
      toast.error("L'export a échoué. Réessaie dans un instant.");
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!user || confirmText !== CONFIRM_PHRASE) return;

    setDeleting(true);
    setProgress(0);
    setProgressLabel("Préparation…");

    try {
      // Étape 1 — appel à l'edge function (suppression côté serveur)
      setProgressLabel("Suppression de tes données…");
      setProgress(20);

      const { data, error } = await supabase.functions.invoke(
        "delete-user-data",
        { body: {} },
      );

      if (error) throw error;
      if (!data?.success) {
        console.error("delete-user-data partial failure", data);
        throw new Error("Suppression incomplète");
      }

      setProgress(80);
      setProgressLabel("Déconnexion…");

      // Étape 2 — déconnexion locale
      await signOut();

      setProgress(100);
      setProgressLabel("Terminé");

      toast.success("Tes données ont été supprimées.");
      setTimeout(() => navigate("/"), 600);
    } catch (e) {
      console.error(e);
      toast.error(
        "La suppression a échoué. Contacte le support si le problème persiste.",
      );
      setDeleting(false);
      setProgress(0);
      setProgressLabel("");
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Mes données</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Exporte tes notes ou supprime définitivement ton compte. Ces actions
          sont conformes au RGPD (droits de portabilité et d'effacement).
        </p>
      </div>

      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
        <button
          onClick={handleExport}
          disabled={exporting || deleting}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary/80 disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {exporting ? "Export en cours…" : "Exporter mes notes"}
        </button>

        <button
          onClick={() => {
            setConfirmText("");
            setConfirmOpen(true);
          }}
          disabled={exporting || deleting}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer mes données
        </button>
      </div>

      {deleting && (
        <div className="space-y-1.5 pt-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">{progressLabel}</p>
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Supprimer définitivement ton compte ?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-left">
              <span className="block">
                Cette action est <strong>irréversible</strong>. Seront supprimés
                définitivement :
              </span>
              <span className="block text-sm text-muted-foreground">
                • Ton profil et tes informations personnelles<br />
                • Toutes tes notes privées<br />
                • Ton historique de check-ins, badges et progression<br />
                • Ton dossier médical, médicaments et rendez-vous<br />
                • Ton compte de connexion
              </span>
              <span className="block text-sm">
                Pense à <strong>exporter tes notes</strong> avant si tu veux les
                garder.
              </span>
              <span className="block pt-2 text-sm font-medium">
                Pour confirmer, tape{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {CONFIRM_PHRASE}
                </code>{" "}
                ci-dessous :
              </span>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRM_PHRASE}
                autoFocus
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-destructive/30"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                setConfirmOpen(false);
                handleDelete();
              }}
              disabled={confirmText !== CONFIRM_PHRASE || deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DataActions;
