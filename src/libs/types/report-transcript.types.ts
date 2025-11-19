export interface TranscriptData {
  pdf: string;
  studentInfo: StudentInfo;
  transcriptObject: TranscriptObject;
}

export interface StudentInfo {
  studentId: string;
  name: string;
  degree: string;
  major: string;
  dateOfBirth: string;
  dateOfAdmission: string;
  dateOfGraduation: string;
}

export interface TranscriptObject {
  totalCredits: number;
  cumulativeGPA: number;
  dateIssued: IssuedDate;
}

export interface IssuedDate {
  month: string;
  day: number;
  year: number;
}
