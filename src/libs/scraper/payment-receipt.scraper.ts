import type {
  FeeDocument,
  PaymentReceiptData,
  ReceiptRecord,
} from "../types/payment-receipt.types";
import { BaseScraper } from "./baseScraper";

export class PaymentReceiptScraper extends BaseScraper {
  public async scrape(document: Document): Promise<PaymentReceiptData> {
    const yearSelect = document.querySelector<HTMLSelectElement>(
      "#year, select[name='year']"
    );
    const semesterSelect = document.querySelector<HTMLSelectElement>(
      "#semester, select[name='semester']"
    );
    const optionValues = (select: HTMLSelectElement | null) =>
      select
        ? Array.from(select.querySelectorAll<HTMLOptionElement>("option")).map(
            (o) => o.value
          )
        : [];

    // Request records live in rows shaded #FBFCDE, five cells each.
    const records: ReceiptRecord[] = Array.from(
      document.querySelectorAll("tr")
    )
      .filter(
        (row) =>
          (row.getAttribute("bgcolor") || "").toUpperCase() === "#FBFCDE" ||
          !!row.querySelector('td[bgcolor="#FBFCDE"]')
      )
      .map((row) => {
        const c = Array.from(row.querySelectorAll("td")).map((td) =>
          (td.textContent || "").replace(/\s+/g, " ").trim()
        );
        return {
          studentId: c[0] || "",
          name: c[1] || "",
          requestedDate: c[2] || "",
          approvedDate: c[3] || "",
          status: c[4] || "",
        };
      })
      .filter((r) => r.studentId || r.name);

    // Fee documents: rows with a PDF link. Name is the first link, the download
    // is the last link (the icon column). The registrar lists some files in
    // more than one row, so de-duplicate by URL.
    const documents: FeeDocument[] = [];
    const seen = new Set<string>();
    for (const row of Array.from(document.querySelectorAll("tr"))) {
      const links = Array.from(
        row.querySelectorAll<HTMLAnchorElement>('a[href$=".pdf"]')
      );
      if (links.length === 0) continue;
      const url = links[links.length - 1]?.href || links[0]?.href || "";
      if (!url || seen.has(url)) continue;
      seen.add(url);
      const name = (links[0]?.textContent || "").replace(/\s+/g, " ").trim();
      documents.push({ name: name || "เอกสาร", url });
    }

    return {
      yearOptions: optionValues(yearSelect),
      semesterOptions: optionValues(semesterSelect),
      selectedYear: yearSelect?.value || "",
      selectedSemester: semesterSelect?.value || "",
      records,
      documents,
    };
  }
}
