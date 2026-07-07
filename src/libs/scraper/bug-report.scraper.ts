import type { BugReportData, BugTypeOption } from "../types/bug-report.types";
import { BaseScraper } from "./baseScraper";
import { getStudentHeader, getDivText } from "../utils/studentHeader";

export class BugReportScraper extends BaseScraper {
  public async scrape(document: Document): Promise<BugReportData> {
    const { studentId, name } = getStudentHeader(document);
    const semester = getDivText(document, "div_semester");

    const typeSelect = document.querySelector<HTMLSelectElement>(
      "#type, select[name='type']"
    );
    const typeOptions: BugTypeOption[] = typeSelect
      ? Array.from(
          typeSelect.querySelectorAll<HTMLOptionElement>("option")
        ).map((o) => ({
          value: o.value,
          label: (o.textContent || "").replace(/\s+/g, " ").trim(),
        }))
      : [];

    const ssid =
      document.querySelector<HTMLInputElement>("#ssid, input[name='ssid']")
        ?.value || "";

    const form = document.querySelector<HTMLFormElement>(
      "form[action*='save.php'], form"
    );
    const action = form?.action || `${location.origin}/bug/save.php`;

    return { studentId, name, semester, typeOptions, ssid, action };
  }
}
