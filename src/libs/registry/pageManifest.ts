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
    component: () => import("../../pages/StudentProfile.svelte"),
  },
  {
    name: "term-selectors",
    match: /u_student\/(report_(examtable|studytable|gradetable)|ownersubjweb)\.php/,
    scraper: () =>
      import("../scraper/term-selectors.scraper").then(
        (m) => new m.TermSelectorsScraper()
      ),
    component: () => import("../../pages/TermSelectors.svelte"),
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
    component: () => import("../../pages/MidtermScore.svelte"),
  },
  {
    name: "report-gradetable",
    match: /u_student\/report_gradetable_show\.php/,
    scraper: () =>
      import("../scraper/report-gradetable.scraper").then(
        (m) => new m.ReportGradetableScraper()
      ),
    component: () => import("../../pages/GradeReport.svelte"),
  },
  {
    name: "report-transcript",
    match: /u_student\/report_transcript_show2\.php/,
    scraper: () =>
      import("../scraper/report-transcript.scraper").then(
        (m) => new m.ReportTranscriptScraper()
      ),
    component: () => import("../../pages/Transcript.svelte"),
  },
  {
    name: "ownersubjweb-show",
    match: /u_student\/ownersubjweb_show\.php/,
    scraper: () =>
      import("../scraper/ownersubjweb.scraper").then(
        (m) => new m.OwnersubjwebScraper()
      ),
    component: () => import("../../pages/OwnersubjwebShow.svelte"),
  },
  {
    name: "check-regis",
    match: /u_student\/check_regis_no_right\.php/,
    scraper: () =>
      import("../scraper/check-regis.scraper").then(
        (m) => new m.CheckRegisScraper()
      ),
    component: () => import("../../pages/CheckRegis.svelte"),
  },
  {
    name: "minor",
    match: /u_student\/minor\.php/,
    scraper: () =>
      import("../scraper/minor.scraper").then((m) => new m.MinorScraper()),
    component: () => import("../../pages/Minor.svelte"),
  },
  {
    name: "minor-news",
    match: /u_student\/minor_news\.php/,
    scraper: () =>
      import("../scraper/minor-news.scraper").then(
        (m) => new m.MinorNewsScraper()
      ),
    component: () => import("../../pages/MinorNews.svelte"),
  },
  {
    name: "minor-program",
    match: /u_student\/minor_program\.php/,
    scraper: () =>
      import("../scraper/minor-program.scraper").then(
        (m) => new m.MinorProgramScraper()
      ),
    component: () => import("../../pages/MinorProgram.svelte"),
  },
  {
    name: "payment-receipt",
    match: /payment\/print_receipt\.php/,
    scraper: () =>
      import("../scraper/payment-receipt.scraper").then(
        (m) => new m.PaymentReceiptScraper()
      ),
    component: () => import("../../pages/PaymentReceipt.svelte"),
  },
  {
    name: "email-config",
    match: /u_student\/email_config\.php/,
    scraper: () =>
      import("../scraper/email-config.scraper").then(
        (m) => new m.EmailConfigScraper()
      ),
    component: () => import("../../pages/EmailConfig.svelte"),
  },
  {
    name: "bug-report",
    match: /bug\/report\.php/,
    scraper: () =>
      import("../scraper/bug-report.scraper").then(
        (m) => new m.BugReportScraper()
      ),
    component: () => import("../../pages/BugReport.svelte"),
  },
  {
    // static image page, kept as a placeholder rather than reskinned
    name: "grade-process",
    match: /u_student\/grade_process\.php/,
    status: "maintenance",
  },
];
