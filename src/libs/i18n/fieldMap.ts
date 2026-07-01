// The registrar pages label the same fields differently depending on the
// session language. Scrapers use this map to identify a field by its label
// regardless of whether the page is Thai or English.

export type FieldKey =
  | "faculty"
  | "department"
  | "curriculum"
  | "studentId"
  | "name"
  | "semester"
  | "year"
  | "credit"
  | "grade"
  | "section";

const FIELD_LABELS: Record<FieldKey, string[]> = {
  faculty: ["คณะ", "Faculty"],
  department: ["ภาควิชา", "สาขาวิชา", "Department"],
  curriculum: ["หลักสูตร", "Curriculum", "Program"],
  studentId: ["รหัสนักศึกษา", "รหัสประจำตัว", "Student ID", "Student Code"],
  name: ["ชื่อ-สกุล", "ชื่อ", "Name"],
  semester: ["ภาคการศึกษา", "ภาคเรียน", "Semester"],
  year: ["ปีการศึกษา", "Academic Year", "Year"],
  credit: ["หน่วยกิต", "Credit"],
  grade: ["เกรด", "ผลการเรียน", "Grade"],
  section: ["กลุ่ม", "ตอนเรียน", "Section", "Sec"],
};

// Return the canonical field key whose label appears in the given text, or null.
export function matchField(label: string): FieldKey | null {
  const text = label.trim();
  if (!text) return null;
  for (const key of Object.keys(FIELD_LABELS) as FieldKey[]) {
    if (FIELD_LABELS[key].some((candidate) => text.includes(candidate))) {
      return key;
    }
  }
  return null;
}
