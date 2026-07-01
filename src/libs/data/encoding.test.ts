import { describe, it, expect } from "vitest";
import { extractCharset, decodeThaiHtml } from "./encoding";

describe("extractCharset", () => {
  it("reads the charset from a content type header", () => {
    expect(extractCharset("text/html; charset=windows-874")).toBe(
      "windows-874"
    );
  });

  it("returns null when there is no charset", () => {
    expect(extractCharset("text/html")).toBeNull();
    expect(extractCharset(null)).toBeNull();
  });
});

describe("decodeThaiHtml", () => {
  it("decodes a utf-8 buffer", () => {
    const buffer = new TextEncoder().encode("<p>สวัสดี</p>").buffer;
    expect(decodeThaiHtml(buffer, "utf-8")).toContain("สวัสดี");
  });

  it("falls back when the preferred charset is unknown", () => {
    const buffer = new TextEncoder().encode("<p>hello</p>").buffer;
    expect(decodeThaiHtml(buffer, "not-a-real-charset")).toContain("hello");
  });
});
