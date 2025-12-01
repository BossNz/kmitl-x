import type { ExamObject } from "../../types/report-examtable.types";

export interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  daysUntil: number;
  fullDate: string;
  exams?: ExamObject[];
}

export interface ExamGroup {
  date: string;
  dayName?: string;
  fullDate?: string;
  daysUntil?: number;
  items: ExamObject[];
}
