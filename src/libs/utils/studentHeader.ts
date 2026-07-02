// Several registrar pages expose the logged-in student in the same two divs.
export function getDivText(document: Document, id: string): string {
  return (document.getElementById(id)?.textContent || "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getStudentHeader(document: Document): {
  studentId: string;
  name: string;
} {
  return {
    studentId: getDivText(document, "div_student_id"),
    name: getDivText(document, "div_tname"),
  };
}
