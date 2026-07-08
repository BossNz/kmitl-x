import { apiClient } from "./client";
import { cached } from "./cache";
import { ReportGradetableScraper } from "../scraper/report-gradetable.scraper";
import { ReportExamtableScraper } from "../scraper/report-examtable.scraper";
import { parseExamDateToDate } from "../utils/examtable/date";
import type { ExamObject } from "../types/report-examtable.types";

const TTL_MS = 10 * 60 * 1000;

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

// Cumulative GPAX (across all semesters), fetched from the grade page. Held in
// memory only, not persisted, since it is sensitive academic data.
export function getGpax(year: string, semester: string): Promise<string> {
  return cached(`dash:gpax:${year}:${semester}`, TTL_MS, async () => {
    const url = `${location.origin}/u_student/report_gradetable_show.php?semester=${semester}&year=${year}`;
    const doc = await apiClient.fetchHtml(url);
    const data = await new ReportGradetableScraper().scrape(doc);
    return data.gradeSummary?.cumulation?.gpsGpa || "";
  });
}

export interface NextExam {
  subjectCode: string;
  subjectName: string;
  day: string;
  month: string;
  year: string;
  time: string;
  daysUntil: number;
}

async function fetchExams(
  year: string,
  semester: string,
  midOrFinal: string
): Promise<ExamObject[]> {
  try {
    const url = `${location.origin}/u_student/report_examtable_show.php?year=${year}&semester=${semester}&mid_or_final=${midOrFinal}`;
    const doc = await apiClient.fetchHtml(url);
    const data = await new ReportExamtableScraper().scrape(doc);
    return data.exams;
  } catch {
    return [];
  }
}

// The soonest upcoming exam (today or later) across midterm and final. Held in
// memory only, not persisted, since it is user-specific data.
export function getNextExam(
  year: string,
  semester: string
): Promise<NextExam | null> {
  return cached(`dash:exam:${year}:${semester}`, TTL_MS, async () => {
    const [midterm, final] = await Promise.all([
      fetchExams(year, semester, "M"),
      fetchExams(year, semester, "F"),
    ]);

    const today = startOfDay(new Date());
    let best: { exam: ExamObject; time: number } | null = null;
    for (const exam of [...midterm, ...final]) {
      const date = parseExamDateToDate(
        exam.date.day,
        exam.date.month,
        exam.date.year
      );
      if (!date) continue;
      const time = startOfDay(date);
      if (time >= today && (!best || time < best.time)) {
        best = { exam, time };
      }
    }
    if (!best) return null;

    return {
      subjectCode: best.exam.subjectCode,
      subjectName: best.exam.subjectName,
      day: best.exam.date.day,
      month: best.exam.date.month,
      year: best.exam.date.year,
      time: best.exam.date.time.raw,
      daysUntil: Math.round((best.time - today) / 86_400_000),
    };
  });
}
