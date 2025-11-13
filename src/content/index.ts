import { mount } from "svelte";
import { runScraper } from "../libs/handler/scraperHandler";
import { hideOverlay, showOverlay } from "./overlay";
import { getCurrentRoute } from "./router";

const KMITLX_MODE_KEY = "kmitlx:view";

// Wait for DOM to be ready
function onDOMReady(): Promise<void> {
  return new Promise(resolve => {
    if (document.readyState === "interactive" || document.readyState === "complete") {
      resolve();
    } else {
      document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
    }
  });
}

(async () => {
  showOverlay();

  const route = getCurrentRoute();
  const mode = sessionStorage.getItem(KMITLX_MODE_KEY) ?? "new";
  const isOriginalMode = mode === "original";

  //   show original version without modifications
  if (isOriginalMode || route.name === "unknown") {
    hideOverlay();
    return;
  }

  // Wait for DOM to be ready
  await onDOMReady();

  // scrape the page content
  const data = await runScraper(route.url);

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

  document.body.innerHTML = "";

  // mount the Svelte component
  const componentImport = await route.page.component();
  mount(componentImport.default, {
    target: document.body,
    props: { data },
  });

  hideOverlay();
})();
