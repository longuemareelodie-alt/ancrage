import { supabase } from "@/integrations/supabase/client";

export interface BadgeDef {
  key: string;
  emoji: string;
  label: string;
  description: string;
  condition: (streak: number, totalCheckins: number) => boolean;
}

// Axe : MODE SURVIE → CALME. Vocabulaire : ancrage, sécurité, ancrée.
export const BADGES: BadgeDef[] = [
  {
    key: "first_checkin",
    emoji: "🌱",
    label: "Premier ancrage",
    description: "Tu as osé regarder ton mode survie. Le calme commence là.",
    condition: (_, total) => total >= 1,
  },
  {
    key: "streak_3",
    emoji: "🔥",
    label: "3 jours d'ancrage",
    description: "3 jours de suite à sortir du mode survie. Ton corps s'en souvient.",
    condition: (s) => s >= 3,
  },
  {
    key: "streak_7",
    emoji: "⭐",
    label: "Une semaine ancrée",
    description: "7 jours à t'écouter. Tu crées un espace de sécurité pour toi.",
    condition: (s) => s >= 7,
  },
  {
    key: "streak_14",
    emoji: "💪",
    label: "Ton système se réancre",
    description: "14 jours. Ton système nerveux apprend à redescendre tout seul.",
    condition: (s) => s >= 14,
  },
  {
    key: "streak_30",
    emoji: "👑",
    label: "La maman ancrée",
    description: "30 jours hors du mode survie. Tu es devenue la maman ancrée.",
    condition: (s) => s >= 30,
  },
  {
    key: "checkins_10",
    emoji: "💜",
    label: "10 ancrages posés",
    description: "10 fois où tu as choisi le calme plutôt que le mode survie.",
    condition: (_, total) => total >= 10,
  },
  {
    key: "checkins_50",
    emoji: "💎",
    label: "L'ancrage est devenu un réflexe",
    description: "50 ancrages. Sortir du mode survie n'est plus un effort.",
    condition: (_, total) => total >= 50,
  },
];

export async function updateStreakAndBadges(userId: string) {
  // Get current profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak, longest_streak, last_checkin_date")
    .eq("user_id", userId)
    .single();

  if (!profile) return;

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const lastDate = profile.last_checkin_date;

  // Already checked in today
  if (lastDate === today) return;

  let newStreak: number;
  if (lastDate === yesterday) {
    newStreak = (profile.current_streak || 0) + 1;
  } else {
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, profile.longest_streak || 0);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_checkin_date: today,
    })
    .eq("user_id", userId);

  if (updateError) {
    console.error("Streak update failed:", updateError);
    return;
  }

  // Count total checkins
  const { count } = await supabase
    .from("emotion_checkins")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const totalCheckins = (count ?? 0) + 1; // +1 for current

  // Get existing badges
  const { data: existingBadges } = await supabase
    .from("user_badges")
    .select("badge_key")
    .eq("user_id", userId);

  const earned = new Set((existingBadges ?? []).map((b) => b.badge_key));

  // Award new badges
  const newBadges = BADGES.filter(
    (b) => !earned.has(b.key) && b.condition(newStreak, totalCheckins)
  );

  if (newBadges.length > 0) {
    await supabase.rpc("award_badges", {
      _badge_keys: newBadges.map((b) => b.key),
    });
  }

  return { streak: newStreak, longest: newLongest, newBadges };
}
