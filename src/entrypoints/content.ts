import { defineContentScript } from "#imports";
import { runPageScraper } from "../libs/handler/scraperHandler";
import { mountUI, onDOMReady } from "../libs/handler/uiHandler";
import { hideOverlay, showOverlay } from "../content/overlay";
import { getCurrentRoute } from "../content/router";

const KMITLX_MODE_KEY = "kmitlx:view";

export default defineContentScript({
  matches: ["https://*.reg.kmitl.ac.th/*"],
  runAt: "document_start",
  async main() {
    showOverlay();

    const route = getCurrentRoute();
    const mode = sessionStorage.getItem(KMITLX_MODE_KEY) ?? "new";
    sessionStorage.setItem(KMITLX_MODE_KEY, mode);
    const isOriginalMode = mode === "original";

    // show original version without modifications
    if (isOriginalMode || route.name === "unknown") {
      hideOverlay();
      return;
    }

    // wait for DOM to be ready
    await onDOMReady();

    if (!document.body) {
      hideOverlay();
      return;
    }

    // old or retired pages show a placeholder instead of being reskinned
    const status = route.page?.status ?? "ready";
    if (status !== "ready") {
      await mountUI(
        await import("../libs/components/common/UnderMaintenance.svelte"),
        document.body,
        { status }
      );
      hideOverlay();
      return;
    }

    // scrape the page content
    const data = await runPageScraper(route.url);

    if (data?.error) {
      hideOverlay();
      return;
    }

    if (!route.page?.component) {
      hideOverlay();
      return;
    }

    // mount the Svelte component
    await mountUI(await route.page.component(), document.body, data);

    hideOverlay();
  },
});
