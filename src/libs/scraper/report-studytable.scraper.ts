import type {
  StudySchedule,
  StudyTable,
} from "../types/report-studytable.types";
import { BaseScraper } from "./baseScraper";

export class ReportStudytableScraper extends BaseScraper {
  public async scrape(document: Document): Promise<StudyTable> {
    const rawSchedules = this.extractRawSchedule(document);
    const studySchedules = this.createStudySchedule(rawSchedules);
    const studentInfo = this.extractStudentDetails(document);
    return { studySchedules, studentInfo };
  }

  private extractStudentDetails(document: Document): StudyTable["studentInfo"] {
    // Extract student details from specific <td> elements
    // Result: [td, td, td, ...]
    const rows = Array.from(document.querySelectorAll("td"))
      .filter((node) => node.getAttribute("colspan") === "18")
      .filter((node) => node.getAttribute("height") === "18")
      .slice(1);

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
    return {
      studentId: data[5],
      name: data[6],
      faculty: data[0].replace(/^(คณะ|Faculty:\s*)/i, "").trim(),
      department: data[1],
      curriculum: data[2],
      semester: data[3],
      year: data[4],
    };
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
    const timeEntries = timeString.match(
      /((Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s*(\d{2}:\d{2})-(\d{2}:\d{2})\s*\(?([LP])\)?)|((?:[ก-ฮ]{1,2}|อา)\.\s*\d{2}:\d{2}-\d{2}:\d{2}\s*น?\.?\([ทป]\))/g
    );
    const timeData: StudySchedule["time"] = [];
    timeEntries?.forEach((entry) => {
      const matchThai = entry.match(
        /(([ก-ฮ]{1,2}|อา)\.\s*(\d{2}:\d{2})-(\d{2}:\d{2})\s*น?\.?\(([ทป])\))/
      );
      const mathEng = entry.match(
        /((Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s*(\d{2}:\d{2})-(\d{2}:\d{2})\s*\(([LP])\))/
      );

      const match = matchThai || mathEng || null;
      if (!match) return;

      // check if time is duplicated
      const isDuplicate = timeData.some((time) => {
        return (
          time.day === match[2] &&
          time.startTime === match[3] &&
          time.endTime === match[4]
        );
      });
      if (isDuplicate) return;

      timeData.push({
        day: match[2],
        startTime: match[3],
        endTime: match[4],
        type:
          match[5] === "ท"
            ? "lecture"
            : match[5] === "ป"
            ? "practice"
            : match[5] === "L"
            ? "lecture"
            : "practice",
      });
    });
    return timeData;
  }

  private createStudySchedule(rawData: string[][]): StudySchedule[] {
    return rawData.map((row) => this.parseScheduleData(row));
  }
}
