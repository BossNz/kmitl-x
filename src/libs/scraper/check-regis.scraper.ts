import type { CheckRegis } from "../types/check-regis.types";
import { BaseScraper } from "./baseScraper";

export class CheckRegisScraper extends BaseScraper {
  public async scrape(document: Document): Promise<CheckRegis> {
    const text = (id: string) =>
      (document.getElementById(id)?.textContent || "").replace(/\s+/g, " ").trim();

    const statusLink = document.querySelector<HTMLAnchorElement>(
      'a[href*="regis.php"]'
    );
    const statusEl = statusLink?.querySelector("h1, font") ?? statusLink;
    const statusMessage = (statusEl?.textContent || "")
      .replace(/\s+/g, " ")
      .trim();
    const statusColor =
      statusLink?.querySelector("font")?.getAttribute("color") || "";
    const calendarLink = document.querySelector<HTMLAnchorElement>(
      'a[href*="educalendar"]'
    );

    return {
      studentId: text("div_student_id"),
      name: text("div_tname"),
      semester: text("div_semester"),
      statusMessage,
      statusColor,
      registerUrl: statusLink?.href || "",
      calendarUrl: calendarLink?.href || "",
    };
  }
}
