import { describe, it, expect } from "vitest";
import { CheckRegisScraper } from "./check-regis.scraper";

describe("CheckRegisScraper", () => {
  it("extracts student info, the status message, and links", async () => {
    const html = `
      <div id="div_student_id">&nbsp; 68010488 </div>
      <div id="div_tname">&nbsp;First&nbsp;&nbsp;Last</div>
      <div id="div_semester">&nbsp;1/2569</div>
      <a href="https://x/educalendar/">calendar</a>
      <a href="https://x/u_student/regis.php?student_id=68010488"><h1><font color="#0000FF">eligible message</font></h1></a>`;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const r = await new CheckRegisScraper().scrape(doc);

    expect(r.studentId).toBe("68010488");
    expect(r.name).toBe("First Last");
    expect(r.semester).toBe("1/2569");
    expect(r.statusMessage).toBe("eligible message");
    expect(r.statusColor).toBe("#0000FF");
    expect(r.registerUrl).toContain("regis.php");
    expect(r.calendarUrl).toContain("educalendar");
  });
});
