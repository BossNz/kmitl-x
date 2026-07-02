import { describe, it, expect } from "vitest";
import { OwnersubjwebScraper } from "./ownersubjweb.scraper";

describe("OwnersubjwebScraper", () => {
  it("extracts subjects, credits, and the term", async () => {
    const html = `
      <strong>รายวิชาประจำปีการศึกษา 1/2568</strong>
      <table><tbody>
        <tr>
          <td><a href="https://x/subjectweb/index.php?subject_id=01006020">01006020&nbsp;&nbsp;GENERAL PHYSICS 1</a></td>
          <td>3 (3-0)</td>
        </tr>
        <tr>
          <td><a href="https://x/subjectweb/index.php?subject_id=01006021">01006021&nbsp;&nbsp;PHYSICS LAB</a></td>
          <td>1 (0-3)</td>
        </tr>
      </tbody></table>`;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const result = await new OwnersubjwebScraper().scrape(doc);

    expect(result.semester).toBe("1");
    expect(result.year).toBe("2568");
    expect(result.subjects).toHaveLength(2);
    expect(result.subjects[0].code).toBe("01006020");
    expect(result.subjects[0].name).toBe("GENERAL PHYSICS 1");
    expect(result.subjects[0].credit).toBe("3 (3-0)");
    expect(result.subjects[0].url).toContain("subject_id=01006020");
  });

  it("returns an empty list when there are no subjects", async () => {
    const doc = new DOMParser().parseFromString("<p>empty</p>", "text/html");
    const result = await new OwnersubjwebScraper().scrape(doc);
    expect(result.subjects).toHaveLength(0);
  });
});
