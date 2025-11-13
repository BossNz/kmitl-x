import { registry } from "../registry/scraperRegistry";
import { parseHTML } from "../utils/fetcher";

export async function runScraper(url: string) {
  const entry = registry.find(url);
  if (!entry) return { error: "No scraper for this page" };

  const scraper = await entry.factory();

  // check if scraper requires fetching HTML
  if (scraper.requiresFetch) {
    const html = await fetch(url).then(r => r.text());
    const doc = parseHTML(html);
    return scraper.scrape(doc);
  }

  // native document scraping
  return scraper.scrape(document);
}
