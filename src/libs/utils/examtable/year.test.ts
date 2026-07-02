import { describe, it, expect } from "vitest";
import { normalizeGregorianYear } from "./year";

describe("normalizeGregorianYear", () => {
  it("expands a two digit year to 20xx", () => {
    expect(normalizeGregorianYear("25")).toBe("2025");
  });

  it("keeps a four digit year as is", () => {
    expect(normalizeGregorianYear("2025")).toBe("2025");
  });

  it("does not break past the year 2100", () => {
    expect(normalizeGregorianYear("2100")).toBe("2100");
    expect(normalizeGregorianYear("2137")).toBe("2137");
  });

  it("returns an empty string for empty or non numeric input", () => {
    expect(normalizeGregorianYear("")).toBe("");
    expect(normalizeGregorianYear(undefined)).toBe("");
    expect(normalizeGregorianYear("abc")).toBe("");
  });
});
