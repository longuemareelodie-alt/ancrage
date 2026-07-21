import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

// Sends:
//  - email reminders 24h and 1h before each appointment
//  - email + push reminders for medications at scheduled times
// Designed to be invoked by pg_cron every 5-10 minutes.

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const now = new Date();
  const results = { appointments_24h: 0, appointments_1h: 0, medications: 0, agenda: 0, todos: 0, errors: [] as string[] };

  try {
    // ============ APPOINTMENTS ============
    // 24h reminder window: appointments between now+23h and now+25h not yet sent
    const in23h = new Date(now.getTime() + 23 * 3600 * 1000).toISOString();
    const in25h = new Date(now.getTime() + 25 * 3600 * 1000).toISOString();
    const { data: apts24 } = await supabase
      .from("appointments")
      .select("id, user_id, title, appointment_at, location")
      .eq("reminder_24h_sent", false)
      .gte("appointment_at", in23h)
      .lte("appointment_at", in25h);

    for (const apt of apts24 ?? []) {
      const ok = await sendAppointmentReminder(supabase, apt, "24h");
      if (ok) {
        await supabase.from("appointments").update({ reminder_24h_sent: true }).eq("id", apt.id);
        results.appointments_24h++;
      }
    }

    // 1h reminder window
    const in30m = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
    const in90m = new Date(now.getTime() + 90 * 60 * 1000).toISOString();
    const { data: apts1 } = await supabase
      .from("appointments")
      .select("id, user_id, title, appointment_at, location")
      .eq("reminder_1h_sent", false)
      .gte("appointment_at", in30m)
      .lte("appointment_at", in90m);

    for (const apt of apts1 ?? []) {
      const ok = await sendAppointmentReminder(supabase, apt, "1h");
      if (ok) {
        await supabase.from("appointments").update({ reminder_1h_sent: true }).eq("id", apt.id);
        results.appointments_1h++;
      }
    }

    // ============ MEDICATIONS ============
    // Check current time (HH:MM) — match medications scheduled within the last 10 minutes
    const { data: meds } = await supabase
      .from("medications")
      .select("id, user_id, name, dosage, schedule_times")
      .eq("active", true);

    const today = now.toISOString().split("T")[0];
    const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

    for (const med of meds ?? []) {
      for (const time of (med.schedule_times ?? []) as string[]) {
        const [h, m] = time.split(":").map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) continue;
        const targetMinutes = h * 60 + m;
        const diff = currentMinutes - targetMinutes;
        // Send if we're within 0-10 minutes after the scheduled time
        if (diff < 0 || diff > 10) continue;

        // Check if already sent today
        const { data: existing } = await supabase
          .from("medication_reminder_log")
          .select("id")
          .eq("medication_id", med.id)
          .eq("reminder_date", today)
          .eq("reminder_time", time)
          .maybeSingle();
        if (existing) continue;

        const ok = await sendMedicationReminder(supabase, med, time);
        if (ok) {
          await supabase.from("medication_reminder_log").insert({
            medication_id: med.id,
            user_id: med.user_id,
            reminder_date: today,
            reminder_time: time,
          });
          results.medications++;
        }
      }
    }

    // ============ AGENDA EVENTS (24h before) ============
    const todayStr = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    const { data: events } = await supabase
      .from("agenda_events")
      .select("id, user_id, title, description, event_date, event_time, location")
      .is("reminder_sent_at", null)
      .in("event_date", [todayStr, tomorrowStr]);

    for (const ev of events ?? []) {
      // Compute event datetime; skip if more than 26h away or already past
      const timePart = ev.event_time ? ev.event_time.slice(0, 5) : "09:00";
      const eventAt = new Date(`${ev.event_date}T${timePart}:00`);
      const hoursUntil = (eventAt.getTime() - now.getTime()) / 3600000;
      if (hoursUntil < -1 || hoursUntil > 26) continue;

      if (!(await userWantsReminders(supabase, ev.user_id))) {
        await supabase.from("agenda_events").update({ reminder_sent_at: now.toISOString() }).eq("id", ev.id);
        continue;
      }
      const ok = await sendAgendaReminder(supabase, ev, eventAt);
      if (ok) {
        await supabase.from("agenda_events").update({ reminder_sent_at: now.toISOString() }).eq("id", ev.id);
        results.agenda++;
      }
    }

    // ============ TO-DO (morning of due date) ============
    // Only remind between 07:00 and 10:00 UTC on the due date
    const hourUtc = now.getUTCHours();
    if (hourUtc >= 7 && hourUtc <= 10) {
      const { data: todos } = await supabase
        .from("todo_items")
        .select("id, user_id, title, priority, due_date")
        .is("reminder_sent_at", null)
        .eq("done", false)
        .eq("due_date", todayStr);

      for (const t of todos ?? []) {
        if (!(await userWantsReminders(supabase, t.user_id))) {
          await supabase.from("todo_items").update({ reminder_sent_at: now.toISOString() }).eq("id", t.id);
          continue;
        }
        const ok = await sendTodoReminder(supabase, t);
        if (ok) {
          await supabase.from("todo_items").update({ reminder_sent_at: now.toISOString() }).eq("id", t.id);
          results.todos++;
        }
      }
    }
  } catch (e) {
    results.errors.push(String(e));
  }

  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

