import { describe, it, expect } from "vitest";
import { PaymentReceiptScraper } from "./payment-receipt.scraper";

describe("PaymentReceiptScraper", () => {
  it("extracts term options, records, and documents", async () => {
    const html = `
      <form>
        <select id="year" name="year"><option value="2569" selected>2569</option><option value="2568">2568</option></select>
        <select id="semester" name="semester"><option value="1" selected>1</option></select>
      </form>
      <table width="599"><tbody>
        <tr align="center"><td bgcolor="#E1E1E1"><strong>student-id</strong></td><td bgcolor="#E1E1E1">name</td></tr>
        <tr align="center">
          <td bgcolor="#FBFCDE">68010488</td>
          <td bgcolor="#FBFCDE">First Last</td>
          <td bgcolor="#FBFCDE">2025-11-02</td>
          <td bgcolor="#FBFCDE">2025-11-02</td>
          <td bgcolor="#FBFCDE"><a href="http://x/payment/billstd_v2_pdf.php?student_id=68010488&year=2568&semester=1"><img src="bill.png"></a></td>
        </tr>
      </tbody></table>
      <table width="750"><tbody>
        <tr bgcolor="#FDF3E7">
          <td><a href="http://x/files/fee.pdf">อัตราค่าธรรมเนียม</a></td>
          <td><a href="http://x/files/fee.pdf"><img src="pdf16.gif"></a></td>
        </tr>
        <tr bgcolor="#FDF3E7">
          <td><a href="http://x/files/form.pdf">แบบฟอร์ม</a></td>
          <td><a href="http://x/files/form.pdf"><img src="pdf16.gif"></a></td>
        </tr>
        <tr bgcolor="#ECECEC">
          <td><a href="http://x/files/fee.pdf">อัตราค่าธรรมเนียม (ซ้ำ)</a></td>
          <td><a href="http://x/files/fee.pdf"><img src="pdf16.gif"></a></td>
        </tr>
      </tbody></table>`;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const r = await new PaymentReceiptScraper().scrape(doc);

    expect(r.yearOptions).toEqual(["2569", "2568"]);
    expect(r.selectedYear).toBe("2569");
    expect(r.selectedSemester).toBe("1");
    expect(r.records).toHaveLength(1);
    expect(r.records[0].studentId).toBe("68010488");
    expect(r.records[0].receiptUrl).toContain("billstd_v2_pdf");
    // fee.pdf appears twice but is de-duplicated
    expect(r.documents).toHaveLength(2);
    expect(r.documents.map((d) => d.url)).toEqual([
      "http://x/files/fee.pdf",
      "http://x/files/form.pdf",
    ]);
    expect(r.documents[0].name).toBe("อัตราค่าธรรมเนียม");
  });
});
