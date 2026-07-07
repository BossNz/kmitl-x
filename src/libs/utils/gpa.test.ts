import { describe, it, expect } from "vitest";
import { computeGpa, gradePoint } from "./gpa";

describe("gradePoint", () => {
  it("maps letter grades to points", () => {
    expect(gradePoint("A")).toBe(4);
    expect(gradePoint("B+")).toBe(3.5);
    expect(gradePoint("F")).toBe(0);
  });

  it("returns null for non-GPA grades", () => {
    expect(gradePoint("W")).toBeNull();
    expect(gradePoint("S")).toBeNull();
    expect(gradePoint("")).toBeNull();
  });
});

describe("computeGpa", () => {
  it("computes a credit-weighted GPA", () => {
    const r = computeGpa([
      { credit: 3, grade: "A" }, // 12
      { credit: 3, grade: "B" }, // 9
      { credit: 2, grade: "C" }, // 4
    ]);
    expect(r.credits).toBe(8);
    expect(r.gradePoints).toBe(25);
    expect(r.gpa).toBeCloseTo(3.125, 3);
  });

  it("ignores non-GPA grades and zero-credit rows", () => {
    const r = computeGpa([
      { credit: 3, grade: "A" },
      { credit: 3, grade: "W" },
      { credit: 0, grade: "A" },
    ]);
    expect(r.credits).toBe(3);
    expect(r.gpa).toBe(4);
  });

  it("returns 0 when there are no graded credits", () => {
    expect(computeGpa([]).gpa).toBe(0);
  });
});
