import type { TranscriptData } from "../types/report-transcript.types";
import { BaseScraper } from "./baseScraper";

export class ReportTranscriptScraper extends BaseScraper {
  public async scrape(document: Document): Promise<TranscriptData> {
    this.extractRawTranscript(document);
    return {
      transcriptObject: this.extractRawTranscript(document),
      pdf: this.extractPdfLink(document),
      studentInfo: this.extractStudentDetails(document),
    } as TranscriptData;
  }

  private extractStudentDetails(
    document: Document
  ): TranscriptData["studentInfo"] {
    const rows = Array.from(document.querySelectorAll("td"))
      .filter(
        (node) =>
          node.textContent?.includes("Student ID") ||
          node.textContent?.includes("Name") ||
          node.textContent?.includes("Birth") ||
          node.textContent?.includes("Degree") ||
          node.textContent?.includes("Major") ||
          node.textContent?.includes("Admission") ||
          node.textContent?.includes("Graduation")
      )
      .slice(1);

    const data = rows.map((row) =>
      row.textContent?.replace(/\s+/g, " ").trim().split(" ")
    );

    // this looks ugly but works for now
    // TODO: improve later if needed
    return {
      name: data[0] ? data[0][1] + data[0].slice(2).join(" ") : "",
      dateOfBirth: {
        day: data[1] ? parseInt(data[1].slice(3)[1]) : 0,
        month: data[1] ? data[1].slice(3)[0] : "",
        year: data[1] ? parseInt(data[1].slice(3)[2]) : 0,
      },
      studentId: data[2] ? data[2].slice(2).toString() : "",
      // this is only year but its ok for now
      dateOfAdmission: data[3] ? data[3].slice(-1).toString() : "",
      dateOfGraduation: data[4].slice(3).join(" "),
      degree: data[5] ? data[5].slice(1).join(" ") : "",
      major: data[6] ? data[6].slice(1).join(" ") : "",
    };
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
