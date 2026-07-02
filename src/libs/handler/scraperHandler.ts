import { registry } from "../registry/scraperRegistry";
import { apiClient } from "../data/client";

export async function runPageScraper(url: string) {
  const scraper = await registry.getScraper(url);
  if (!scraper) return { error: "No scraper for this page" };

  // check if the scraper requires fetching the page content
  if (scraper.requiresFetch) return runScraper(url);

  try {
    return await scraper.scrape(document);
  } catch {
    return { error: "Failed to scrape page" };
  }
}

export async function runScraper(url: string) {
  const scraper = await registry.getScraper(url);
  if (!scraper) return { error: "No scraper for this page" };

  try {
    const doc = await apiClient.fetchHtml(url);
    return scraper.scrape(doc);
  } catch {
    return { error: "Failed to fetch document" };
  }
}
