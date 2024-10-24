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
    "128": "src/assets/icons/icon-128.png",
  },
  content_scripts: [
    {
      matches: [
        "https://*.reg.kmitl.ac.th/u_student/report_studytable_show.php",
      ],
      js: ["src/content/index.ts"],
    },
  ],
}));
