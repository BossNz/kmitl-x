import { runScraper } from "../libs/handler/scraperHandler";
import { hideOverlay, showOverlay } from "./overlay";
import { getCurrentRoute } from "./router";

const KMITLX_MODE_KEY = "kmitlx:view";

(async () => {
  showOverlay();

  const route = getCurrentRoute();
  const mode = sessionStorage.getItem(KMITLX_MODE_KEY) ?? "new";
  const isOriginalMode = mode === "original";

  //   show original version without modifications
  if (isOriginalMode) {
    hideOverlay();
    return;
  }

  // scrape the page content
  const data = await runScraper(route.url);

  if (data?.error) {
    console.warn("[KMITL-X] Scraping error:", data.error);
    hideOverlay();
    return;
  }

  // TODO: Implement mounting logic based on scraped data
  console.log("[KMITL-X] Scraped data:", data);

  // simulate loading time
  await new Promise((resolve) => setTimeout(resolve, 2000));
  hideOverlay();
})();
