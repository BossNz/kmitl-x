import { registry } from "../registry/scraperRegistry";
import { parseHTML } from "../utils/fetcher";

export async function runScraper(url: string) {
  const scraper = await registry.getScraper(url);
  if (!scraper) return { error: "No scraper for this page" };

  // check if the scraper requires fetching the page content
  if (scraper.requiresFetch) {
    const html = await fetch(url).then(r => r.text());
    const doc = parseHTML(html);
    return scraper.scrape(doc);
  }

  return scraper.scrape(document);
}
