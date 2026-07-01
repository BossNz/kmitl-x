export interface IScraper {
  requiresFetch?: boolean;
  scrape(doc: Document): Promise<any>;
}

export type PageStatus = "ready" | "maintenance" | "unused";

export interface PageDefinition {
  name: string;
  match: RegExp;
  // "ready" pages are scraped and reskinned. "maintenance" and "unused" pages
  // show a placeholder instead of running a scraper or a page component.
  status?: PageStatus;
  scraper?: () => Promise<IScraper>;
  component?: () => Promise<any>;
}
