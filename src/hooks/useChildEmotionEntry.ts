import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { AgeBand, EmotionKey } from "@/data/childEmotionsCatalog";

export type ChildEmotionEntryInput = {
  age_band: AgeBand;
  emotion: EmotionKey | string;
  intensity?: number | null;
  body_location?: string | null;
  observed_signs?: string[] | null;
  note?: string | null;
  is_crisis?: boolean;
  needs_parent?: boolean;
};

export function useChildEmotionEntry() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const save = async (input: ChildEmotionEntryInput) => {
    if (!user) {
      toast.error("Connecte-toi pour sauvegarder.");
      return null;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("child_emotion_entries")
      .insert({
        user_id: user.id,
        age_band: input.age_band,
        emotion: input.emotion,
        intensity: input.intensity ?? null,
        body_location: input.body_location ?? null,
        observed_signs: input.observed_signs ?? null,
        note: input.note ?? null,
        is_crisis: input.is_crisis ?? false,
        needs_parent: input.needs_parent ?? false,
      })
      .select()
      .single();
    setSaving(false);
    if (error) {
      console.error(error);
      toast.error("Impossible de sauvegarder.");
      return null;
    }
    return data;
  };

  return { save, saving };
}
