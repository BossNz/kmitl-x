import { describe, it, expect } from "vitest";
import { MinorProgramScraper } from "./minor-program.scraper";

describe("MinorProgramScraper", () => {
  it("groups programs under their category", async () => {
    const html = `
      <table><tbody>
        <tr><td align="center"><b>คณะวิศวกรรมศาสตร์</b></td></tr>
        <tr><td><a href="https://x/curriculum/file/minor/1.AI.pdf">AI</a></td></tr>
        <tr><td><a href="https://x/curriculum/file/minor/2.EM.pdf">EM</a></td></tr>
        <tr><td align="center"><b>คณะวิทยาศาสตร์</b></td></tr>
        <tr><td><a href="https://x/curriculum/file/minor/3.Ins.pdf">Insurance</a></td></tr>
      </tbody></table>`;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const r = await new MinorProgramScraper().scrape(doc);

    expect(r.categories).toHaveLength(2);
    expect(r.categories[0].category).toBe("คณะวิศวกรรมศาสตร์");
    expect(r.categories[0].items).toHaveLength(2);
    expect(r.categories[0].items[0]).toEqual({
      name: "AI",
      url: "https://x/curriculum/file/minor/1.AI.pdf",
    });
    expect(r.categories[1].items).toHaveLength(1);
  });
});
