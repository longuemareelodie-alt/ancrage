import { supabase } from "@/integrations/supabase/client";

export interface BadgeDef {
  key: string;
  emoji: string;
  label: string;
  description: string;
  condition: (streak: number, totalCheckins: number) => boolean;
}

export const BADGES: BadgeDef[] = [
  {
    key: "first_checkin",
    emoji: "🌱",
    label: "Tu as commencé",
    description: "Tu as osé regarder ce que tu ressens. C'est déjà énorme.",
    condition: (_, total) => total >= 1,
  },
  {
    key: "streak_3",
    emoji: "🔥",
    label: "3 jours pour toi",
    description: "3 jours de suite où tu as pris soin de toi. Ton corps s'en souvient.",
    condition: (s) => s >= 3,
  },
  {
    key: "streak_7",
    emoji: "⭐",
    label: "Une semaine de présence",
    description: "7 jours à t'écouter. Tu crées un espace de sécurité pour toi.",
    condition: (s) => s >= 7,
  },
  {
    key: "streak_14",
    emoji: "💪",
    label: "Ton système se régule",
    description: "14 jours. Ton système nerveux commence à se reprogrammer.",
    condition: (s) => s >= 14,
  },
  {
    key: "streak_30",
    emoji: "👑",
    label: "Un mois de transformation",
    description: "30 jours. Tu n'es plus la même. Et c'est toi qui as fait ça.",
    condition: (s) => s >= 30,
  },
  {
    key: "checkins_10",
    emoji: "💜",
    label: "10 moments pour toi",
    description: "10 fois où tu as choisi de t'écouter plutôt que de t'ignorer.",
    condition: (_, total) => total >= 10,
  },
  {
    key: "checkins_50",
    emoji: "💎",
    label: "Tu as changé ta relation à toi",
    description: "50 check-ins. Prendre soin de toi est devenu un réflexe.",
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
