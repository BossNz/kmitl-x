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
  const data = { error: "No scraper available for this page." };

  if (data?.error) {
    console.warn("[KMITL-X] Scraping error:", data.error);
    hideOverlay();
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));
  hideOverlay();
})();
