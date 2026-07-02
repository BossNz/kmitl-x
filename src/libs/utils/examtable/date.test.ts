import { describe, it, expect } from "vitest";
import {
  parseExamDateToDate,
  calculateDateDifference,
  getDaysText,
  getDaysColor,
} from "./date";

describe("parseExamDateToDate", () => {
  it("parses a Thai month", () => {
    const d = parseExamDateToDate("15", "ธ.ค.", "2025");
    expect(d?.getFullYear()).toBe(2025);
    expect(d?.getMonth()).toBe(11);
    expect(d?.getDate()).toBe(15);
  });

  it("parses an English month", () => {
    const d = parseExamDateToDate("1", "Jan", "2026");
    expect(d?.getMonth()).toBe(0);
  });

  it("returns null for an unknown month", () => {
    expect(parseExamDateToDate("1", "Zzz", "2026")).toBeNull();
  });
});

describe("calculateDateDifference", () => {
  it("counts whole days between two dates", () => {
    const a = new Date(2026, 0, 1);
    const b = new Date(2026, 0, 4);
    expect(calculateDateDifference(a, b)).toBe(3);
  });
});

describe("getDaysText", () => {
  it("labels today, tomorrow, past, and unknown", () => {
    expect(getDaysText(0)).toBe("สอบวันนี้!");
    expect(getDaysText(1)).toBe("สอบพรุ่งนี้");
    expect(getDaysText(-1)).toBe("สอบไปแล้ว");
    expect(getDaysText(999)).toBe("ไม่ระบุวันที่");
    expect(getDaysText(5)).toBe("อีก 5 วัน");
  });
});

describe("getDaysColor", () => {
  it("maps day ranges to colors", () => {
    expect(getDaysColor(0)).toBe("text-red-500");
    expect(getDaysColor(1)).toBe("text-orange-500");
    expect(getDaysColor(10)).toBe("text-green-500");
    expect(getDaysColor(999)).toBe("text-gray-600");
  });
});
