import { describe, it, expect } from "vitest";
import {
  PAYWALL_ENFORCEMENT_CUTOFF_ISO,
  classifyProfileCreatedAt,
  isGrandfatheredAccount,
} from "@/lib/paywallPolicy";

const CUTOFF_MS = new Date(PAYWALL_ENFORCEMENT_CUTOFF_ISO).getTime();

describe("paywallPolicy.classifyProfileCreatedAt", () => {
  it("returns 'missing' for null/undefined/empty", () => {
    expect(classifyProfileCreatedAt(null)).toBe("missing");
    expect(classifyProfileCreatedAt(undefined)).toBe("missing");
    expect(classifyProfileCreatedAt("")).toBe("missing");
  });

  it("returns 'invalid' for non-parseable strings", () => {
    expect(classifyProfileCreatedAt("not-a-date")).toBe("invalid");
    expect(classifyProfileCreatedAt("2026-13-99")).toBe("invalid");
  });

  it("returns 'valid' for ISO 8601 timestamps", () => {
    expect(classifyProfileCreatedAt("2024-01-15T10:30:00Z")).toBe("valid");
    expect(classifyProfileCreatedAt(PAYWALL_ENFORCEMENT_CUTOFF_ISO)).toBe("valid");
  });
});

describe("paywallPolicy.isGrandfatheredAccount", () => {
  it("grandfathers accounts created strictly before the cutoff", () => {
    const before = new Date(CUTOFF_MS - 1000).toISOString();
    expect(isGrandfatheredAccount(before)).toBe(true);
  });

  it("does NOT grandfather accounts created exactly at the cutoff", () => {
    expect(isGrandfatheredAccount(PAYWALL_ENFORCEMENT_CUTOFF_ISO)).toBe(false);
  });

  it("does NOT grandfather accounts created after the cutoff", () => {
    const after = new Date(CUTOFF_MS + 1000).toISOString();
    expect(isGrandfatheredAccount(after)).toBe(false);
  });

  it("does NOT grandfather when created_at is missing (conservative fallback)", () => {
    expect(isGrandfatheredAccount(null)).toBe(false);
    expect(isGrandfatheredAccount(undefined)).toBe(false);
    expect(isGrandfatheredAccount("")).toBe(false);
  });

  it("does NOT grandfather when created_at is invalid (conservative fallback)", () => {
    expect(isGrandfatheredAccount("not-a-date")).toBe(false);
    expect(isGrandfatheredAccount("2026-13-99")).toBe(false);
  });

  it("grandfathers a typical pre-cutoff timestamp (1 year before)", () => {
    const oneYearBefore = new Date(CUTOFF_MS - 365 * 24 * 3600 * 1000).toISOString();
    expect(isGrandfatheredAccount(oneYearBefore)).toBe(true);
  });

  it("does not grandfather a typical post-cutoff timestamp (1 day after)", () => {
    const oneDayAfter = new Date(CUTOFF_MS + 24 * 3600 * 1000).toISOString();
    expect(isGrandfatheredAccount(oneDayAfter)).toBe(false);
  });
});

describe("paywallPolicy.isGrandfatheredAccount — table-driven regression matrix", () => {
  // Each row: [label, createdAt input, expected grandfathered?]
  const cases: Array<[string, string | null | undefined, boolean]> = [
    // --- Far in the past (clearly grandfathered) ---
    ["epoch (1970-01-01)", "1970-01-01T00:00:00Z", true],
    ["year 2000", "2000-01-01T00:00:00Z", true],
    ["2020-06-15", "2020-06-15T12:00:00Z", true],
    ["2024-01-01", "2024-01-01T00:00:00Z", true],
    ["2025-12-31 end of day UTC", "2025-12-31T23:59:59Z", true],

    // --- Just before cutoff (boundary, grandfathered) ---
    ["1ms before cutoff", new Date(CUTOFF_MS - 1).toISOString(), true],
    ["1s before cutoff", new Date(CUTOFF_MS - 1000).toISOString(), true],
    ["1min before cutoff", new Date(CUTOFF_MS - 60_000).toISOString(), true],
    ["1h before cutoff", new Date(CUTOFF_MS - 3_600_000).toISOString(), true],
    ["1 day before cutoff", new Date(CUTOFF_MS - 86_400_000).toISOString(), true],

    // --- Exactly at cutoff (NOT grandfathered, strict <) ---
    ["exactly at cutoff (ISO constant)", PAYWALL_ENFORCEMENT_CUTOFF_ISO, false],
    ["exactly at cutoff (rebuilt)", new Date(CUTOFF_MS).toISOString(), false],

    // --- Just after cutoff (NOT grandfathered) ---
    ["1ms after cutoff", new Date(CUTOFF_MS + 1).toISOString(), false],
    ["1s after cutoff", new Date(CUTOFF_MS + 1000).toISOString(), false],
    ["1h after cutoff", new Date(CUTOFF_MS + 3_600_000).toISOString(), false],
    ["1 day after cutoff", new Date(CUTOFF_MS + 86_400_000).toISOString(), false],

    // --- Far in the future (NOT grandfathered) ---
    ["1 year after cutoff", new Date(CUTOFF_MS + 365 * 86_400_000).toISOString(), false],
    ["year 2030", "2030-01-01T00:00:00Z", false],
    ["year 2050", "2050-06-15T12:00:00Z", false],

    // --- Timezone variants equivalent to a pre-cutoff instant ---
    // Cutoff is 2026-04-29T00:00:00Z. 2026-04-28T20:00:00-05:00 == 2026-04-29T01:00:00Z (after)
    ["TZ -05:00 resolving AFTER cutoff", "2026-04-28T20:00:00-05:00", false],
    // 2026-04-28T18:00:00-05:00 == 2026-04-28T23:00:00Z (before)
    ["TZ -05:00 resolving BEFORE cutoff", "2026-04-28T18:00:00-05:00", true],
    // 2026-04-29T01:00:00+02:00 == 2026-04-28T23:00:00Z (before)
    ["TZ +02:00 resolving BEFORE cutoff", "2026-04-29T01:00:00+02:00", true],
    // 2026-04-29T03:00:00+02:00 == 2026-04-29T01:00:00Z (after)
    ["TZ +02:00 resolving AFTER cutoff", "2026-04-29T03:00:00+02:00", false],

    // --- Anomalies (conservative fallback: NOT grandfathered) ---
    ["null", null, false],
    ["undefined", undefined, false],
    ["empty string", "", false],
    ["whitespace-only string is parsed as invalid", "   ", false],
    ["garbage string", "not-a-date", false],
    ["malformed ISO (month 13)", "2026-13-01T00:00:00Z", false],
    ["malformed ISO (day 99)", "2026-04-99T00:00:00Z", false],
  ];

  it.each(cases)("%s → grandfathered=%s", (_label, input, expected) => {
    expect(isGrandfatheredAccount(input)).toBe(expected);
  });
});
