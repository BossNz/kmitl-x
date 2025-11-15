import { runPageScraper } from "../libs/handler/scraperHandler";
import { mountUI, onDOMReady } from "../libs/handler/uiHandler";
import { hideOverlay, showOverlay } from "./overlay";
import { getCurrentRoute } from "./router";

const KMITLX_MODE_KEY = "kmitlx:view";

(async () => {
  showOverlay();

  const route = getCurrentRoute();
  const mode = sessionStorage.getItem(KMITLX_MODE_KEY) ?? "new";
  sessionStorage.setItem(KMITLX_MODE_KEY, mode);
  const isOriginalMode = mode === "original";

  //   show original version without modifications
  if (isOriginalMode || route.name === "unknown") {
    hideOverlay();
    return;
  }

  // Wait for DOM to be ready
  await onDOMReady();

  // scrape the page content
  const data = await runPageScraper(route.url);

  if (data?.error) {
    console.warn("[KMITL-X] Scraping error:", data.error);
    hideOverlay();
    return;
  }
  console.log("[KMITL-X] Scraping result:", data);

  if (!route.page?.component) {
    console.warn("[KMITL-X] No component found for this route.");
    hideOverlay();
    return;
  }

  if (!document.body) {
    console.warn("[KMITL-X] Document body is not available.");
    hideOverlay();
    return;
  }

  // mount the Svelte component
  await mountUI(await route.page.component(), document.body, data);

  hideOverlay();
})();
