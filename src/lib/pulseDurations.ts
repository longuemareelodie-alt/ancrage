/**
 * ⏱️ Apprentissage doux des durées PULSE.
 *
 * On ne demande rien à personne : chaque fois qu'une action est cochée,
 * on note combien de temps elle a réellement pris. Ensuite, l'estimation
 * affichée vient de tes propres habitudes plutôt que d'une règle générale.
 */
export type DurationSample = {
  source: string;
  domain: string | null;
  length_bucket: number;
  minutes: number;
};

/** Trois tailles de libellé : court, moyen, long. */
export const bucketOf = (label: string) => {
  const n = label.trim().length;
  if (n <= 20) return 0;
  if (n <= 45) return 1;
  return 2;
};

/** Estimation de départ, avant d'avoir appris quoi que ce soit. */
export const baseMinutes = (source: string, bucket: number) => {
  if (source === "rdv") return 30;
  if (source === "famille") return 10;
  return bucket === 0 ? 5 : bucket === 1 ? 10 : 20;
};

const median = (values: number[]) => {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

/** Arrondi lisible : 3, 5, 10, 15… jamais « 7,4 min ». */
const round = (m: number) => {
  const clamped = Math.min(90, Math.max(3, m));
  if (clamped < 5) return 3;
  if (clamped < 8) return 5;
  return Math.round(clamped / 5) * 5;
};

/**
 * Estimation apprise : on cherche d'abord les actions très proches
 * (même domaine, même longueur), puis on élargit. Il faut au moins deux
 * mesures pour oser dire « d'après tes habitudes ».
 */
export const estimateWithHabits = (
  samples: DurationSample[],
  source: string,
  domain: string | null,
  label: string,
): { minutes: number; learned: boolean } => {
  const bucket = bucketOf(label);
  const pools = [
    samples.filter(
      (s) => s.source === source && s.domain === domain && s.length_bucket === bucket,
    ),
    samples.filter((s) => s.source === source && s.domain === domain),
    samples.filter((s) => s.source === source && s.length_bucket === bucket),
    samples.filter((s) => s.source === source),
  ];
  for (const pool of pools) {
    if (pool.length >= 2) {
      return { minutes: round(median(pool.map((s) => Number(s.minutes)))), learned: true };
    }
  }
  return { minutes: baseMinutes(source, bucket), learned: false };
};
