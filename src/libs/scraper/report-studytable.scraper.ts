import type {
  StudySchedule,
  StudyTable,
} from "../types/report-studytable.types";
import { BaseScraper } from "./baseScraper";

export class ReportStudytableScraper extends BaseScraper {
  public async scrape(document: Document): Promise<StudyTable> {
    const raw = this.extractRawSchedule(document);
    const studySchedules = this.createStudySchedule(raw);
    return { studySchedules } as StudyTable;
  }

  private extractRawSchedule(document: Document): string[][] {
    const rows = Array.from(document.querySelectorAll("tr"))
      .filter((row) => row.childElementCount > 1)
      .slice(1);

    const cells = rows.map((row) =>
      Array.from(row.querySelectorAll("td"))
        .filter((cell) => cell.cellIndex % 2 === 0)
        .map((cell) => cell.textContent)
    );

    return cells;
  }

  private parseScheduleData(row: string[]): StudySchedule {
    return {
      order: parseInt(row[0] || "0", 10),
      subjectCode: row[1] || "",
      subjectName: row[2] || "",
      credit: parseInt(row[3] || "0", 10),
      lectureSection: parseInt(row[4] || "0", 10),
      practiceSection: parseInt(row[5] || "0", 10) || undefined,
      room: row[7] || "",
      building: row[8] || "",
      time: this.parseTimeData(row[6] || ""),
      note: row[9] || "",
    };
  }
  private parseTimeData(timeString: string): StudySchedule["time"] {
    const timeEntries = timeString.split("+").map((entry) => entry.trim());
    const timeData: StudySchedule["time"] = [];
    timeEntries.forEach((entry) => {
      const match = entry.match(
        // match both English and Thai day names
        /((Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s*(\d{2}:\d{2})-(\d{2}:\d{2})\s*\(?([LP])\)?)|((?:[ก-ฮ]{1,2}|อา)\.\s*(\d{2}:\d{2})-(\d{2}:\d{2})\s*น?\.?\([ทป]\))/
      );
      if (match) {
        timeData.push({
          day: match[2],
          startTime: match[3],
          endTime: match[4],
          type:
            match[5] === "ท"
              ? "lecture"
              : match[5] === "ป"
              ? "practice"
              : match[4] === "L"
              ? "lecture"
              : "practice",
        });
      }
    });
    return timeData;
  }

  private createStudySchedule(rawData: string[][]): StudySchedule[] {
    return rawData.map((row) => this.parseScheduleData(row));
  }
}
