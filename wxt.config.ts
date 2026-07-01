import { defineConfig } from "wxt";
import pkg from "./package.json";

// WXT config. Manifest is generated per browser target.
// Chrome build also serves Opera (both Chromium). Firefox build via -b firefox.
export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-svelte"],
  manifest: ({ browser }) => ({
    name: "KMITL X",
    description: pkg.description,
    icons: {
      128: "icons/icon-128.png",
    },
    // Firefox-only settings. Required for AMO submission.
    // The extension reads only the page the user already opened and stores
    // preferences locally, so it declares no data collection.
    ...(browser === "firefox"
      ? {
          browser_specific_settings: {
            gecko: {
              id: "kmitl-x@bossnz.github.io",
              data_collection_permissions: { required: ["none"] },
            },
          },
        }
      : {}),
  }),
  vite: () => ({
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
  }),
});
