import { describe, it, expect } from "vitest";
import { MinorScraper } from "./minor.scraper";

describe("MinorScraper", () => {
  it("extracts events from #tb1 and the student header", async () => {
    const html = `
      <div id="div_student_id">&nbsp;68010488</div>
      <div id="div_tname">&nbsp;First&nbsp;&nbsp;Last</div>
      <table id="tb1"><tbody>
        <tr><td bgcolor="#CCCCCC"><strong>รายละเอียด</strong></td><td bgcolor="#CCCCCC"><strong>กำหนดการ</strong></td></tr>
        <tr><td>รับสมัคร</td><td>20 - 27</td></tr>
        <tr><td>สอบ</td><td>29</td></tr>
      </tbody></table>`;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const r = await new MinorScraper().scrape(doc);

    expect(r.studentId).toBe("68010488");
    expect(r.name).toBe("First Last");
    expect(r.events).toHaveLength(2);
    expect(r.events[0]).toEqual({ description: "รับสมัคร", schedule: "20 - 27" });
  });
});
