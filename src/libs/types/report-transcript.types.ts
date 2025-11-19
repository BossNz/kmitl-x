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
  dateOfBirth: BirthDate;
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

export interface BirthDate {
  day: number;
  month: string;
  year: number;
}