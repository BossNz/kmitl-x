import { hideOverlay, showOverlay } from "./overlay";
import { getCurrentRoute } from "./router";

(async () => {
  showOverlay();

  const route = getCurrentRoute();
  console.log("Current route:", route);

  await new Promise((resolve) => setTimeout(resolve, 2000));
  hideOverlay();
})();
