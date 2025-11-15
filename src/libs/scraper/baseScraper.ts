import type { IScraper } from "../types/scraper.types";

export abstract class BaseScraper implements IScraper {
  requiresFetch = false;

  abstract scrape(doc: Document): Promise<any>;
}
