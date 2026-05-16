import { useState, ReactNode } from "react";
import { Lock } from "lucide-react";
import UnlockDialog from "./UnlockDialog";
import { cn } from "@/lib/utils";

interface LockedItemProps {
  /** Si false, le contenu est rendu normalement (utilisateur premium ou item gratuit). */
  locked: boolean;
  children: ReactNode;
  /** Titre du popup au clic. */
  dialogTitle?: string;
  /** Description du popup. */
  dialogDescription?: string;
  className?: string;
  /** Réduit l'opacité du contenu verrouillé (par défaut : true). */
  dim?: boolean;
}

/**
 * Enveloppe un contenu verrouillé avec une icône 🔒 douce.
 * Au clic : popup `UnlockDialog`.
 */
const LockedItem = ({
  locked,
  children,
  dialogTitle,
  dialogDescription,
  className,
  dim = true,
}: LockedItemProps) => {
  const [open, setOpen] = useState(false);

  if (!locked) return <>{children}</>;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group relative block w-full text-left",
          className,
        )}
        aria-label="Contenu verrouillé — débloquer"
      >
        <div
          className={cn(
            "pointer-events-none",
            dim && "opacity-50 grayscale-[40%]",
          )}
          aria-hidden
        >
          {children}
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/90 shadow-md ring-1 ring-border backdrop-blur-sm">
            <Lock className="h-4 w-4 text-muted-foreground" aria-hidden />
          </div>
        </div>
      </button>
      <UnlockDialog
        open={open}
        onOpenChange={setOpen}
        title={dialogTitle}
        description={dialogDescription}
      />
    </>
  );
};

export default LockedItem;
