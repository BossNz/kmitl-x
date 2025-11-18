export interface MidtermScoreObject {
  order: number;
  subjectCode: string;
  subjectName: string;
  section: number;
  scores: string[];
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

export interface ScoreSymbol {
  symbol: string;
  description: string;
}

export interface MidtermScore {
  studentInfo: StudentInfo;
  midtermScores: MidtermScoreObject[];
  note: string;
  scoreSymbols: ScoreSymbol[];
}
