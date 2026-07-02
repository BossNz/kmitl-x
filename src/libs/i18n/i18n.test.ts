import { describe, it, expect } from "vitest";
import { t } from "./index";
import { detectLang } from "./lang";
import { matchField } from "./fieldMap";

describe("t", () => {
  it("translates a key for each language", () => {
    expect(t("home", "th")).toBe("หน้าหลัก");
    expect(t("home", "en")).toBe("Home");
  });

  it("interpolates variables", () => {
    expect(t("greeting", "en", { name: "Nut" })).toBe("Hello, Nut");
  });
});

describe("detectLang", () => {
  it("returns the opposite of the toggle target", () => {
    expect(detectLang("en")).toBe("th");
    expect(detectLang("th")).toBe("en");
  });

  it("defaults to Thai", () => {
    expect(detectLang("")).toBe("th");
  });
});

describe("matchField", () => {
  it("matches Thai and English labels to the same key", () => {
    expect(matchField("คณะวิศวกรรมศาสตร์")).toBe("faculty");
    expect(matchField("Faculty of Engineering")).toBe("faculty");
    expect(matchField("รหัสนักศึกษา")).toBe("studentId");
  });

  it("returns null for an unrelated label", () => {
    expect(matchField("xyz")).toBeNull();
  });
});
