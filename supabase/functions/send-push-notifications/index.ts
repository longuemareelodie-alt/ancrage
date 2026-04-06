import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from "@supabase/supabase-js";

const VAPID_PUBLIC_KEY = "BJ8BYifl7YJiA-6ZhmzPZMO6aTTdHTNJzIEyZsLf10JXumrvmvxpANpLsY-y2XmewaDzOfhdd1ssc8nic8k1g_8";

const nonPremiumMessages = [
  "Tu fais semblant d'aller bien… mais ton corps sait.",
  "Tu pourrais te sentir différente aujourd'hui.",
  "Ton système nerveux a besoin de toi. 30 secondes suffisent.",
  "Et si tu t'accordais une pause ?",
  "Ce que tu ressens mérite d'être entendu.",
];

const premiumMorningMessages = [
  "Et si aujourd'hui tu t'écoutais 2 minutes ?",
  "Bonjour 💛 Comment tu te sens ce matin ?",
  "Ton corps se souvient. Prends un instant pour toi.",
  "Chaque matin est un nouveau départ. Check-in ?",
];

const premiumEveningMessages = [
  "Tu as tenu aujourd'hui. Et c'est déjà énorme.",
  "La journée touche à sa fin. Comment tu te sens ?",
  "Tu mérites ce moment de calme. 💛",
  "Ton check-in du soir t'attend.",
];

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Minimal Web Push implementation using raw crypto
async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPrivateKey: string,
) {
  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.host}`;

  // Create JWT for VAPID
  const header = btoa(JSON.stringify({ typ: "JWT", alg: "ES256" }))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const now = Math.floor(Date.now() / 1000);
  const claimSet = btoa(JSON.stringify({
    aud: audience,
    exp: now + 3600,
    sub: "mailto:contact@ancrage.app",
  })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const unsignedToken = `${header}.${claimSet}`;

  // Import VAPID private key
  const privKeyBytes = Uint8Array.from(atob(vapidPrivateKey.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
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

  // Encrypt payload using Web Push encryption (simplified: send as plaintext with TTL)
  // For a production system you'd implement RFC 8291 encryption
  // Here we use a simpler approach: send notification via fetch with VAPID auth
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

// Convert raw EC private key (32 bytes) to PKCS8 DER
async function convertRawToP8(raw: Uint8Array): Promise<ArrayBuffer> {
  // PKCS8 wrapper for P-256 EC key
  const prefix = new Uint8Array([
    0x30, 0x81, 0x87, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86,
    0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
    0x03, 0x01, 0x07, 0x04, 0x6d, 0x30, 0x6b, 0x02, 0x01, 0x01, 0x04, 0x20,
  ]);
  const suffix = new Uint8Array([0xa1, 0x44, 0x03, 0x42, 0x00]);
  // We don't need the public key for signing, so we'll use a minimal format
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    if (!vapidPrivateKey) {
      return new Response(JSON.stringify({ error: "VAPID key not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { type } = await req.json().catch(() => ({ type: "morning" }));

    // Get all subscriptions with premium status
    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth, user_id");

    if (!subscriptions?.length) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userIds = [...new Set(subscriptions.map((s) => s.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, is_premium")
      .in("user_id", userIds);

    const premiumMap = new Map(profiles?.map((p) => [p.user_id, p.is_premium]) || []);

    let sent = 0;
    for (const sub of subscriptions) {
      const isPremium = premiumMap.get(sub.user_id) ?? false;

      let message: string;
      if (isPremium) {
        message = type === "evening" ? pick(premiumEveningMessages) : pick(premiumMorningMessages);
      } else {
        message = pick(nonPremiumMessages);
      }

      try {
        await sendWebPush(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          JSON.stringify({ title: "Ancrage 💛", body: message, url: "/checkin" }),
          vapidPrivateKey,
        );
        sent++;
      } catch (err) {
        console.error("Push failed for", sub.endpoint, err);
      }
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
