import { describe, it, expect } from "vitest";
import { parseHtml } from "./client";

describe("parseHtml", () => {
  it("parses an HTML string into a Document", () => {
    const doc = parseHtml("<div id='x'>hello</div>");
    expect(doc.getElementById("x")?.textContent).toBe("hello");
  });

  it("returns an empty body for empty input", () => {
    const doc = parseHtml("");
    expect(doc.body.textContent).toBe("");
  });
});
