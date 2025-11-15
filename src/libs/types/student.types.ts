export interface RawStudentInfo {
  studentId: string;
  nationalId: string;
  thaiTitle: string;
  thaiFullName: string;
  englishTitle: string;
  englishFullName: string;
  birthDate: string;
  gender: string;
  status: string;
  admissionType: string;
  admissionYear: string;
  graduationYear: string;
  graduationDate: string;
  faculty: string;
  department: string;
  curriculum: string;
  bankAccount: string;
}

export interface StudentProfile extends RawStudentInfo {
  thaiName: string;
  thaiSurname: string;
  englishName: string;
  englishSurname: string;
}