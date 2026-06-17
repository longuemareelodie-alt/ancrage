import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VAPID_PUBLIC_KEY = "BJ8BYifl7YJiA-6ZhmzPZMO6aTTdHTNJzIEyZsLf10JXumrvmvxpANpLsY-y2XmewaDzOfhdd1ssc8nic8k1g_8";

// ─── NON-PREMIUM: emotional pain + curiosity → conversion ───
const nonPremiumMessages = [
  "Tu fais semblant d'aller bien… mais ton corps sait.",
  "Tu pourrais te sentir différente aujourd'hui.",
  "Ce que tu ressens a une explication… mais tu ne la connais pas encore.",
  "Ton corps te parle. Est-ce que tu l'écoutes ?",
  "Il y a une raison à ce que tu ressens. Tu veux la comprendre ?",
  "Et si ce n'était pas juste du stress… mais autre chose ?",
  "Tu mérites mieux que tenir. Tu mérites comprendre.",
  "30 secondes. C'est tout ce qu'il faut pour commencer à changer.",
];

const nonPremiumReactivation = [
  "Ça fait un moment… ton corps n'a pas oublié.",
  "Tu as disparu. Mais ce que tu ressens, non.",
  "Une journée sans check-in, c'est ok. Mais ton système nerveux attend.",
  "Tu es revenue. C'est déjà un acte de courage.",
];

// ─── PREMIUM: emotional support + retention ───
const premiumMorning = [
  "Et si aujourd'hui tu t'écoutais 2 minutes ?",
  "Ton corps mérite une pause aujourd'hui.",
  "Bonjour 💛 Comment tu te sens ce matin ?",
  "Chaque matin est un nouveau départ. Check-in ?",
  "Ton système nerveux se souvient. Prends un instant.",
  "Avant de courir, pose-toi 30 secondes.",
];

const premiumEvening = [
  "Tu as tenu aujourd'hui. Et c'est déjà énorme.",
  "Tu avances plus que tu ne le crois.",
  "La journée touche à sa fin. Tu mérites ce calme.",
  "Ton check-in du soir t'attend. 30 secondes pour toi. 💛",
  "Avant de dormir, écoute ce que ton corps dit.",
  "Tu as traversé cette journée. Bravo.",
];

const premiumEncouragement = [
  "Tu es régulière. Ton système nerveux te remercie. 💛",
  "3 jours de suite. Tu construis quelque chose.",
  "Tu prends soin de toi. C'est rare et précieux.",
  "Ton engagement change ta régulation. Continue.",
];

const premiumReactivation = [
  "Tu nous manques. Ton corps aussi a besoin de toi.",
  "Ça fait un moment. Un check-in rapide ?",
  "Pas de pression. Juste 30 secondes pour toi.",
  "Tu as le droit de revenir doucement.",
];

