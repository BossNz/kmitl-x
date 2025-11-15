export interface IScraper {
  requiresFetch?: boolean;
  scrape(doc: Document): Promise<any>;
}

export interface PageDefinition {
  name: string;
  match: RegExp;
  scraper: () => Promise<IScraper>;
  component?: () => Promise<any>;
}