async function getUserEmail(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase.from("profiles").select("email, first_name").eq("user_id", userId).single();
  return data?.email ?? null;
}

async function userWantsReminders(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase.from("profiles").select("reminders_enabled").eq("user_id", userId).single();
  return data?.reminders_enabled !== false;
}

async function sendAgendaReminder(supabase: any, ev: any, eventAt: Date): Promise<boolean> {
  const email = await getUserEmail(supabase, ev.user_id);
  if (!email) return false;
  const dateStr = eventAt.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const timeStr = ev.event_time ? ev.event_time.slice(0, 5) : null;
  const subject = `📅 Rappel : ${ev.title} demain`;
  const html = `
<div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; color: #333;">
  <h1 style="color: #5b8def; font-size: 22px; margin-bottom: 16px;">C'est demain 💛</h1>
  <div style="background: #f5f7fa; border-radius: 12px; padding: 20px; margin: 16px 0;">
    <p style="margin: 0 0 8px; font-size: 18px; font-weight: 600;">${escapeHtml(ev.title)}</p>
    <p style="margin: 0; font-size: 14px; color: #666;">📅 ${dateStr}${timeStr ? ` à ${timeStr}` : ""}</p>
    ${ev.location ? `<p style="margin: 8px 0 0; font-size: 14px; color: #666;">📍 ${escapeHtml(ev.location)}</p>` : ""}
    ${ev.description ? `<p style="margin: 12px 0 0; font-size: 14px; color: #555;">${escapeHtml(ev.description)}</p>` : ""}
  </div>
  <p style="font-size: 13px; color: #888;">Prends soin de toi 💗</p>
</div>`;
  const emailOk = await sendEmail(supabase, email, subject, html, `agenda-${ev.id}`);
  await sendPush(supabase, ev.user_id, `📅 ${ev.title}`, `Demain${timeStr ? ` à ${timeStr}` : ""}${ev.location ? ` — ${ev.location}` : ""}`);
  return emailOk;
}

async function sendTodoReminder(supabase: any, t: any): Promise<boolean> {
  const email = await getUserEmail(supabase, t.user_id);
  if (!email) return false;
  const prio = t.priority === "haute" ? "🔴 Priorité haute" : t.priority === "basse" ? "Priorité basse" : "";
  const subject = `✅ Rappel : ${t.title}`;
  const html = `
<div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; color: #333;">
  <h1 style="color: #5b8def; font-size: 22px; margin-bottom: 16px;">À faire aujourd'hui 💛</h1>
  <div style="background: #f5f7fa; border-radius: 12px; padding: 20px; margin: 16px 0;">
    <p style="margin: 0 0 8px; font-size: 18px; font-weight: 600;">${escapeHtml(t.title)}</p>
    ${prio ? `<p style="margin: 0; font-size: 14px; color: #666;">${prio}</p>` : ""}
  </div>
  <p style="font-size: 13px; color: #888;">Un pas à la fois 🌱</p>
</div>`;
  const emailOk = await sendEmail(supabase, email, subject, html, `todo-${t.id}`);
  await sendPush(supabase, t.user_id, `✅ À faire aujourd'hui`, t.title);
  return emailOk;
}

