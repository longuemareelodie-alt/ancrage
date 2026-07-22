import { supabase } from "@/integrations/supabase/client";

export type QuizEventType = "result_view" | "pdf_download" | "cta_click";

export type QuizEventPayload = {
  eventType: QuizEventType;
  score?: number;
  maxScore?: number;
  verdictBadge?: string;
  firstName?: string;
  metadata?: Record<string, unknown>;
};

const SESSION_KEY = "eclosia_quiz_session";

const getSessionId = (): string => {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        (globalThis.crypto?.randomUUID?.() as string | undefined) ??
        `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `s_${Date.now()}`;
  }
};

export async function trackQuizEvent(payload: QuizEventPayload): Promise<void> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("quiz_events").insert({
      event_type: payload.eventType,
      score: payload.score ?? null,
      max_score: payload.maxScore ?? null,
      verdict_badge: payload.verdictBadge ?? null,
      first_name: payload.firstName?.slice(0, 40) ?? null,
      session_id: getSessionId(),
      user_id: userData.user?.id ?? null,
      metadata: payload.metadata ?? null,
    });
  } catch {
    // Silent fail — tracking must never block the user flow
  }
}
