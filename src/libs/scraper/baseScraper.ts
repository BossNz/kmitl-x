import type { IScraper } from "../types/scraper.types";

export abstract class BaseScraper implements IScraper {
  requiresFetch = false;

  abstract scrape(ctx: {
    doc: Document;
    fetchHTML?: (url: string) => Promise<Document>;
  }): Promise<any>;

  protected cleanText(el: Element | null) {
    return el?.textContent?.trim() || "";
  }
}
