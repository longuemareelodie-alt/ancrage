/**
 * Budget lines belong to one month: `month` when set, otherwise the month they were created in.
 * Same rule as the Budget page, so every screen shows the same totals.
 */
export type MonthEntry = { month?: string | null; created_at?: string | null };

export const budgetMonthKeyOf = (e: MonthEntry): string => (e.month ?? e.created_at ?? "").slice(0, 7);

export const currentBudgetMonthKey = (d: Date = new Date()): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export function entriesForMonth<T extends MonthEntry>(rows: T[], monthKey: string = currentBudgetMonthKey()): T[] {
  const key = monthKey.slice(0, 7);
  return rows.filter((r) => budgetMonthKeyOf(r) === key);
}
