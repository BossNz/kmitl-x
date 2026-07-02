import type {
  OwnersubjwebData,
  OwnersubjwebSubject,
} from "../types/ownersubjweb.types";
import { BaseScraper } from "./baseScraper";

export class OwnersubjwebScraper extends BaseScraper {
  public async scrape(document: Document): Promise<OwnersubjwebData> {
    // Each subject is a link to the subject detail page. The credit is in the
    // sibling cell of the same row.
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href*="subject_id="]')
    );

    const subjects: OwnersubjwebSubject[] = links.map((link) => {
      const raw = (link.textContent || "").replace(/\s+/g, " ").trim();
      const match = raw.match(/^(\S+)\s+(.*)$/);
      const code = match ? match[1] : raw;
      const name = match ? match[2] : "";

      const row = link.closest("tr");
      const cells = row ? Array.from(row.querySelectorAll("td")) : [];
      const credit =
        cells.length > 1
          ? (cells[cells.length - 1].textContent || "")
              .replace(/\s+/g, " ")
              .trim()
          : "";

      return { code, name, credit, url: link.href };
    });

    const strongs = Array.from(document.querySelectorAll("strong")).map((s) =>
      (s.textContent || "").replace(/\s+/g, " ").trim()
    );

    let semester = "";
    let year = "";
    for (const s of strongs) {
      const m = s.match(/(\d)\/(\d{4})/);
      if (m) {
        semester = m[1];
        year = m[2];
        break;
      }
    }

    // Section labels (faculty/curriculum), excluding the semester header.
    const headings = strongs.filter((t) => t && !/\d\/\d{4}/.test(t));

    return { semester, year, headings, subjects };
  }
}
