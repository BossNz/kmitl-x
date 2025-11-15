import type { RawStudentInfo, StudentProfile } from "../types/student.types";
import { BaseScraper } from "./baseScraper";

export class StudentScraper extends BaseScraper {
  public async scrape(document: Document): Promise<StudentProfile> {
    const thaiTitle = this.getTextById(document, "div_t_prename");
    const englishTitle = this.getTextById(document, "div_e_prename");
    const rawThaiName = this.getTextById(document, "div_t_name");
    const rawEnglishName = this.getTextById(document, "div_e_name");

    const splittedThaiName = this.splitName(rawThaiName);
    const splittedEnglishName = this.splitName(rawEnglishName);
    const thaiFullName = this.resolveFullName(thaiTitle, rawThaiName);
    const englishFullName = this.resolveFullName(
      englishTitle,
      rawEnglishName
    ).toLocaleUpperCase();

    return {
      studentId: this.getTextById(document, "div_student_id"),
      nationalId: this.getTextByLabel(document, "ประจำตัวประชาชน"),
      thaiTitle,
      thaiName: splittedThaiName.name,
      thaiSurname: splittedThaiName.surname,
      thaiFullName,
      englishTitle,
      englishName: splittedEnglishName.name,
      englishSurname: splittedEnglishName.surname,
      englishFullName,
      birthDate: this.getTextById(document, "div_birth_date"),
      gender: this.getTextById(document, "div_gender"),
      status: this.getTextById(document, "div_status"),
      admissionType: this.getTextById(document, "div_admis_type"),
      admissionYear: this.getTextById(document, "div_admis_year"),
      graduationDate: this.getTextById(document, "div_grad_date"),
      graduationYear: this.getTextById(document, "div_grad_year"),
      faculty: this.getTextById(document, "div_faculty_name"),
      department: this.getCommentContentById(document, "div_dept_name"),
      curriculum: this.getTextById(document, "div_curr2_tname"),
      bankAccount: this.getTextByLabel(document, "บัญชีธนาคาร"),
    };
  }

  private getTextById(document: Document, id: string): string {
    const node = document.getElementById(id);
    return node ? this.normalize(node.textContent) : "";
  }

  private getTextByLabel(document: Document, label: string): string {
    const cells = Array.from(
      document.querySelectorAll<HTMLTableCellElement>("tr")
    );
    for (const cell of cells) {
      const text = this.normalize(cell.children[0].textContent || "");
      if (!text.includes(this.normalize(label))) continue;
      if (cell.children.length < 2) continue;
      return this.normalize(cell.children[1].textContent || "");
    }
    return "";
  }

  private getCommentContentById(document: Document, id: string): string {
    const comments = this.getAllComment(document);

    for (const comment of comments) {
      // parse comment content as HTML document
      const content = this.parseCommentContent(comment);
      if (!content) continue;

      //   try to find the target id in the parsed content
      const targetNode = content.getElementById(id);
      if (!targetNode) continue;

      return this.normalize(targetNode.textContent || "");
    }
    return "";
  }

  private getAllComment(node: Node): Comment[] {
    const comments: Comment[] = [];
    // use a stack for DFS traversal
    const nodesToProcess = [node];

    // DFS traversal to find comment nodes
    while (nodesToProcess.length > 0) {
      // process the current node
      const currentNode = nodesToProcess.pop();
      if (!currentNode || !currentNode.childNodes) continue;

      //   iterate through child nodes
      for (let i = 0; i < currentNode.childNodes.length; i++) {
        const childNode = currentNode.childNodes[i];

        if (childNode.nodeType === Node.COMMENT_NODE) {
          comments.push(childNode as Comment);
        } else {
          nodesToProcess.push(childNode);
        }
      }
    }
    return comments;
  }

  // parse comment content as HTML document
  private parseCommentContent(comment: Comment) {
    const content = comment.nodeValue;
    if (!content) return null;
    try {
      const parser = new DOMParser();
      return parser.parseFromString(content, "text/html");
    } catch (e) {
      return null;
    }
  }

  private composeFullName(title: string, name: string): string {
    return [title, name].filter(Boolean).join("").trim();
  }

  private resolveFullName(title: string, name: string): string {
    const composed = this.composeFullName(title, name);
    if (composed) return composed;
    if (name) return name;
    if (title) return title;
    return "";
  }

  private splitName(fullName: string): { name: string; surname: string } {
    const parts = fullName.trim().split(" ");
    const surname = parts.pop() || "";
    const name = parts.join(" ");
    return { name, surname };
  }

  private normalize(value: string | null | undefined): string {
    if (!value) return "";
    return value
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
}
