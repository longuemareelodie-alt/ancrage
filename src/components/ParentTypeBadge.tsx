import { Link } from "react-router-dom";
import { useParentType } from "@/hooks/useParentType";
import { PARENT_TYPE_LABELS } from "@/lib/parentType";

/**
 * Small pill that shows the current parent profile (or "Neutre" when not yet
 * chosen) and links to the Settings page for quick switching.
 */
export default function ParentTypeBadge({ className = "" }: { className?: string }) {
  const [parentType, , hasChosen] = useParentType();
  const emoji = !hasChosen ? "👤" : parentType === "papa" ? "👨" : "👩";
  const label = !hasChosen ? "Neutre" : PARENT_TYPE_LABELS[parentType];
  const title = hasChosen
    ? `Profil : ${label} — Changer`
    : "Profil non choisi — Choisir";

  return (
    <Link
      to="/parametres"
      title={title}
      aria-label={title}
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        hasChosen
          ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
          : "border-dashed border-muted-foreground/40 text-muted-foreground hover:border-primary/40 hover:text-primary",
        className,
      ].join(" ")}
    >
      <span aria-hidden="true">{emoji}</span>
      <span>{label}</span>
      {!hasChosen && (
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500"
        />
      )}
    </Link>
  );
}
