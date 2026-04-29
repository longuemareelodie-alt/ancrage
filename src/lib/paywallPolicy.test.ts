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
