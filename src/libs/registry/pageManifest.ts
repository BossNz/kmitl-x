import type { PageDefinition } from "../types/scraper.types";

/**
 * List of page definitions with their corresponding scrapers and components.
 */
export const pages: PageDefinition[] = [
  {
    name: "portal",
    match: /u_student\/index\.php/,
    scraper: () =>
      import("../scraper/portal.scraper").then((m) => new m.PortalScraper()),
    component: () => import("../../pages/Portal.svelte"),
  },
  {
    name: "student",
    match: /u_officer\/student\.php/,
    scraper: () =>
      import("../scraper/student.scraper").then((m) => new m.StudentScraper()),
  },
  {
    name: "term-selectors",
    match: /u_student\/(report_(examtable|studytable|gradetable))\.php/,
    scraper: () =>
      import("../scraper/term-selectors.scraper").then(
        (m) => new m.TermSelectorsScraper()
      ),
  },
  {
    name: "report-studytable",
    match: /u_student\/report_studytable_show\.php/,
    scraper: () =>
      import("../scraper/report-studytable.scraper").then(
        (m) => new m.ReportStudytableScraper()
      ),
  },
  {
    name: "report-examtable",
    match: /u_student\/report_examtable_show\.php/,
    scraper: () =>
      import("../scraper/report-examtable.scraper").then(
        (m) => new m.ReportExamtableScraper()
      ),
  },
  {
    name: "midterm-score",
    match: /u_student\/midterm_score\.php/,
    scraper: () =>
      import("../scraper/midterm-score.scraper").then(
        (m) => new m.MidtermScoreScraper()
      ),
  },
];
