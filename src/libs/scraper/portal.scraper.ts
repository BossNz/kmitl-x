import type {
  PortalMenuItem,
  PortalScraperResult,
  PortalSection,
} from "../types/portal.types";
import { BaseScraper } from "./baseScraper";

type SectionMeta = Omit<PortalSection, "items">;

// for mapping header images to section metadata
const SECTION_LOOKUP: SectionMeta[] = [
  {
    key: "header1",
    id: "general",
    title: "ข้อมูลและบริการทั่วไป",
    description: "บริการพื้นฐานและลิงก์ภายนอกที่ใช้งานบ่อย",
    icon: "ph:compass-duotone",
    order: 1,
  },
  {
    key: "header2",
    id: "student",
    title: "ข้อมูลนักศึกษา",
    description: "โปรไฟล์และข้อมูลพื้นฐานของนักศึกษา",
    icon: "ph:identification-card-duotone",
    order: 2,
  },
  {
    key: "header3",
    id: "registration",
    title: "การลงทะเบียน",
    description: "วางแผนตารางเรียนและการลงทะเบียน",
    icon: "ph:calendar-check-duotone",
    order: 3,
  },
  {
    key: "header4",
    id: "grades",
    title: "ผลการเรียน",
    description: "ติดตามคะแนน สรุปผล และทรานสคริปต์",
    icon: "ph:chart-line-up-duotone",
    order: 4,
  },
  {
    key: "header5",
    id: "scholarship",
    title: "ทุนและสวัสดิการ",
    description: "ประกาศทุนและข้อมูลการสนับสนุนนักศึกษา",
    icon: "ph:hand-coins-duotone",
    order: 5,
  },
  {
    key: "header6",
    id: "systems",
    title: "ระบบสนับสนุน",
    description: "เครื่องมือและระบบเสริมการเรียน",
    icon: "ph:toolbox-duotone",
    order: 6,
  },
  {
    key: "header7",
    id: "news",
    title: "ข่าวและประกาศ",
    description: "ข่าวสาร กิจกรรม และเว็บบอร์ด",
    icon: "ph:megaphone-duotone",
    order: 7,
  },
  {
    key: "header8",
    id: "messages",
    title: "กล่องข้อความ",
    description: "ส่งข้อความ รายงานปัญหา และติดตามแจ้งเตือน",
    icon: "ph:chat-circle-text-duotone",
    order: 8,
  },
];

const HEADER_META = new Map<string, SectionMeta>(
  SECTION_LOOKUP.map((meta) => [meta.key, meta])
);

export class PortalScraper extends BaseScraper {
  public async scrape(document: Document): Promise<PortalScraperResult> {
    return {
      meta: this.extractMeta(document),
      sections: this.extractSections(document),
    };
  }

  private extractMeta(document: Document): PortalScraperResult["meta"] {
    const title = document.title || "KMITL Portal";
    const initialServerTime = this.extractServerSeed(document);
    const homeUrl = document.location.href;
    return {
      title,
      initialServerTime,
      homeUrl,
    };
  }

  private extractSections(document: Document): PortalScraperResult["sections"] {
    // map of section ID to PortalSection
    const sectionMap = new Map<string, PortalSection>();

    // find all anchors within slideMenu table cells
    const anchors = Array.from(
      document.querySelectorAll<HTMLAnchorElement>("td.slideMenu a")
    );

    // to track already taken URLs for deduplication
    const takenUrls = new Set<string>();

    // process each anchor
    anchors.forEach((anchor, index) => {
      const headerKey = this.resolveHeaderKey(anchor);
      if (!headerKey) return;

      const meta = HEADER_META.get(headerKey);
      if (!meta) return;

      const item = this.buildMenuItem(
        anchor,
        meta.id,
        document.location.href,
        index
      );
      if (!item) return;

      // deduplicate by label + absoluteUrl
      // to avoid duplicates from multiple anchors pointing to same URL
      const dedupeKey = `${item.label}|${item.absoluteUrl}`;
      if (takenUrls.has(dedupeKey)) return;
      takenUrls.add(dedupeKey);

      // create section if not exists
      if (!sectionMap.has(meta.id)) {
        sectionMap.set(meta.id, {
          ...meta,
          items: [],
        });
      }

      // add item to section
      sectionMap.get(meta.id)?.items.push(item);
    });

    // create sections array from map and sort items and sections
    const sections = Array.from(sectionMap.values())
      .map((section) => ({
        ...section,
        items: section.items.sort((a, b) =>
          // sort by label (Thai locale ก-ฮ)
          a.label.localeCompare(b.label, "th")
        ),
      }))
      // sort by order (ascending)
      .sort((a, b) => a.order - b.order);

    return sections;
  }

