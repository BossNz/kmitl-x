import { registry } from "../registry/scraperRegistry";
import { fetchHTML, parseHTML } from "../utils/fetcher";

export async function runPageScraper(url: string) {
  const scraper = await registry.getScraper(url);
  if (!scraper) return { error: "No scraper for this page" };

  // check if the scraper requires fetching the page content
  if (scraper.requiresFetch) return runScraper(url);
  else return scraper.scrape(document);
}

export async function runScraper(url: string) {
  const scraper = await registry.getScraper(url);
  if (!scraper) return { error: "No scraper for this page" };

  const doc = await fetchHTML(url);
  if (!doc) return { error: "Failed to fetch document" };

  return scraper.scrape(doc);
}