// ─── EMOTION-SPECIFIC messages ───
const emotionResponses: Record<string, { morning: string[]; evening: string[] }> = {
  anxieuse: {
    morning: ["Hier tu étais anxieuse. Ce matin, respire avant tout.", "L'anxiété revient souvent le matin. 4 sec inspire, 6 sec expire."],
    evening: ["Si l'anxiété est encore là ce soir… elle partira. Respire.", "Ton système nerveux peut redescendre. Laisse-le."],
  },
  epuisee: {
    morning: ["Tu étais épuisée. Ce matin, main sur le cœur avant de commencer.", "Ton corps demande du repos. Écoute-le aujourd'hui."],
    evening: ["L'épuisement ne se règle pas en une nuit. Mais tu fais le travail.", "Demain sera différent. Ce soir, repose-toi."],
  },
  triste: {
    morning: ["La tristesse était là hier. Elle a le droit d'exister encore.", "Ce matin, sois douce avec toi."],
    evening: ["Si la tristesse est encore là… c'est ok. Tu la traverses.", "Tu n'as pas à aller bien ce soir. Juste à être là."],
  },
  colere: {
    morning: ["La colère d'hier protège une blessure. Sois curieuse.", "Ce matin, serre et relâche tes poings. Libère."],
    evening: ["Ta colère est légitime. Ce soir, laisse-la se poser.", "La colère fatigue le corps. Respire longuement."],
  },
  submergee: {
    morning: ["Tu étais submergée. Ce matin, une seule chose à la fois.", "Pose tes pieds au sol. Tu es là. C'est suffisant."],
    evening: ["La vague est passée. Tu es toujours debout.", "Être submergée, c'est humain. Tu gères mieux que tu ne crois."],
  },
  survie: {
    morning: ["Mode survie hier. Ce matin, expire 8 secondes. Doucement.", "Tu fonctionnes en pilote automatique. Reviens à toi."],
    evening: ["Tu as survécu à cette journée. C'est énorme.", "Ton système peut redescendre ce soir. Laisse-le."],
  },
  surmenage: {
    morning: ["Surmenage mental hier. Ce matin, ne réfléchis pas. Respire.", "Ton cerveau tournait en boucle. Aujourd'hui, une pensée à la fois."],
    evening: ["Les pensées tournent encore ? Écris-en 3 et pose le téléphone.", "Tu ne trouveras pas la réponse ce soir. Repose ton mental."],
  },
  vide: {
    morning: ["Le vide est un signal, pas un échec. Ce matin, touche quelque chose.", "Tu es en mode protection. C'est ok. Reviens doucement."],
    evening: ["Si tu te sens vide ce soir, passe tes mains sous l'eau froide.", "Le vide passera. Tu es en train de te reconstruire."],
  },
  perdue: {
    morning: ["Tu te sentais perdue. Ce matin, une seule intention suffit.", "Le brouillard se lève. Doucement."],
    evening: ["Tu n'as pas besoin de tout comprendre ce soir.", "Être perdue, c'est temporaire. Tu retrouves ton chemin."],
  },
  oppressee: {
    morning: ["L'oppression était là. Ce matin, ouvre les bras. Prends de la place.", "Ton corps a besoin d'espace. Étire-toi."],
    evening: ["La pression peut redescendre ce soir. Respire profondément.", "Tu as le droit de prendre de la place. Toujours."],
  },
  // Positive emotions — reinforcement
  calme: {
    morning: ["Tu étais calme hier. Ancre ce ressenti ce matin. 💛", "Le calme revient. Tu le crées."],
    evening: ["Le calme t'appartient. Savoure-le ce soir.", "Ton système nerveux se régule. Continue."],
  },
  fiere: {
    morning: ["Tu étais fière de toi. Ce matin, rappelle-toi pourquoi.", "Bravo pour hier. Aujourd'hui aussi, tu peux."],
    evening: ["Tu as le droit d'être fière. Encore ce soir.", "Ce que tu as fait compte. Vraiment."],
  },
  stable: {
    morning: ["La stabilité d'hier est un cadeau. Ancre-la aujourd'hui.", "Tu es au centre. Reste là."],
    evening: ["Stable ce soir. C'est exactement là où tu dois être.", "Ton équilibre se construit jour après jour."],
  },
};

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Minimal Web Push implementation using raw crypto
async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  _payload: string,
  vapidPrivateKey: string,
) {
  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const header = btoa(JSON.stringify({ typ: "JWT", alg: "ES256" }))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const now = Math.floor(Date.now() / 1000);
  const claimSet = btoa(JSON.stringify({
    aud: audience,
    exp: now + 3600,
    sub: "mailto:contact@ancrage.app",
  })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const unsignedToken = `${header}.${claimSet}`;

  const privKeyBytes = Uint8Array.from(
    atob(vapidPrivateKey.replace(/-/g, "+").replace(/_/g, "/")),
    (c) => c.charCodeAt(0),
  );
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    await convertRawToP8(privKeyBytes),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    new TextEncoder().encode(unsignedToken),
  );

  const sigBytes = new Uint8Array(signature);
  const sigB64 = btoa(String.fromCharCode(...sigBytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const jwt = `${unsignedToken}.${sigB64}`;

  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      Authorization: `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
      "Content-Type": "application/octet-stream",
      TTL: "86400",
      "Content-Length": "0",
    },
  });

  return response.ok;
}

async function convertRawToP8(raw: Uint8Array): Promise<ArrayBuffer> {
  const minPrefix = new Uint8Array([
    0x30, 0x41, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86,
    0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
    0x03, 0x01, 0x07, 0x04, 0x27, 0x30, 0x25, 0x02, 0x01, 0x01, 0x04, 0x20,
  ]);
  const result = new Uint8Array(minPrefix.length + raw.length);
  result.set(minPrefix);
  result.set(raw, minPrefix.length);
  return result.buffer;
}

// ─── Determine user context & pick message ───
interface UserContext {
  isPremium: boolean;
  lastEmotion: string | null;
  lastCheckinDate: string | null;
  type: "morning" | "evening";
}

function buildNotification(ctx: UserContext): { title: string; body: string; url: string } {
  const now = new Date();
  const hoursSinceCheckin = ctx.lastCheckinDate
    ? (now.getTime() - new Date(ctx.lastCheckinDate).getTime()) / (1000 * 60 * 60)
    : Infinity;

  const isInactive = hoursSinceCheckin > 24;
  const isActive = hoursSinceCheckin < 12;
  const checkedToday = ctx.lastCheckinDate === now.toISOString().split("T")[0];

  // ─── NON-PREMIUM ───
  if (!ctx.isPremium) {
    let body: string;
    if (isInactive) {
      body = pick(nonPremiumReactivation);
    } else {
      body = pick(nonPremiumMessages);
    }
    return {
      title: "Eclosia",
      body: body + "\n→ Accède à la suite dans Eclosia",
      url: "/aller-plus-loin",
    };
  }

  // ─── PREMIUM ───
  // 1. Emotion-specific (if checked today and we have emotion data)
  if (checkedToday && ctx.lastEmotion && emotionResponses[ctx.lastEmotion]) {
    const emotionMsgs = emotionResponses[ctx.lastEmotion];
    const msgs = ctx.type === "evening" ? emotionMsgs.evening : emotionMsgs.morning;
    return { title: "Eclosia 💛", body: pick(msgs), url: "/checkin" };
  }

  // 2. Inactive > 24h → reactivation
  if (isInactive) {
    return { title: "Eclosia 💛", body: pick(premiumReactivation), url: "/checkin" };
  }

  // 3. Active user → encouragement (30% chance) or regular message
  if (isActive && Math.random() < 0.3) {
    return { title: "Eclosia 💛", body: pick(premiumEncouragement), url: "/checkin" };
  }

  // 4. Regular time-based message
  const body = ctx.type === "evening" ? pick(premiumEvening) : pick(premiumMorning);
  return { title: "Eclosia 💛", body, url: "/checkin" };
}

// ─── Main handler ───
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    if (!vapidPrivateKey) {
      return new Response(JSON.stringify({ error: "VAPID key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { type = "morning" } = await req.json().catch(() => ({ type: "morning" }));

    // Fetch subscriptions
    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth, user_id");

    if (!subscriptions?.length) {
      return new Response(JSON.stringify({ sent: 0, details: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch profiles with emotion context
    const userIds = [...new Set(subscriptions.map((s: any) => s.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, is_premium, last_emotion, last_checkin_date")
      .in("user_id", userIds);

    const profileMap = new Map(
      profiles?.map((p: any) => [p.user_id, p]) || [],
    );

    let sent = 0;
    const details: { userId: string; message: string; status: string }[] = [];

    for (const sub of subscriptions) {
      const profile = profileMap.get(sub.user_id) || {};
      const ctx: UserContext = {
        isPremium: profile.is_premium ?? false,
        lastEmotion: profile.last_emotion ?? null,
        lastCheckinDate: profile.last_checkin_date ?? null,
        type: type as "morning" | "evening",
      };

      const notification = buildNotification(ctx);

      try {
        const ok = await sendWebPush(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          JSON.stringify(notification),
          vapidPrivateKey,
        );
        if (ok) sent++;
        details.push({
          userId: sub.user_id,
          message: notification.body.slice(0, 60),
          status: ok ? "sent" : "failed",
        });
      } catch (err) {
        console.error("Push failed for", sub.endpoint, err);
        details.push({ userId: sub.user_id, message: notification.body.slice(0, 60), status: "error" });
      }
    }

    return new Response(JSON.stringify({ sent, total: subscriptions.length, details }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
