import type { MinorNewsData, MinorNewsItem } from "../types/minor-news.types";
import { BaseScraper } from "./baseScraper";
import { getStudentHeader } from "../utils/studentHeader";

export class MinorNewsScraper extends BaseScraper {
  public async scrape(document: Document): Promise<MinorNewsData> {
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href*="group_news.php"]')
    );

    const news: MinorNewsItem[] = links.map((link) => {
      // Titles are prefixed with a row number like "(2) "; drop it.
      const title = (link.textContent || "")
        .replace(/\s+/g, " ")
        .replace(/^\(\d+\)\s*/, "")
        .trim();

      const cell = link.closest("td");
      const dateText =
        cell?.querySelector('font[color="#CCCCCC"]')?.textContent || "";
      // The date sits inside square brackets, e.g. "[3 ก.ย. 68 - 10:29 น.]".
      const insideBrackets = dateText.match(/\[(.*)\]/);
      const date = (insideBrackets ? insideBrackets[1] : dateText)
        .replace(/\s+/g, " ")
        .trim();

      // The view count is the numeric bracket after the link, e.g. [10].
      const countMatch = (cell?.textContent || "").match(/\[(\d+)\]/);
      const count = countMatch ? parseInt(countMatch[1], 10) : 0;

      return { title, url: link.href, count, date };
    });

    return { ...getStudentHeader(document), news };
  }
}
