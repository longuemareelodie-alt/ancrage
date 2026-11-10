import { describe, it, expect } from "vitest";
import { entriesForMonth, budgetMonthKeyOf } from "./budgetMonth";

describe("budget month", () => {
  it("counts a copied salary only once in the current month", () => {
    const rows = [
      { kind: "income", amount_cents: 200000, month: "2026-10-01", created_at: "2026-10-02T10:00:00Z", recurring: true },
      { kind: "income", amount_cents: 200000, month: "2026-11-01", created_at: "2026-11-01T10:00:00Z", recurring: true },
    ];
    const nov = entriesForMonth(rows, "2026-11");
    expect(nov.reduce((s, r) => s + r.amount_cents, 0)).toBe(200000);
  });

  it("falls back to created_at for legacy lines without month", () => {
    expect(budgetMonthKeyOf({ month: null, created_at: "2026-08-15T09:00:00Z" })).toBe("2026-08");
  });

  it("excludes past months' variable expenses", () => {
    const rows = [{ kind: "variable", amount_cents: 5000, month: "2026-10-01", created_at: "2026-10-05T00:00:00Z" }];
    expect(entriesForMonth(rows, "2026-11")).toHaveLength(0);
  });
});
