import { supabase } from "@/integrations/supabase/client";

/**
 * Familles Fondatrices — tout est décidé par la base de données.
 * Aucun code promo, aucune saisie manuelle : le compteur avance uniquement
 * quand un paiement est réellement validé, et le tarif suit automatiquement.
 */
export type FoundingTierKey =
  | "fondatrice"
  | "pionniere"
  | "premiere"
  | "suivante"
  | "standard";

export type FoundingTier = {
  key: FoundingTierKey;
  emoji: string;
  label: string;
  /** Libellé du badge à vie (null pour le tarif normal). */
  badgeLabel: string | null;
  priceCents: number;
  /** Nombre de places dans ce palier (null = illimité). */
  seats: number | null;
};

export const FOUNDING_TIERS: FoundingTier[] = [
  { key: "fondatrice", emoji: "🌸", label: "Familles Fondatrices", badgeLabel: "Famille Fondatrice", priceCents: 2900, seats: 5 },
  { key: "pionniere", emoji: "🌱", label: "Familles Pionnières", badgeLabel: "Famille Pionnière", priceCents: 4900, seats: 10 },
  { key: "premiere", emoji: "✨", label: "Premières Familles", badgeLabel: "Première Génération", priceCents: 6900, seats: 20 },
  { key: "suivante", emoji: "💛", label: "Familles suivantes", badgeLabel: "Première Génération", priceCents: 7900, seats: 20 },
  { key: "standard", emoji: "🚀", label: "Tarif Éclosia", badgeLabel: null, priceCents: 9700, seats: null },
];

export const getFoundingTier = (key?: string | null): FoundingTier =>
  FOUNDING_TIERS.find((t) => t.key === key) ?? FOUNDING_TIERS[FOUNDING_TIERS.length - 1];

export type FoundingOffer = {
  tierKey: FoundingTierKey;
  priceCents: number;
  familiesJoined: number;
  remainingAtThisPrice: number | null;
  isLimited: boolean;
};

/** Clé de badge stockée dans user_badges (badge à vie). */
export const foundingBadgeKey = (key: FoundingTierKey) => `famille_${key}`;

/** Tarif du moment — lisible sans être connectée (page de vente). */
export async function fetchFoundingOffer(): Promise<FoundingOffer | null> {
  const { data, error } = await supabase.rpc("get_founding_offer");
  if (error || !data || typeof data !== "object") return null;
  const raw = data as Record<string, unknown>;
  const priceCents = Number(raw.price_cents);
  if (!Number.isFinite(priceCents)) return null;
  const remaining = raw.remaining_at_this_price;
  return {
    tierKey: (raw.tier_key as FoundingTierKey) ?? "standard",
    priceCents,
    familiesJoined: Number(raw.families_joined ?? 0),
    remainingAtThisPrice: remaining === null || remaining === undefined ? null : Number(remaining),
    isLimited: Boolean(raw.is_limited),
  };
}

export type MyFoundingStatus = {
  isFounding: boolean;
  tierKey: FoundingTierKey;
  position: number;
  priceCents: number;
  joinedAt: string;
} | null;

/** Badge, date d'arrivée et tarif obtenu — pour le profil. */
export async function fetchMyFoundingStatus(): Promise<MyFoundingStatus> {
  const { data, error } = await supabase.rpc("get_my_founding_status");
  if (error || !data || typeof data !== "object") return null;
  const raw = data as Record<string, unknown>;
  if (!raw.tier_key) return null;
  return {
    isFounding: Boolean(raw.is_founding),
    tierKey: raw.tier_key as FoundingTierKey,
    position: Number(raw.position ?? 0),
    priceCents: Number(raw.price_cents ?? 0),
    joinedAt: String(raw.joined_at ?? ""),
  };
}
