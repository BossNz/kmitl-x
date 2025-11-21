import type {
  ExamDate,
  ExamObject,
  ExamTable,
  ExamTime,
} from "../types/report-examtable.types";
import { BaseScraper } from "./baseScraper";

export class ReportExamtableScraper extends BaseScraper {
  public async scrape(document: Document): Promise<ExamTable> {
    const rawExamTable = this.extractRawExamTable(document);
    const exams = this.createExamSchedule(rawExamTable);
    const studentInfo = this.extractStudentDetails(document);
    return {
      exams,
      studentInfo,
      pdf: this.extractPdfLink(document),
      type: this.extractExamType(document),
    };
  }

  private extractExamType(document: Document): ExamTable["type"] {
    const typeElement =
      document.querySelector<HTMLSelectElement>("#mid_or_final");
    if (!typeElement) return "M";
    return typeElement.value === "M" ? "M" : "F";
  }

  private extractPdfLink(document: Document): string {
    const pdfLinkElement: HTMLAnchorElement | null = document.querySelector(
      'a[href*="report_examtable_pdf.php"]'
    );
    return pdfLinkElement?.href || "";
  }

  private extractStudentDetails(document: Document): ExamTable["studentInfo"] {
    // Extract student details from specific <td> elements
    // Result: [td, td, td, ...]
    const rows = Array.from(document.querySelectorAll("td"))
      .filter((node) => node.getAttribute("colspan") === "17")
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

  private extractRawExamTable(document: Document): string[][] {
    const rows = Array.from(document.querySelectorAll("tr"))
      .filter((row) => row.childElementCount > 1)
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

  private parseExamData(row: string[]): ExamObject {
    return {
      order: parseInt(row[0], 10),
      subjectCode: row[1],
      subjectName: row[2],
      section: parseInt(row[3], 10),
      credit: this.parseCreditData(row[4]),
      type: this.parseSubjectType(row[5]),
      date: this.parseDateData(row[6], row[7]),
      venue: this.parseVenueData(row[8]),
    };
  }

  // from format "3 (2-1)"
  private parseCreditData(creditString: string): number {
    const credit = parseInt(creditString, 10);
    if (!isNaN(credit)) return credit;
    const match = creditString.match(/(\d+)\s*\(\d+-\d+\)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return 0;
  }

  // from format "อาคาร:ห้อง:ที่นั่ง"
  private parseVenueData(venueString: string): ExamObject["venue"] {
    const venueParts = venueString.split(":").map((part) => part.trim());
    return {
      building: venueParts[0] || "",
      room: venueParts[1] || "",
      seat: venueParts[2] || "",
      raw: venueString,
    };
  }

  // from format "HH:MM-HH:MM")
  private parseTimeData(timeString: string): ExamTime {
    const [start, end] = timeString
      .match(/(\d{2}:\d{2})-(\d{2}:\d{2})/)
      ?.slice(1) || ["", ""];
    return {
      start,
      end,
      raw: timeString,
    };
  }

  // from format "Weekday DD MM YY"
  private parseDateData(
    dateString: string,
    timeString: string
  ): ExamObject["date"] {
    const [weekDay, day, month, rawYear] = dateString.split(" ");
    // this logic is not perfect but works for now
    // year from scraper is last two digits of Gregorian year (at 11 November 2025)
    let year: string;
    if (!rawYear) year = "";
    else {
      weekDay.match(/[ก-ฮ]/)
        ? (year = (parseInt(rawYear, 10) + 2543).toString())
        : (year = (parseInt(rawYear, 10) + 2000).toString());
    }
    return {
      weekDay,
      day: day || "",
      month: month || "",
      year,
      raw: dateString,
      time: this.parseTimeData(timeString),
    };
  }

  private parseSubjectType(typeString: string): ExamObject["type"] {
    if (typeString.includes("ทฤษฎี") || typeString.includes("Lecture")) {
      return "lecture";
    } else if (
      typeString.includes("ปฏิบัติ") ||
      typeString.includes("Practical")
    ) {
      return "practice";
    }
    return "lecture";
  }

  private createExamSchedule(rawData: string[][]): ExamObject[] {
    return rawData.map((data) => this.parseExamData(data));
  }
}
