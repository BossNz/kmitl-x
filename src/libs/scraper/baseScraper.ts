import type { IScraper } from "../types/scraper.types";

export abstract class BaseScraper implements IScraper {
  requiresFetch = false;

  abstract scrape(doc: Document): Promise<any>;

  /**
   * Detect and fix doubled text from nested HTML elements.
   * e.g. "Lab Phys.Lab Phys." → "Lab Phys."
   */
  protected dedupeText(text: string): string {
    if (text.length < 2 || text.length % 2 !== 0) return text;
    const half = text.length / 2;
    const first = text.slice(0, half);
    const second = text.slice(half);
    return first === second ? first : text;
  }
}
