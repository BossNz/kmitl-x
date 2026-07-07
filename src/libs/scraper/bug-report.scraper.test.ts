import { describe, it, expect } from "vitest";
import { BugReportScraper } from "./bug-report.scraper";

describe("BugReportScraper", () => {
  it("extracts the header, type options, session token, and action", async () => {
    const html = `
      <div id="div_student_id">&nbsp;68010488</div>
      <div id="div_tname">&nbsp;First&nbsp;&nbsp;Last</div>
      <div id="div_semester">&nbsp;1/2565</div>
      <form action="https://x/bug/save.php" method="post">
        <select name="type" id="type">
          <option value="0">แจ้งปัญหา</option>
          <option value="1">แนะนำ</option>
          <option value="2">สอบถาม</option>
        </select>
        <input name="topic" type="text" id="topic">
        <textarea name="detail" id="detail"></textarea>
        <input name="ssid" type="hidden" id="ssid" value="tok123">
      </form>`;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const r = await new BugReportScraper().scrape(doc);

    expect(r.studentId).toBe("68010488");
    expect(r.name).toBe("First Last");
    expect(r.semester).toBe("1/2565");
    expect(r.typeOptions).toHaveLength(3);
    expect(r.typeOptions[0]).toEqual({ value: "0", label: "แจ้งปัญหา" });
    expect(r.ssid).toBe("tok123");
    expect(r.action).toContain("bug/save.php");
  });
});
