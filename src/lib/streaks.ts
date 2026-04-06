import { supabase } from "@/integrations/supabase/client";

export interface BadgeDef {
  key: string;
  emoji: string;
  label: string;
  description: string;
  condition: (streak: number, totalCheckins: number) => boolean;
}

export const BADGES: BadgeDef[] = [
  { key: "first_checkin", emoji: "🌱", label: "Premier pas", description: "Tu as fait ton premier check-in", condition: (_, total) => total >= 1 },
  { key: "streak_3", emoji: "🔥", label: "3 jours de suite", description: "3 jours consécutifs de check-in", condition: (s) => s >= 3 },
  { key: "streak_7", emoji: "⭐", label: "1 semaine", description: "7 jours consécutifs", condition: (s) => s >= 7 },
  { key: "streak_14", emoji: "💪", label: "2 semaines", description: "14 jours consécutifs", condition: (s) => s >= 14 },
  { key: "streak_30", emoji: "👑", label: "1 mois", description: "30 jours consécutifs", condition: (s) => s >= 30 },
  { key: "checkins_10", emoji: "📝", label: "10 check-ins", description: "10 check-ins au total", condition: (_, total) => total >= 10 },
  { key: "checkins_50", emoji: "💎", label: "50 check-ins", description: "50 check-ins au total", condition: (_, total) => total >= 50 },
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

  await supabase
    .from("profiles")
    .update({ current_streak: newStreak, longest_streak: newLongest })
    .eq("user_id", userId);

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
    await supabase.from("user_badges").insert(
      newBadges.map((b) => ({ user_id: userId, badge_key: b.key }))
    );
  }

  return { streak: newStreak, longest: newLongest, newBadges };
}
