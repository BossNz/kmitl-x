import { describe, it, expect } from "vitest";
import { parseHTML } from "./fetcher";

describe("parseHTML", () => {
  it("parses an HTML string into a Document", () => {
    const doc = parseHTML("<div id='x'>hello</div>");
    expect(doc.getElementById("x")?.textContent).toBe("hello");
  });

  it("returns an empty body for empty input", () => {
    const doc = parseHTML("");
    expect(doc.body.textContent).toBe("");
  });
});
