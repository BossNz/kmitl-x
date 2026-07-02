import { describe, it, expect } from "vitest";
import { MinorNewsScraper } from "./minor-news.scraper";

describe("MinorNewsScraper", () => {
  it("extracts title, view count, and date", async () => {
    const html = `
      <table><tbody>
        <tr><td>&nbsp;<a href="https://x/index/group_news.php?group=23&date=2025-09-03">(2) <strong>ประกาศรับสมัคร</strong></a>[26]<font color="#CCCCCC">[3 ก.ย. 68 - 10:29 น.]</font></td></tr>
      </tbody></table>`;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const r = await new MinorNewsScraper().scrape(doc);

    expect(r.news).toHaveLength(1);
    expect(r.news[0].title).toBe("ประกาศรับสมัคร");
    expect(r.news[0].count).toBe(26);
    expect(r.news[0].url).toContain("group_news.php");
    expect(r.news[0].date).toContain("3 ก.ย. 68");
  });
});
