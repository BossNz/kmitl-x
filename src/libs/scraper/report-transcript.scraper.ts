import type { TranscriptData } from "../types/report-transcript.types";
import { BaseScraper } from "./baseScraper";

export class ReportTranscriptScraper extends BaseScraper {
  public async scrape(document: Document): Promise<TranscriptData> {
    this.extractRawTranscript(document);
    return {
      transcriptObject: this.extractRawTranscript(document),
      pdf: this.extractPdfLink(document),
    } as TranscriptData;
  }

  private extractPdfLink(document: Document): string {
    const pdfLinkElement: HTMLAnchorElement | null = document.querySelector(
      'a[href*="report_transcript_pdf2.php"]'
    );
    return pdfLinkElement?.href || "";
  }

  private extractRawTranscript(
    document: Document
  ): TranscriptData["transcriptObject"] {
    const rows = Array.from(document.querySelectorAll("tr"))
      // only select rows that have exactly 3 child elements
      .filter(
        (row) =>
          row.childElementCount >= 6 ||
          (row.textContent?.includes("Date Issued") &&
            row.childElementCount === 1)
      )
      // get only rows that contain cumulative GPA, total credits, and date issued
      .filter(
        (row) =>
          row.textContent?.includes("Cumulative") ||
          row.textContent?.includes("Total") ||
          row.textContent?.includes("Issued")
      );
    const cells = rows.map((row) =>
      Array.from(row.querySelectorAll("td")).map(
        (cell) => cell.textContent?.trim() || ""
      )
    );

    const data = cells.flatMap((cell) => cell.join(""));

    // get only number from the strings
    // Total number of credit earned: XX
    const totalCredit = data[0].match(/:\s*(\d+)/);
    // Cumulative GPA:  XX.XX
    const cagpa = data[1].match(/(\d+\.\d+)/);
    // Date Issued: MONTH DATE, YEAR   Certified copy. Not valid without seal.
    const dateIssued = data[2].match(/([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})/);

    return {
      totalCredits: totalCredit ? parseInt(totalCredit[1]) : 0,
      cumulativeGPA: cagpa ? parseFloat(cagpa[1]) : 0,
      dateIssued: dateIssued
        ? {
            month: dateIssued[1],
            day: parseInt(dateIssued[2]),
            year: parseInt(dateIssued[3]),
          }
        : { month: "", day: 0, year: 0 },
    };
  }
}
