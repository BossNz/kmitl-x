import type { StudentProfile, StudentProfileAnnouncement } from "../types";

export default class StudentProfileScraping {
  private readonly doc: Document;

  constructor(doc: Document) {
    this.doc = doc;
  }

  public extract(): StudentProfile {
    const thaiTitle = this.getTextById("div_t_prename");
    const englishTitle = this.getTextById("div_e_prename");
    const thaiName = this.getTextById("div_t_name");
    const englishName = this.getTextById("div_e_name");
    const nationalIdRaw =
      this.getValueByLabel("เลขประจำตัวประชาชน") ||
      this.getAdjacentRowValue("div_t_prename", -1);
    const nationalIdDigits = this.sanitizeDigits(nationalIdRaw);
    const thaiFullName = this.resolveFullName(thaiTitle, thaiName);
    const englishFullName = this.resolveFullName(englishTitle, englishName).toLocaleUpperCase();

    const announcements = this.extractAnnouncements();

    return {
      studentId: this.getTextById("div_student_id"),
      nationalId: this.formatNationalId(nationalIdDigits) || nationalIdRaw,
      nationalIdMasked: this.maskNationalId(nationalIdDigits) || nationalIdRaw,
      thaiTitle,
      thaiName,
      thaiFullName,
      englishTitle,
      englishName,
      englishFullName,
      birthDate: this.getTextById("div_birth_date"),
      gender: this.getTextById("div_gender"),
      status: this.getTextById("div_status"),
      faculty: this.getTextById("div_faculty_name"),
      curriculum: this.getTextById("div_curr2_tname"),
      admissionType: this.getTextById("div_admis_type"),
      admissionYear: this.getTextById("div_admis_year"),
      expectedGraduationYear: this.getTextById("div_grad_year"),
      expectedGraduationDate: this.getTextById("div_grad_date"),
      advisoryMessage: this.getTextById("div_msg"),
      announcements,
    };
  }

  private getTextById(id: string): string {
    const node = this.doc.getElementById(id);
    return node ? this.normalize(node.textContent) : "";
  }

  private getValueByLabel(label: string): string {
    const normalizedLabel = label.replace(/\s+/g, "");
    const cells = Array.from(this.doc.querySelectorAll<HTMLTableCellElement>("td"));
    for (const cell of cells) {
      const text = this.normalize(cell.textContent).replace(/\s+/g, "");
      if (!text.includes(normalizedLabel)) continue;

      const siblings = cell.parentElement?.querySelectorAll("td");
      if (siblings && siblings.length > 1) {
        const valueCell = siblings[1];
        return this.normalize(valueCell.textContent);
      }
    }
    return "";
  }

  private normalize(value: string | null | undefined): string {
    if (!value) return "";
    return value.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
  }

  private composeFullName(title: string, name: string): string {
    return [title, name].filter(Boolean).join(" ").trim();
  }

  private resolveFullName(title: string, name: string): string {
    const composed = this.composeFullName(title, name);
    if (composed) return composed;
    if (name) return name;
    if (title) return title;
    return "";
  }

  private sanitizeDigits(value: string): string {
    return value.replace(/\D/g, "");
  }

  private getAdjacentRowValue(elementId: string, offset: number): string {
    const element = this.doc.getElementById(elementId);
    if (!element) return "";

    const currentRow = element.closest("tr");
    if (!currentRow) return "";

    let targetRow: Element | null = currentRow;
    let steps = Math.abs(offset);
    const direction = offset >= 0 ? "nextElementSibling" : "previousElementSibling";

    while (steps > 0 && targetRow) {
      targetRow = (targetRow as HTMLElement)[direction] as Element | null;
      steps -= 1;
    }

    if (!targetRow || !(targetRow instanceof HTMLTableRowElement)) return "";

    const cells = Array.from(targetRow.querySelectorAll("td"));
    if (cells.length === 0) return "";

    const valueCell = cells[cells.length - 1];
    return this.normalize(valueCell.textContent);
  }

  private formatNationalId(value: string): string {
    if (value.length !== 13) return value;
    const parts = [
      value.slice(0, 1),
      value.slice(1, 5),
      value.slice(5, 10),
      value.slice(10, 12),
      value.slice(12, 13),
    ];
    return parts.join("-");
  }

  private maskNationalId(value: string): string {
    if (!value) return "";
    const maskedDigits = value
      .split("")
      .map((digit, index) => (index === 0 || index >= value.length - 2 ? digit : "*"))
      .join("");
    return this.formatNationalId(maskedDigits);
  }

  private extractAnnouncements(): StudentProfileAnnouncement[] {
    const announcements: StudentProfileAnnouncement[] = [];
    const accordion = this.doc.getElementById("accordion");

    if (accordion) {
      const panel = accordion.querySelector<HTMLElement>(".ui-accordion-content") ?? accordion;
      const items = Array.from(panel.children) as HTMLElement[];
      const candidates = items.length > 0 ? items : [panel];

      candidates.forEach((element, index) => {
        const links = Array.from(element.querySelectorAll<HTMLAnchorElement>("a"));
        if (links.length > 0) {
          links.forEach((link, linkIndex) => {
            const title = this.normalize(link.textContent);
            if (!title) return;
            announcements.push({
              id: `accordion-link-${index}-${linkIndex}-${link.id || "anchor"}`,
              title,
              href: this.resolveHref(link),
              source: "personal-info",
              variant: "highlight",
            });
          });
        } else {
          const text = this.normalize(element.textContent);
          if (!text) return;
          const emptyPattern = /\u0e44\u0e21\u0e48\u0e21\u0e35\u0e1b\u0e23\u0e30\u0e01\u0e32\u0e28/i;
          announcements.push({
            id: `accordion-note-${index}`,
            title: text,
            href: null,
            source: "personal-info",
            variant: emptyPattern.test(text) ? "empty" : "info",
          });
        }
      });
    }

    const spotlightLink = this.doc.querySelector<HTMLAnchorElement>("#kmitl_exp a");
    if (spotlightLink) {
      const title = this.normalize(spotlightLink.textContent);
      if (title) {
        announcements.push({
          id: `spotlight-${spotlightLink.id || "primary"}`,
          title,
          href: this.resolveHref(spotlightLink),
          source: "registrar-highlight",
          variant: "highlight",
        });
      }
    }

    return this.dedupeAnnouncements(announcements);
  }

  private resolveHref(anchor: HTMLAnchorElement): string | null {
    const href = anchor.getAttribute("href");
    if (!href) return null;
    if (href.toLowerCase().startsWith("javascript")) return null;

    try {
      return new URL(href, this.doc.baseURI).toString();
    } catch (error) {
      return href;
    }
  }

  private dedupeAnnouncements(
    announcements: StudentProfileAnnouncement[]
  ): StudentProfileAnnouncement[] {
    const seen = new Set<string>();
    return announcements.filter((item) => {
      const key = `${item.title}::${item.href ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
