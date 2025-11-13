export interface IScraper {
  requiresFetch?: boolean;
  scrape(doc: Document): Promise<any>;
}

export interface ScraperRegistryEntry {
  match: RegExp;
  factory: () => Promise<IScraper>;
}
