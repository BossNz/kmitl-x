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
        "https://*.reg.kmitl.ac.th/u_student/index.php*",
      ],
      js: ["src/content/portal.ts"],
      run_at: "document_start",
    },
    {
      matches: [
        "https://*.reg.kmitl.ac.th/u_student/report_studytable_show.php*",
      ],
      js: ["src/content/study-schedule.ts"],
    },
    {
      matches: [
        "https://*.reg.kmitl.ac.th/u_student/report_examtable_show.php*",
      ],
      js: ["src/content/exam-schedule.ts"],
    },
  ],
}));
