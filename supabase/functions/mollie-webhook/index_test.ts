/**
 * Sandbox tests for the Mollie webhook idempotency invariants.
 *
 * These tests do NOT hit the real Mollie API or the real Supabase project.
 * They stub global `fetch` so the webhook handler runs against an in-memory
 * fake Mollie + Supabase REST. We then assert two invariants per "paid"
 * payment:
 *
 *   1. Exactly ONE `paid` row is inserted into `premium_activation_log`,
 *      even if the webhook fires twice for the same payment_id.
 *   2. Exactly ONE `welcome-premium` transactional email is invoked,
 *      even if the webhook fires twice for the same payment_id.
 *
 * Run with: supabase functions test (Deno test runner).
 */
import {
  assertEquals,
  assert,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = "http://mock.supabase.local";
const SERVICE_ROLE_KEY = "test-service-role-key";
const MOLLIE_KEY = "test-mollie-key";

Deno.env.set("SUPABASE_URL", SUPABASE_URL);
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", SERVICE_ROLE_KEY);
Deno.env.set("MOLLIE_API_KEY", MOLLIE_KEY);

// Import AFTER env vars are set so the module reads consistent values.
const { handleMollieWebhook } = await import("./index.ts");

interface FakeState {
  paymentId: string;
  paidLogRows: Array<Record<string, unknown>>;
  allLogRows: Array<Record<string, unknown>>;
  emailInvocations: Array<{ templateName: string; recipientEmail: string; idempotencyKey: string }>;
  profile: {
    user_id: string;
    email: string;
    first_name: string;
    is_premium: boolean;
    plan_type: string;
    has_initiation_access: boolean;
  };
}

function buildFakeFetch(state: FakeState): typeof fetch {
  return async (input: Request | URL | string, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();

    // ---- Mollie API: GET payment ----
    if (url.startsWith(`https://api.mollie.com/v2/payments/${state.paymentId}`)) {
      return new Response(
        JSON.stringify({
          id: state.paymentId,
          status: "paid",
          amount: { value: "39.00", currency: "EUR" },
          method: "creditcard",
          metadata: { user_id: state.profile.user_id, product: "premium" },
          billingEmail: state.profile.email,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    // ---- Supabase REST: premium_activation_log ----
    if (url.startsWith(`${SUPABASE_URL}/rest/v1/premium_activation_log`)) {
      if (method === "GET") {
        // Idempotency lookup: ?payment_id=eq.X&status=eq.paid
        const wantsPaid = url.includes("status=eq.paid");
        const matching = state.paidLogRows
          .filter((r) => !wantsPaid || r.status === "paid")
          .map((r) => ({ user_id: r.user_id ?? null, created_at: r.created_at ?? new Date().toISOString() }));
        return new Response(JSON.stringify(matching), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (method === "POST") {
        const body = init?.body ? JSON.parse(init.body as string) : {};
        const row = { ...body, created_at: new Date().toISOString() };
        state.allLogRows.push(row);
        if (row.status === "paid") {
          // Mimic the partial unique index: refuse a 2nd "paid" row for same payment_id.
          const dupe = state.paidLogRows.some((r) => r.payment_id === row.payment_id);
          if (dupe) {
            return new Response(
              JSON.stringify({ code: "23505", message: "duplicate key value" }),
              { status: 409 },
            );
          }
          state.paidLogRows.push(row);
        }
        return new Response(null, { status: 201 });
      }
    }

    // ---- Supabase REST: profiles ----
    if (url.startsWith(`${SUPABASE_URL}/rest/v1/profiles`)) {
      if (method === "GET") {
        // Lookup by user_id or email; return current profile if id matches.
        return new Response(JSON.stringify([{ ...state.profile }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (method === "PATCH") {
        const body = init?.body ? JSON.parse(init.body as string) : {};
        Object.assign(state.profile, body);
        return new Response(JSON.stringify([{ ...state.profile }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // ---- Supabase functions: send-transactional-email ----
    if (url.includes("/functions/v1/send-transactional-email")) {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      state.emailInvocations.push({
        templateName: body.templateName,
        recipientEmail: body.recipientEmail,
        idempotencyKey: body.idempotencyKey,
      });
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Anything else: return empty 200 (subscription endpoints, anomalies, etc.).
    return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
  };
}

function buildPaidWebhookRequest(paymentId: string): Request {
  const form = new URLSearchParams();
  form.set("id", paymentId);
  return new Request("http://mock.supabase.local/functions/v1/mollie-webhook", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
}

function freshState(paymentId: string): FakeState {
  return {
    paymentId,
    paidLogRows: [],
    allLogRows: [],
    emailInvocations: [],
    profile: {
      user_id: "11111111-1111-1111-1111-111111111111",
      email: "buyer@example.com",
      first_name: "Test",
      is_premium: false,
      plan_type: "none",
      has_initiation_access: false,
    },
  };
}

Deno.test("Mollie webhook: a single 'paid' delivery activates premium exactly once", async () => {
  const state = freshState("tr_singlepaid_001");
  const originalFetch = globalThis.fetch;
  globalThis.fetch = buildFakeFetch(state);
  try {
    const res = await handleMollieWebhook(buildPaidWebhookRequest(state.paymentId));
    await res.text();
    assertEquals(res.status, 200);
  } finally {
    globalThis.fetch = originalFetch;
  }

  const paidRows = state.paidLogRows.filter((r) => r.payment_id === state.paymentId);
  assertEquals(paidRows.length, 1, "exactly one paid activation row must be inserted");

  const welcomeEmails = state.emailInvocations.filter(
    (e) => e.templateName === "welcome-premium" && e.idempotencyKey === `welcome-premium-${state.paymentId}`,
  );
  assertEquals(welcomeEmails.length, 1, "exactly one welcome-premium email must be sent");
  assertEquals(welcomeEmails[0].recipientEmail, state.profile.email);
  assert(state.profile.is_premium, "profile.is_premium must be flipped to true");
});

Deno.test("Mollie webhook: a duplicate 'paid' delivery is idempotent (no extra activation, no extra email)", async () => {
  const state = freshState("tr_dupepaid_002");
  const originalFetch = globalThis.fetch;
  globalThis.fetch = buildFakeFetch(state);
  try {
    const res1 = await handleMollieWebhook(buildPaidWebhookRequest(state.paymentId));
    await res1.text();
    const res2 = await handleMollieWebhook(buildPaidWebhookRequest(state.paymentId));
    await res2.text();
    assertEquals(res1.status, 200);
    assertEquals(res2.status, 200);
  } finally {
    globalThis.fetch = originalFetch;
  }

  const paidRows = state.paidLogRows.filter((r) => r.payment_id === state.paymentId);
  assertEquals(paidRows.length, 1, "duplicate webhook must NOT create a second paid row");

  const welcomeEmails = state.emailInvocations.filter((e) => e.templateName === "welcome-premium");
  assertEquals(welcomeEmails.length, 1, "duplicate webhook must NOT send a second welcome email");
});

Deno.test("Mollie webhook: two distinct paid payments produce two activations and two emails", async () => {
  const stateA = freshState("tr_paidA_003");
  const stateB = freshState("tr_paidB_004");
  stateB.profile.user_id = "22222222-2222-2222-2222-222222222222";
  stateB.profile.email = "second@example.com";

  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = buildFakeFetch(stateA);
    await (await handleMollieWebhook(buildPaidWebhookRequest(stateA.paymentId))).text();

    globalThis.fetch = buildFakeFetch(stateB);
    await (await handleMollieWebhook(buildPaidWebhookRequest(stateB.paymentId))).text();
  } finally {
    globalThis.fetch = originalFetch;
  }

  assertEquals(stateA.paidLogRows.length, 1);
  assertEquals(stateB.paidLogRows.length, 1);
  assertEquals(
    stateA.emailInvocations.filter((e) => e.templateName === "welcome-premium").length,
    1,
  );
  assertEquals(
    stateB.emailInvocations.filter((e) => e.templateName === "welcome-premium").length,
    1,
  );
});
