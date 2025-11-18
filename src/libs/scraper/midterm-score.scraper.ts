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
    } as MidtermScore;
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
      scores: rows
        .slice(4, 8)
        .map(
          (cell) =>
            cell.textContent?.trim() ||
            (cell.querySelector("img")?.alt.includes("ดำเนินการ") ? "P" : "X")
        ),
    };
  }

  private createMidtermScore(rawData: HTMLElement[][]): MidtermScoreObject[] {
    return rawData.map((row) => this.parseMidtermScoreData(row));
  }
}
