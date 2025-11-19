export interface GradeTableObject {
  order: number;
  subjectCode: string;
  subjectName: string;
  section: number;
  credit: number;
  type: string;
  grade: string;
  gradeColor?: string;
}

export interface GradeSummaryTable {
  semesterSummary: GradeSummary;
  preSemester: GradeSummary;
  cumulation: GradeSummary;
}

export interface GradeSummary {
  ca?: string;
  cp?: string;
  cd?: string;
  gp: string;
  gpsGpa: string;
  status: string;
}

export interface GradeSymbolTable {
  symbols: GradeSymbol[];
  note: string;
}

export interface GradeSymbol {
  symbol: string;
  color: string;
  description: string;
}

export interface StudentInfo {
  studentId: string;
  thaiName: string;
  englishName: string;
  faculty: string;
  department: string;
  curriculum: string;
  semester: string;
  year: string;
}

export interface ReportGradeTable {
  studentInfo: StudentInfo;
  gradeTable: GradeTableObject[];
  gradeSummary: GradeSummaryTable;
  gradeSymbol: GradeSymbolTable;
  pdf: string;
}
