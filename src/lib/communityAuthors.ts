import { supabase } from "@/integrations/supabase/client";
import { FoundingTierKey, getFoundingTier } from "@/lib/foundingFamilies";

/**
 * Pseudo + badge à vie des membres de la communauté.
 * Une seule requête pour toute une liste de messages : on n'expose rien d'autre
 * que ce qui est déjà public entre membres (le pseudo choisi et le badge).
 */
export type CommunityAuthor = {
  userId: string;
  displayName: string;
  foundingTier: FoundingTierKey | null;
};

export type CommunityAuthorMap = Record<string, CommunityAuthor>;

export async function fetchCommunityAuthors(
  userIds: string[],
): Promise<CommunityAuthorMap> {
  const unique = Array.from(new Set(userIds.filter(Boolean))).slice(0, 200);
  if (unique.length === 0) return {};

  const { data, error } = await supabase.rpc("get_community_authors", {
    _user_ids: unique,
  });
  if (error || !Array.isArray(data)) return {};

  const map: CommunityAuthorMap = {};
  for (const row of data as Record<string, unknown>[]) {
    const userId = String(row.user_id ?? "");
    if (!userId) continue;
    map[userId] = {
      userId,
      displayName: String(row.display_name ?? "Membre"),
      foundingTier: (row.founding_tier as FoundingTierKey | null) ?? null,
    };
  }
  return map;
}

/** Libellé court du badge, prêt à afficher (null = pas de badge). */
export function foundingChipLabel(tier: FoundingTierKey | null): string | null {
  if (!tier || tier === "standard") return null;
  const t = getFoundingTier(tier);
  if (!t.badgeLabel) return null;
  return `${t.emoji} ${t.badgeLabel}`;
}
