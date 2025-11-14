import { pages } from "../libs/registry/pageManifest";

export function getCurrentRoute() {
  const url = window.location.pathname;
  for (const page of pages) {
    if (page.match.test(url)) {
      return { name: page.name, url, page };
    }
  }
  return { name: "unknown", url };
}
