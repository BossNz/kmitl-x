import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "../package.json";

const { version, description } = packageJson;

const [major, minor, patch] = version.replace(/[^\d.-]+/g, "").split(/[.-]/);

export default defineManifest(async (env) => ({
  manifest_version: 3,
  name: "KMITL X",
  description: description,
  version: `${major}.${minor}.${patch}`,
  version_name: version,
  icons: {
    "128": "public/icons/icon-128.png",
  },
  content_scripts: [
    {
      matches: ["https://*.reg.kmitl.ac.th/*"],
      js: ["src/content/index.ts"],
      run_at: "document_start",
    },
  ],
}));
