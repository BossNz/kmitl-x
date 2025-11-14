import { registry } from "../registry/scraperRegistry";
import { fetchHTML, parseHTML } from "../utils/fetcher";

export async function runScraper(url: string) {
  const scraper = await registry.getScraper(url);
  if (!scraper) return { error: "No scraper for this page" };

  // check if the scraper requires fetching the page content
  const doc = scraper.requiresFetch ? await fetchHTML(url) : document;

  return scraper.scrape({ doc, fetchHTML });
}

export async function runScraperWithDocument(
  url: string,
  doc: string | Document
) {
  const scraper = await registry.getScraper(url);
  if (!scraper) return { error: "No scraper for this page" };

  if (typeof doc === "string") doc = parseHTML(doc);
  return scraper.scrape({ doc });
}
