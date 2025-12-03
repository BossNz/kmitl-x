import { crx } from "@crxjs/vite-plugin";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import manifest from "./src/manifest.config";
import pkg from "./package.json";

export default defineConfig({
  plugins: [svelte(), crx({ manifest })],
  build: {
    modulePreload: false,
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173,
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
});
