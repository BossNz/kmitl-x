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
  {
    name: "student",
    match: /u_officer\/student\.php/,
    scraper: () => import("../scraper/student.scraper").then(m => new m.StudentScraper()),
  },{
    name: "term-selectors",
    match: /u_student\/report_(examtable|studytable|gradetable)\.php/,
    scraper: () => import("../scraper/term-selectors.scraper").then(m => new m.TermSelectorsScraper()),
  }
];
