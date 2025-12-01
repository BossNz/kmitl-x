import type { ExamObject } from "../../types/report-examtable.types";
import { parseExamDateToDate, parseDateInfo, getDayName } from "./date";
import type { CalendarDay, ExamGroup } from "./types";

export function groupExams(exams: ExamObject[]): ExamGroup[] {
  const groups = new Map<
    string,
    {
      date: {
        day: string;
        month: string;
        year: string;
        raw: string;
      };
      items: ExamObject[];
    }
  >();
  const today = new Date();

  exams.forEach((exam) => {
    let key =
      exam.date.raw && exam.date.raw.trim() !== "" ? exam.date.raw : "อื่นๆ";

    if (key === "อื่นๆ") {
      key = "อื่นๆ";
    } else if (key === "จัดสอบเอง") {
      key = "จัดสอบเอง";
    }

    if (!groups.has(key)) {
      groups.set(key, {
        date: {
          day: exam.date.day,
          month: exam.date.month,
          year: exam.date.year,
          raw: key,
        },
        items: [],
      });
    }

    groups.get(key)!.items.push(exam);
  });

  // Convert the grouped map to the array structure used by the UI
  const groupedExams = Array.from(groups.entries()).map(([, { date, items }]) => {
    const realDate = parseExamDateToDate(date.day, date.month, date.year);
    const { fullDate, daysUntil } = parseDateInfo(date.raw, today, realDate);

    return {
      date: date.raw,
      dayName: getDayName(realDate),
      fullDate,
      daysUntil,
      items: items.sort((a, b) => (a.order || 0) - (b.order || 0)),
    };
  });

  groupedExams.sort((a, b) => {
    if (a.date === "อื่นๆ" || a.date === "จัดสอบเอง") return 1;
    if (b.date === "อื่นๆ" || b.date === "จัดสอบเอง") return -1;
    return (a.daysUntil || 0) - (b.daysUntil || 0);
  });

  return groupedExams;
}

export function getCalendarDays(currentMonth: Date, exams: ExamObject[]): CalendarDay[] {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // First day of month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Start from Sunday of the week containing the 1st
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  // End on Saturday of the week containing the last day
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

  const days: CalendarDay[] = [];
  const current = new Date(startDate);
  const today = new Date();

  while (current <= endDate) {
    const isCurrentMonth = current.getMonth() === month;

    // Check if this is today
    const isToday =
      current.getDate() === today.getDate() &&
      current.getMonth() === today.getMonth() &&
      current.getFullYear() === today.getFullYear();

    const diffTime = current.getTime() - today.getTime();
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const thaiMonths = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
    const fullDate = `${current.getDate()} ${thaiMonths[current.getMonth()]} ${current.getFullYear() + 543}`;

    // Collect exams for this date
    const dayExams = exams.filter((exam) => {
      const examDate = parseExamDateToDate(
        exam.date.day,
        exam.date.month,
        exam.date.year
      );
      if (!examDate) return false;

      return (
        examDate.getDate() === current.getDate() &&
        examDate.getMonth() === current.getMonth() &&
        examDate.getFullYear() === current.getFullYear()
      );
    });

    days.push({
      day: current.getDate(),
      isCurrentMonth,
      isToday,
      daysUntil,
      fullDate,
      exams: dayExams,
    });

    current.setDate(current.getDate() + 1);
  }

  return days;
}
