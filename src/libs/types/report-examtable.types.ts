export interface ExamObject {
  order: number;
  subjectCode: string;
  subjectName: string;
  section: number;
  credit: number;
  type: "lecture" | "practice";
  date: ExamDate;
  venue: ExamVenue;
}

export interface ExamTime {
  start: string;
  end: string;
  raw: string;
}

export interface ExamDate {
  weekDay: string;
  day: string;
  month: string;
  year: string;
  raw: string;
  time: ExamTime;
}

export interface ExamVenue {
  room: string;
  building: string;
  seat: string;
  raw: string;
  url?: string;
}

export interface StudentInfo {
  studentId: string;
  name: string;
  faculty: string;
  department: string;
  curriculum: string;
  semester: string;
  year: string;
}

export interface ExamTable {
  studentInfo: StudentInfo;
  exams: ExamObject[];
  pdf: string;
  type: "M" | "F";
}
