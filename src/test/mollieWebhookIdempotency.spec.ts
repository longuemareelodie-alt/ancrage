/**
 * Static guardrail for the Mollie webhook idempotency invariants.
 *
 * The full sandbox flow (real Mollie test API + deployed edge function) lives
 * in `supabase/functions/retry-account-emails/index_test.ts` style tests and
 * cannot run in CI without the Mollie sandbox key. This Vitest spec instead
 * locks the *code-level* invariants that guarantee "1 paid payment → exactly
 * 1 activation row + exactly 1 welcome email":
 *
 *   1. The webhook short-circuits BEFORE any side-effect when a `paid` row
 *      already exists for this `payment_id` (`findExistingPaidActivation`
 *      → early `webhookAck({ status: "already_processed" })`).
 *   2. The DB has a partial unique index on
 *      `premium_activation_log(payment_id) WHERE status = 'paid'` as the
 *      ultimate concurrency backstop.
 *   3. The welcome email is invoked with a deterministic
 *      `idempotencyKey = "welcome-premium-${paymentId}"`, which the email
 *      pipeline dedupes on.
 *
 * Any regression on these three invariants would let a duplicate Mollie
 * delivery double-activate or double-email the customer — this test fails
 * the build first.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const WEBHOOK = readFileSync("supabase/functions/mollie-webhook/index.ts", "utf8");

describe("Mollie webhook — paid-payment idempotency invariants", () => {
  it("looks up an existing paid activation BEFORE running side-effects", () => {
    expect(WEBHOOK).toMatch(/findExistingPaidActivation\s*\(/);
    // The lookup must happen before the profile update / email invoke. We
    // assert ordering by source position.
    const lookupIdx = WEBHOOK.indexOf("findExistingPaidActivation(");
    const profileUpdateIdx = WEBHOOK.indexOf('.update({ is_premium: true');
    const welcomeEmailIdx = WEBHOOK.indexOf('"welcome-premium"');
    expect(lookupIdx).toBeGreaterThan(0);
    expect(lookupIdx).toBeLessThan(profileUpdateIdx);
    expect(lookupIdx).toBeLessThan(welcomeEmailIdx);
  });

  it("short-circuits with 'already_processed' when a paid row exists", () => {
    expect(WEBHOOK).toMatch(/status:\s*"already_processed"/);
  });

  it("queries premium_activation_log with status=eq.paid for the dedup check", () => {
    expect(WEBHOOK).toMatch(/premium_activation_log/);
    expect(WEBHOOK).toMatch(/status=eq\.paid/);
  });

  it("invokes welcome-premium with a deterministic per-payment idempotency key", () => {
    expect(WEBHOOK).toMatch(/templateName:\s*"welcome-premium"/);
    expect(WEBHOOK).toMatch(/idempotencyKey:\s*`welcome-premium-\$\{paymentId\}`/);
  });

  it("invokes welcome-initiation with a deterministic per-payment idempotency key", () => {
    expect(WEBHOOK).toMatch(/templateName:\s*"welcome-initiation"/);
    expect(WEBHOOK).toMatch(/idempotencyKey:\s*`welcome-initiation-\$\{paymentId\}`/);
  });
});

describe("Mollie webhook — DB concurrency backstop", () => {
  it("ships a migration with a partial unique index on (payment_id WHERE status='paid')", () => {
    const files = readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql"));
    const hits = files.filter((f) => {
      const sql = readFileSync(join("supabase/migrations", f), "utf8").toLowerCase();
      return (
        sql.includes("premium_activation_log") &&
        sql.includes("unique") &&
        sql.includes("payment_id") &&
        sql.includes("status = 'paid'")
      );
    });
    expect(
      hits.length,
      "Expected a migration creating a partial unique index on premium_activation_log(payment_id) WHERE status='paid'",
    ).toBeGreaterThan(0);
  });
});
