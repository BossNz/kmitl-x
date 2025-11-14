export interface IScraper {
  requiresFetch?: boolean;
  scrape(ctx: {
    doc: Document;
    fetchHTML?: (url: string) => Promise<Document>;
  }): Promise<any>;
}

export interface PageDefinition {
  name: string;
  match: RegExp;
  scraper: () => Promise<IScraper>;
  component?: () => Promise<any>;
}
