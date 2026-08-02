import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  /** Nombre de lignes/cartes fantômes. */
  count?: number;
  /** Message lu par les lecteurs d'écran. */
  label?: string;
};

/**
 * Chargement doux — jamais d'écran vide, jamais de spinner qui tourne.
 * Reproduit la silhouette des cartes Éclosia (coins très arrondis, calme).
 */
const SoftLoading = ({ count = 3, label = "Chargement en cours" }: Props) => (
  <div className="space-y-3" role="status" aria-label={label} aria-live="polite">
    <span className="sr-only">{label}</span>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="rounded-3xl border border-border bg-card p-5"
        style={{ opacity: 1 - i * 0.15 }}
      >
        <Skeleton className="h-4 w-1/3 rounded-full" />
        <Skeleton className="mt-3 h-3 w-4/5 rounded-full" />
        <Skeleton className="mt-2 h-3 w-2/3 rounded-full" />
      </div>
    ))}
  </div>
);

export default SoftLoading;
