import type { PageDefinition } from "../types/scraper.types";

/**
 * List of page definitions with their corresponding scrapers and components.
 */
export const pages: PageDefinition[] = [
  {
    name: "portal",
    match: /u_student\/index\.php/,
    scraper: () => import("../scraper/portal.scraper").then(m => new m.PortalScraper()),
    component: () => import("../../pages/Portal.svelte"),
  },
];
