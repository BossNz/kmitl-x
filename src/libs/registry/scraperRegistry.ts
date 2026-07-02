import { pages } from "./pageManifest";
import type { IScraper, PageDefinition } from "../types/scraper.types";

export const registry = {
  // Find a page definition by URL
  find(url: string): PageDefinition | undefined {
    return pages.find((page) => page.match.test(url));
  },

  // Get scraper instance for a URL
  async getScraper(url: string): Promise<IScraper | null> {
    const entry = this.find(url);
    if (!entry?.scraper) return null;
    return entry.scraper();
  },

  // Get component for a URL
  async getComponent(url: string): Promise<any | null> {
    const entry = this.find(url);
    if (!entry) return null;
    return entry.component?.() ?? null;
  },
};
