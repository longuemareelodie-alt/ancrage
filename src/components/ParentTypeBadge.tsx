import { Link } from "react-router-dom";
import { useParentType } from "@/hooks/useParentType";
import { PARENT_TYPE_LABELS } from "@/lib/parentType";

/**
 * Small pill that shows the current parent profile and links to Settings.
 */
export default function ParentTypeBadge({ className = "" }: { className?: string }) {
  const [parentType, , hasChosen] = useParentType();
  const label = PARENT_TYPE_LABELS[parentType];
  const title = `Profil : ${label}`;

  return (
    <Link
      to="/parametres"
      title={title}
      aria-label={title}
      className={[
        "inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15",
        className,
      ].join(" ")}
    >
      <span aria-hidden="true">👩</span>
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