async function sendAppointmentReminder(supabase: any, apt: any, when: "24h" | "1h"): Promise<boolean> {
  const email = await getUserEmail(supabase, apt.user_id);
  if (!email) return false;

  const date = new Date(apt.appointment_at);
  const dateStr = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const timeStr = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const subject = when === "24h" ? `Rappel : ${apt.title} demain` : `Rappel : ${apt.title} dans 1h`;
  const intro = when === "24h" ? "C'est demain 💛" : "C'est dans 1h 💛";

  const html = `
<div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; color: #333;">
  <h1 style="color: #5b8def; font-size: 22px; margin-bottom: 16px;">${intro}</h1>
  <div style="background: #f5f7fa; border-radius: 12px; padding: 20px; margin: 16px 0;">
    <p style="margin: 0 0 8px; font-size: 18px; font-weight: 600;">${escapeHtml(apt.title)}</p>
    <p style="margin: 0; font-size: 14px; color: #666;">📅 ${dateStr} à ${timeStr}</p>
    ${apt.location ? `<p style="margin: 8px 0 0; font-size: 14px; color: #666;">📍 ${escapeHtml(apt.location)}</p>` : ""}
  </div>
  <p style="font-size: 13px; color: #888;">Prends soin de toi 💗</p>
</div>`;

  return await sendEmail(supabase, email, subject, html, `apt-${when}-${apt.id}`);
}

async function sendMedicationReminder(supabase: any, med: any, time: string): Promise<boolean> {
  const email = await getUserEmail(supabase, med.user_id);
  if (!email) return false;

  const subject = `💊 Rappel : ${med.name}`;
  const html = `
<div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; color: #333;">
  <h1 style="color: #5b8def; font-size: 22px; margin-bottom: 16px;">C'est l'heure de ton traitement 💛</h1>
  <div style="background: #f5f7fa; border-radius: 12px; padding: 20px; margin: 16px 0;">
    <p style="margin: 0 0 8px; font-size: 18px; font-weight: 600;">💊 ${escapeHtml(med.name)}</p>
    ${med.dosage ? `<p style="margin: 0; font-size: 14px; color: #666;">${escapeHtml(med.dosage)}</p>` : ""}
    <p style="margin: 8px 0 0; font-size: 14px; color: #666;">⏰ ${time}</p>
  </div>
</div>`;

  const today = new Date().toISOString().split("T")[0];
  const emailOk = await sendEmail(supabase, email, subject, html, `med-${med.id}-${today}-${time}`);

  // Push notification
  await sendPush(supabase, med.user_id, `💊 ${med.name}`, `C'est l'heure de prendre ${med.dosage || "ton traitement"}`);

  return emailOk;
}

async function sendEmail(supabase: any, to: string, subject: string, html: string, idempotencyKey: string): Promise<boolean> {
  try {
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const { error } = await supabase.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        to,
        subject,
        html,
        text,
        purpose: "transactional",
        idempotency_key: idempotencyKey,
        template_name: "health_reminder",
      },
    });
    if (error) {
      console.error("enqueue_email failed", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("sendEmail error", e);
    return false;
  }
}

async function sendPush(supabase: any, userId: string, title: string, body: string) {
  try {
    const { data: subs } = await supabase.from("push_subscriptions").select("*").eq("user_id", userId);
    if (!subs?.length) return;
    // Delegate to existing push function
    await supabase.functions.invoke("send-push-notifications", {
      body: { user_ids: [userId], title, body },
    });
  } catch (e) {
    console.error("push failed", e);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
