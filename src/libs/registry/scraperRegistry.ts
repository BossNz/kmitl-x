import type { ScraperRegistryEntry } from "../types/scraper.types";

export const registry: {
  entries: ScraperRegistryEntry[];
  find: (url: string) => ScraperRegistryEntry | undefined;
} = {
  entries: [
    {
      match: /index\.php/,
      factory: async () => new (await import("../scraper/portal.scraper")).PortalScraper(),
    },
  ],
  find(url: string) {
    return this.entries.find(e => e.match.test(url));
  },
};
