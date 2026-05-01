// E2E test for retry-account-emails
//
// Scénario : on simule l'échec de mollie-webhook lors de l'envoi de l'email
// d'activation. Le webhook, dans ce cas, écrit une ligne dans
// `pending_account_emails` (status='pending', next_attempt_at ~ now+60s).
// Un cron déclenche ensuite l'edge function `retry-account-emails` qui doit :
//   - Cas 1 (succès) : régénérer un magic link, envoyer l'email via
//     send-transactional-email et marquer la ligne 'sent'.
//   - Cas 2 (échec) : incrémenter attempts, replanifier next_attempt_at.
//
// Ces tests appellent la function réellement déployée (vrai end-to-end) avec
// la SERVICE_ROLE_KEY. Le test 1 envoie un VRAI email à e2e@digitalmamanlibre.com.
//
// Prérequis (dans .env à la racine du projet) :
//   - VITE_SUPABASE_URL
//   - SUPABASE_SERVICE_ROLE_KEY  (ajouter manuellement dans .env local)
//
// Exécution : passez par l'outil supabase--test_edge_functions de Lovable.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const skipAll = !SUPABASE_URL;
const skipServiceRole = !SUPABASE_URL || !SERVICE_ROLE_KEY;

if (skipAll) {
  console.warn(
    "[retry-account-emails test] Skipping all: VITE_SUPABASE_URL missing in .env",
  );
} else if (skipServiceRole) {
  console.warn(
    "[retry-account-emails test] Only the unauthenticated-rejection test will run.\n" +
      "  To run the full e2e suite, add SUPABASE_SERVICE_ROLE_KEY to your local .env\n" +
      "  (find it in Lovable Cloud → Backend → Settings → API).\n" +
      "  WARNING: this key bypasses RLS — never commit it.",
  );
}

const FN_URL = `${SUPABASE_URL}/functions/v1/retry-account-emails`;
const E2E_RECIPIENT = "e2e@digitalmamanlibre.com";

const admin = skipServiceRole
  ? null
  : createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

async function insertPending(opts: {
  email: string;
  paymentId: string;
  dueInPast?: boolean;
  maxAttempts?: number;
}): Promise<string> {
  const next = opts.dueInPast
    ? new Date(Date.now() - 60_000).toISOString()
    : new Date(Date.now() + 3_600_000).toISOString();

  const { data, error } = await admin!
    .from("pending_account_emails")
    .insert({
      email: opts.email,
      payment_id: opts.paymentId,
      template_name: "welcome-initiation",
      status: "pending",
      attempts: 0,
      max_attempts: opts.maxAttempts ?? 6,
      next_attempt_at: next,
      last_error: "e2e-simulated-webhook-failure",
    })
    .select("id")
    .single();

  if (error) throw error;
  return data!.id as string;
}

async function fetchRow(id: string) {
  const { data, error } = await admin!
    .from("pending_account_emails")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

async function deleteRow(id: string) {
  // Cleanup via service role (RLS allows it).
  await admin!.from("pending_account_emails").delete().eq("id", id);
}

async function callRetry(): Promise<{ status: number; body: any }> {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY!,
    },
  });
  const body = await res.json();
  return { status: res.status, body };
}

// ---------------------------------------------------------------------------
// Test 1: rejet sans service role
// ---------------------------------------------------------------------------
Deno.test({
  name: "retry-account-emails rejects unauthenticated callers (401)",
  ignore: skip,
  async fn() {
    const res = await fetch(FN_URL, { method: "POST" });
    const body = await res.json().catch(() => ({}));
    assertEquals(res.status, 401, `expected 401, got ${res.status} ${JSON.stringify(body)}`);
  },
});

// ---------------------------------------------------------------------------
// Test 2: succès end-to-end → status passe à 'sent' (envoie un vrai email)
// ---------------------------------------------------------------------------
Deno.test({
  name: "retry-account-emails sends pending row (e2e, real email)",
  ignore: skip,
  async fn() {
    const paymentId = `e2e_success_${Date.now()}`;
    const rowId = await insertPending({
      email: E2E_RECIPIENT,
      paymentId,
      dueInPast: true,
    });

    try {
      const { status, body } = await callRetry();
      assertEquals(status, 200, `worker returned ${status}: ${JSON.stringify(body)}`);

      // Le worker peut traiter d'autres rows en parallèle ; on vérifie le nôtre.
      const row = await fetchRow(rowId);
      assertEquals(
        row.status,
        "sent",
        `row should be 'sent', got '${row.status}' (last_error=${row.last_error})`,
      );
      assertEquals(row.attempts, 1);
      assert(row.sent_at, "sent_at should be set");
      assertEquals(row.last_error, null);
    } finally {
      await deleteRow(rowId);
    }
  },
});

// ---------------------------------------------------------------------------
// Test 3: échec → attempts incrémenté, next_attempt_at replanifié
// On force l'échec en utilisant un email manifestement invalide. generateLink
// rejettera l'adresse, le worker tombera dans le catch et reprogrammera.
// ---------------------------------------------------------------------------
Deno.test({
  name: "retry-account-emails reschedules on failure (no email sent)",
  ignore: skip,
  async fn() {
    const paymentId = `e2e_fail_${Date.now()}`;
    const badEmail = `not a valid email`; // espace = rejet par auth
    const rowId = await insertPending({
      email: badEmail,
      paymentId,
      dueInPast: true,
      maxAttempts: 6,
    });

    try {
      const { status, body } = await callRetry();
      assertEquals(status, 200, `worker returned ${status}: ${JSON.stringify(body)}`);

      const row = await fetchRow(rowId);
      assertEquals(
        row.status,
        "pending",
        `row should remain 'pending' (got '${row.status}'); last_error=${row.last_error}`,
      );
      assertEquals(row.attempts, 1, "attempts should have incremented to 1");
      assert(row.last_attempt_at, "last_attempt_at should be set");
      assert(row.last_error, "last_error should describe the failure");
      // next_attempt_at replanifié dans le futur (backoff 1min)
      const nextAt = new Date(row.next_attempt_at).getTime();
      assert(
        nextAt > Date.now(),
        `next_attempt_at should be in the future, got ${row.next_attempt_at}`,
      );
    } finally {
      await deleteRow(rowId);
    }
  },
});

// ---------------------------------------------------------------------------
// Test 4: ligne non encore due → ignorée (attempts inchangé)
// ---------------------------------------------------------------------------
Deno.test({
  name: "retry-account-emails skips rows whose next_attempt_at is in the future",
  ignore: skip,
  async fn() {
    const paymentId = `e2e_skip_${Date.now()}`;
    const rowId = await insertPending({
      email: E2E_RECIPIENT,
      paymentId,
      dueInPast: false, // futur
    });

    try {
      await callRetry();
      const row = await fetchRow(rowId);
      assertEquals(row.status, "pending");
      assertEquals(row.attempts, 0, "attempts must stay at 0 for non-due rows");
    } finally {
      await deleteRow(rowId);
    }
  },
});
