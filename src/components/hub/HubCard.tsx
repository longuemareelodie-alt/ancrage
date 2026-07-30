import { Link } from "react-router-dom";
import { ChevronRight, LucideIcon } from "lucide-react";

type Props = {
  to: string;
  icon: LucideIcon;
  title: string;
  desc?: string;
  meta?: string;
};

/**
 * Single navigation card used inside every hub.
 * Calm, low-contrast surface with a discreet elevation on press.
 */
const HubCard = ({ to, icon: Icon, title, desc, meta }: Props) => (
  <Link
    to={to}
    className="group flex items-center gap-4 rounded-[20px] border border-border/70 bg-card px-5 py-4 transition-all hover:border-primary/40 hover:shadow-[0_10px_30px_-18px_hsl(var(--foreground)/0.35)] active:scale-[0.99]"
  >
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary/60 text-foreground">
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold text-foreground">{title}</span>
      {desc && (
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {desc}
        </span>
      )}
      {meta && (
        <span className="mt-1 block text-[11px] font-medium text-primary-dark">
          {meta}
        </span>
      )}
    </span>
    <ChevronRight
      className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
      strokeWidth={1.75}
    />
  </Link>
);

export default HubCard;