  private buildMenuItem(
    anchor: HTMLAnchorElement,
    sectionId: string,
    pageUrl: string,
    index: number
  ): PortalMenuItem | null {
    const rawLabel = anchor.textContent || anchor.innerText || "";
    const label = this.normalizeLabel(rawLabel);
    if (!label) return null;

    const onclick = anchor.getAttribute("onclick") || "";
    // try to extract URL from onclick if present
    // otherwise use href or form action
    const extractedUrl =
      this.extractUrlFromOnclick(onclick) ||
      anchor.closest("form")?.getAttribute("action");

    const url = anchor.getAttribute("href") || "";

    let candidateUrl = extractedUrl || url;
    if (!candidateUrl || candidateUrl.startsWith("javascript")) return null;

    const absoluteUrl = this.toAbsoluteUrl(candidateUrl, pageUrl)?.replace(
      "http://",
      "https://"
    );
    if (!absoluteUrl) return null;

    const isInternal = this.isSameOrigin(absoluteUrl, pageUrl);

    const openInNewTab =
      anchor.getAttribute("target") === "_blank" ||
      anchor.closest("form")?.getAttribute("target") === "_blank";

    const id = this.generateId(sectionId, index, absoluteUrl);

    return {
      id,
      label,
      url,
      absoluteUrl,
      isInternal,
      openInNewTab,
    };
  }

  // resolve header key by finding closest table with header image
  // e.g., <img src=".../header1.png"> => "header1"
  private resolveHeaderKey(anchor: HTMLAnchorElement): string | null {
    const table = anchor.closest("table");
    if (!table) return null;
    const headerImage =
      table.querySelector<HTMLImageElement>("img[src*='header']");
    if (!headerImage) return null;
    const src = headerImage.getAttribute("src") || "";
    const match = src.match(/header(\d+)/i);
    return match ? `header${match[1]}` : null;
  }

  // normalize label by trimming whitespace and replacing multiple spaces with a single space
  // e.g., "  Hello   World  " => "Hello World"
  private normalizeLabel(label: string): string {
    return label
      .replace(/\s+/g, " ")
      .replace(/\u00A0/g, " ")
      .trim();
  }

  // extract URL from onclick attribute
  // e.g., "getiContent('some/url')" => "some/url"
  private extractUrlFromOnclick(onclick: string): string {
    const match = onclick.match(/getiContent\(['\"]([^'\"]+)/i);
    return match ? match[1] : "";
  }

  // convert a URL to an absolute URL based on the base URL
  // e.g., "/path/page" + "https://example.com" => "https://example.com/path/page"
  private toAbsoluteUrl(url: string | null, baseUrl: string): string | null {
    if (!url) return null;
    try {
      return new URL(url, baseUrl).toString();
    } catch (error) {
      return null;
    }
  }

  // check if the URL is of the same origin as the base URL
  // e.g., "https://example.com/page" and "https://example.com/other" => true
  private isSameOrigin(url: string, baseUrl: string): boolean {
    try {
      return new URL(url).origin === new URL(baseUrl).origin;
    } catch (error) {
      return false;
    }
  }

  // generate a unique ID for a menu item based on section ID, index, and URL
  // e.g., "general-0-https-www-reg-kmitl-ac-th-index-php"
  private generateId(sectionId: string, index: number, url: string): string {
    const safeUrl = url.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    return `${sectionId}-${index}-${safeUrl}`;
  }

  // extract initial server time from inline scripts
  // e.g., server_date('2023/10/05 12:34:56')
  private extractServerSeed(document: Document): string {
    const scripts = Array.from(document.querySelectorAll("script"));
    for (const script of scripts) {
      const content = script.textContent || "";
      const match = content.match(/server_date\(['\"]([^'\"]+)['\"]\)/);
      if (match) return match[1];
    }
    return new Date().toISOString();
  }
}
