import type {
  MinorProgramCategory,
  MinorProgramData,
} from "../types/minor-program.types";
import { BaseScraper } from "./baseScraper";
import { getStudentHeader } from "../utils/studentHeader";

export class MinorProgramScraper extends BaseScraper {
  public async scrape(document: Document): Promise<MinorProgramData> {
    // Walk cells in order. A bold cell with no link starts a new category; a
    // cell with a minor curriculum PDF link is a program under that category.
    const categories: MinorProgramCategory[] = [];
    let current: MinorProgramCategory | null = null;

    for (const cell of Array.from(document.querySelectorAll("td"))) {
      const link = cell.querySelector<HTMLAnchorElement>(
        'a[href*="curriculum/file/minor"]'
      );
      if (link) {
        const name = (link.textContent || "").replace(/\s+/g, " ").trim();
        if (!current) {
          current = { category: "", items: [] };
          categories.push(current);
        }
        current.items.push({ name, url: link.href });
        continue;
      }

      const bold = cell.querySelector("b");
      if (bold && !cell.querySelector("a")) {
        const category = (bold.textContent || "").replace(/\s+/g, " ").trim();
        if (category) {
          current = { category, items: [] };
          categories.push(current);
        }
      }
    }

    return {
      ...getStudentHeader(document),
      categories: categories.filter((category) => category.items.length > 0),
    };
  }
}
