import { describe, it, expect } from "vitest";
import { EmailConfigScraper } from "./email-config.scraper";

describe("EmailConfigScraper", () => {
  it("extracts options, the current choice, and the session token", async () => {
    const html = `
      <form>
        <table><tbody>
          <tr>
            <td><div>ต้องการแจ้งประกาศผลเกรด :</div></td>
            <td>
              <label><input name="group0" type="radio" value="1" checked> รับ</label>
              <label><input name="group0" type="radio" value="2"> ไม่รับ</label>
            </td>
          </tr>
        </tbody></table>
        <input name="ssid" type="hidden" id="ssid" value="abc123">
      </form>`;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const r = await new EmailConfigScraper().scrape(doc);

    expect(r.options).toHaveLength(2);
    expect(r.options[0]).toEqual({ value: "1", label: "รับ" });
    expect(r.options[1].value).toBe("2");
    expect(r.selected).toBe("1");
    expect(r.ssid).toBe("abc123");
    expect(r.question).toContain("ต้องการแจ้งประกาศผลเกรด");
  });
});
