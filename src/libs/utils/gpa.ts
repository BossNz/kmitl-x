// KMITL letter-grade scale. Grades not listed here (W, S, U, I, ...) do not
// count toward the GPA.
export const GRADE_POINTS: Record<string, number> = {
  A: 4,
  "B+": 3.5,
  B: 3,
  "C+": 2.5,
  C: 2,
  "D+": 1.5,
  D: 1,
  F: 0,
};

export const GRADE_OPTIONS = ["A", "B+", "B", "C+", "C", "D+", "D", "F"];

export function gradePoint(grade: string): number | null {
  const g = grade.trim().toUpperCase();
  return g in GRADE_POINTS ? GRADE_POINTS[g] : null;
}

export interface GpaInput {
  credit: number;
  grade: string;
}

export interface GpaResult {
  gradePoints: number;
  credits: number;
  gpa: number;
}

// Sum grade points and credits over the courses that carry a letter grade.
export function computeGpa(courses: GpaInput[]): GpaResult {
  let gradePoints = 0;
  let credits = 0;
  for (const course of courses) {
    const point = gradePoint(course.grade);
    if (point === null || !(course.credit > 0)) continue;
    gradePoints += point * course.credit;
    credits += course.credit;
  }
  return { gradePoints, credits, gpa: credits > 0 ? gradePoints / credits : 0 };
}
