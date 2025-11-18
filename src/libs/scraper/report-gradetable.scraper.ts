import type {
  GradeTableObject,
  ReportGradeTable,
} from "../types/report-gradetable.types";
import { BaseScraper } from "./baseScraper";

export class ReportGradetableScraper extends BaseScraper {
  public async scrape(document: Document): Promise<ReportGradeTable> {
    // this returns both grade table and grade summary table
    const rawGradeTable = this.extractRawGradeTable(document);
    return {
      pdf: this.extractPdfLink(document),
      gradeSummary: this.parseGradeSummary(rawGradeTable),
      gradeTable: this.parseGradeTable(rawGradeTable),
      gradeSymbol: this.extractSymbols(document),
      studentInfo: this.extractStudentDetails(document),
    } as ReportGradeTable;
  }

  private extractPdfLink(document: Document): string {
    const pdfLinkElement: HTMLAnchorElement | null = document.querySelector(
      'a[href*="report_gradetable_pdf.php"]'
    );
    return pdfLinkElement?.href || "";
  }

  private extractSymbols(document: Document): ReportGradeTable["gradeSymbol"] {
    const rows = Array.from(document.querySelectorAll("tr"))
      // only select rows that have exactly 3 child elements
      .filter((row) => row.childElementCount === 2)
      // remove header row
      .slice(1);

    const cells = rows.map((row) =>
      Array.from(row.querySelectorAll("td")).map(
        (cell) => cell.textContent?.trim() || ""
      )
    );
    const symbols = cells.map((cell) => {
      return {
        symbol: cell[0],
        description: cell[1],
      };
    });

    // for now, only one td with colspan=2 is expected for note
    const note =
      document.querySelector("td[colspan='2']")?.textContent?.trim() || "";

    return { symbols, note } as ReportGradeTable["gradeSymbol"];
  }

  private extractStudentDetails(
    document: Document
  ): ReportGradeTable["studentInfo"] {
    // Extract student details from specific <td> elements
    // Result: [td, td, td, ...]
    const rows = Array.from(document.querySelectorAll("td"))
      .filter((node) => node.getAttribute("colspan") === "15")
      .filter((node) => node.getAttribute("height") === "18");

    // extract child nodes from each <td>
    // Result: [[strong, text, ...], [node, node, ...], ...]
    const extractedRows = rows.map((td) => Array.from(td.childNodes));

    // Map to text content and remove title elements
    // Result: [[string, string, ...], [string, string, ...], ...]
    const extractedText = extractedRows.map((cell, index) => {
      // faculty is in the first td
      if (index === 0) return cell[0].textContent?.trim() || "";
      return (
        Array.from(cell)
          // remove title elements (strong elements)
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n) => n.textContent?.trim() || "")
      );
    });

    // Flatten and assign to respective fields
    // Result: [string, string, string, ...]
    const data = extractedText.flat();

    // raw name contains both thai and english names
    const rawName = data[2]
      .replace(/\s+/g, " ")
      .replace(/\s+/g, " ")
      .split(" ");

    // extract semester and year from ": semester/year"
    const semesterMatch = data[4].match(/(\d)\/(\d+)/);
    return {
      studentId: data[1],
      thaiName: rawName.slice(2, 4).join(" "),
      englishName: rawName.slice(0, 2).join(" "),
      curriculum: data[3],
      semester: semesterMatch ? semesterMatch[1] : "",
      year: semesterMatch ? semesterMatch[2] : "",
      faculty: data[0],
    } as ReportGradeTable["studentInfo"];
  }

  private extractRawGradeTable(document: Document): Array<string[]> {
    const rows = Array.from(document.querySelectorAll("tr"))
      .filter((row) => row.childElementCount >= 7)
      // this table has alternating row colors, so we can filter by even row index
      .filter((row) => row.rowIndex % 2 === 0)
      .slice(1);

    const cells = rows.map((row) =>
      Array.from(row.querySelectorAll("td"))
        .filter((cell) => cell.cellIndex % 2 === 0)
        .map((cell) => cell.textContent?.trim() || "")
    );

    return cells;
  }

  private parseGradeTable(
    raw: Array<string[]>
  ): ReportGradeTable["gradeTable"] {
    // last 4 rows are summary, so exclude them
    return raw.slice(0, -4).map((row) => {
      {
        return {
          order: parseInt(row[0], 10),
          subjectCode: row[1],
          subjectName: row[2],
          section: parseInt(row[3], 10),
          credit: parseFloat(row[4]),
          type: row[5],
          grade: row[6],
        };
      }
    });
  }

  private parseGradeSummary(
    raw: Array<string[]>
  ): ReportGradeTable["gradeSummary"] {
    // last 3 rows are summary, first column is label
    const summaryData = raw.slice(-3).map((row) => row.slice(1));
    const [semesterSummary, preSemester, cumulation] = summaryData;
    return {
      semesterSummary: {
        ca: semesterSummary[0],
        cp: semesterSummary[1],
        cd: semesterSummary[2],
        gp: semesterSummary[3],
        gpsGpa: semesterSummary[4],
        status: semesterSummary[5],
      },
      preSemester: {
        // this row can be empty sometimes
        ca: preSemester[0] || "",
        cp: preSemester[1] || "",
        cd: preSemester[2] || "",
        gp: preSemester[3],
        gpsGpa: preSemester[4],
        status: preSemester[5] || "",
      },
      cumulation: {
        ca: cumulation[0],
        cp: cumulation[1],
        cd: cumulation[2],
        gp: cumulation[3],
        gpsGpa: cumulation[4],
        status: cumulation[5],
      },
    };
  }
}
