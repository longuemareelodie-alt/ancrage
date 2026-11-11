import { describe, expect, it } from "vitest";
import { searchTools } from "./toolsIndex";

describe("searchTools", () => {
  it("finds the Budget tool from the Menu search", () => {
    expect(searchTools("budget")[0]?.to).toBe("/budget");
  });
  it("ignores accents and case", () => {
    expect(searchTools("SANTE").map((t) => t.to)).toContain("/sante");
  });
  it("returns nothing for a one-letter query", () => {
    expect(searchTools("b")).toEqual([]);
  });
});
