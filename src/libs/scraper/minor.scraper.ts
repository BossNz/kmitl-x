import type { MinorData, MinorEvent } from "../types/minor.types";
import { BaseScraper } from "./baseScraper";
import { getStudentHeader } from "../utils/studentHeader";

export class MinorScraper extends BaseScraper {
  public async scrape(document: Document): Promise<MinorData> {
    // The schedule table #tb1 has a header row followed by description/date rows.
    const rows = Array.from(document.querySelectorAll("#tb1 tr")).slice(1);

    const events: MinorEvent[] = rows
      .map((row) => {
        const cells = Array.from(row.querySelectorAll("td"));
        return {
          description: (cells[0]?.textContent || "").replace(/\s+/g, " ").trim(),
          schedule: (cells[1]?.textContent || "").replace(/\s+/g, " ").trim(),
        };
      })
      .filter((event) => event.description || event.schedule);

    return { ...getStudentHeader(document), events };
  }
}
