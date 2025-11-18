import type {
  MidtermScore,
  MidtermScoreObject,
} from "../types/midterm-score.types";
import { BaseScraper } from "./baseScraper";

export class MidtermScoreScraper extends BaseScraper {
  public async scrape(document: Document): Promise<MidtermScore> {
    const raw = this.extractRawMidtermScoreTable(document);
    const midtermScores = this.createMidtermScore(raw);

    return {
      midtermScores: midtermScores,
      studentInfo: this.extractStudentDetails(document),
    } as MidtermScore;
  }

  private extractStudentDetails(
    document: Document
  ): MidtermScore["studentInfo"] {
    // Extract student details from specific <td> elements
    // Result: [td, td, td, ...]
    const rows = Array.from(document.querySelectorAll("td"))
      .filter((node) => node.getAttribute("colspan") === "21")
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
    } as MidtermScore["studentInfo"];
  }

  private extractRawMidtermScoreTable(document: Document): HTMLElement[][] {
    const rows = Array.from(document.querySelectorAll("tr"))
      // only select rows that have at least 8 child elements
      // order, subjectCode, subjectName, section, score1, score2, score3, score4
      .filter((row) => row.childElementCount >= 8)
      // remove header row
      .slice(1);

    const cells = rows.map((row) =>
      Array.from(row.querySelectorAll("td")).filter(
        // this table has alternating row colors, so we can filter by even row index
        (cell) => cell.cellIndex % 2 === 0
      )
    );
    return cells;
  }

  private parseMidtermScoreData(rows: HTMLElement[]): MidtermScoreObject {
    return {
      order: parseInt(rows[0].textContent?.trim() || "0", 10),
      subjectCode: rows[1].textContent?.trim() || "",
      subjectName: rows[2].textContent?.trim() || "",
      section: parseInt(rows[3].textContent?.trim() || "0", 10),
      scores: rows.slice(4, 8).map(
        (cell) =>
          // Check if the cell contains text content; if not, check for an image with alt text
          cell.textContent?.trim() ||
          (cell.querySelector("img")?.alt.includes("ดำเนินการ") ? "P" : "X")
      ),
    };
  }

  private createMidtermScore(rawData: HTMLElement[][]): MidtermScoreObject[] {
    return rawData.map((row) => this.parseMidtermScoreData(row));
  }
}
