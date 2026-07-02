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
    component: () => import("../../pages/StudyTable.svelte"),
  },
  {
    name: "report-examtable",
    match: /u_student\/report_examtable_show\.php/,
    scraper: () =>
      import("../scraper/report-examtable.scraper").then(
        (m) => new m.ReportExamtableScraper()
      ),
    component: () => import("../../pages/ExamTable.svelte"),
  },
  {
    name: "midterm-score",
    match: /u_student\/midterm_score\.php/,
    scraper: () =>
      import("../scraper/midterm-score.scraper").then(
        (m) => new m.MidtermScoreScraper()
      ),
  },
  {
    name: "report-gradetable",
    match: /u_student\/report_gradetable_show\.php/,
    scraper: () =>
      import("../scraper/report-gradetable.scraper").then(
        (m) => new m.ReportGradetableScraper()
      ),
  },
  {
    name: "report-transcript",
    match: /u_student\/report_transcript_show2\.php/,
    scraper: () =>
      import("../scraper/report-transcript.scraper").then(
        (m) => new m.ReportTranscriptScraper()
      ),
  },
  {
    // static image page, kept as a placeholder rather than reskinned
    name: "grade-process",
    match: /u_student\/grade_process\.php/,
    status: "maintenance",
  },
];
