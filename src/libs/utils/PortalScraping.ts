export interface PortalMenuItem {
	id: string;
	label: string;
	url: string;
	absoluteUrl: string;
	type: "internal" | "external";
	supportsEmbed: boolean;
	openInNewTab: boolean;
	rawOnclick?: string | null;
}

export interface PortalSection {
	key: string;
	id: string;
	title: string;
	description: string;
	icon: string;
	accent: string;
	order: number;
	items: PortalMenuItem[];
}

export interface PortalMeta {
	title: string;
	logoUrl: string | null;
	initialServerTime: string | null;
	homeUrl: string;
}

export interface PortalDataset {
	sections: PortalSection[];
	meta: PortalMeta;
}

type SectionMeta = Omit<PortalSection, "items">;

const SECTION_LOOKUP: SectionMeta[] = [
	{
		key: "header1",
		id: "general",
		title: "ข้อมูลและบริการทั่วไป",
		description: "บริการพื้นฐานและลิงก์ภายนอกที่ใช้งานบ่อย",
		icon: "ph:compass-duotone",
		accent: "#fb923c",
		order: 1,
	},
	{
		key: "header2",
		id: "student",
		title: "ข้อมูลนักศึกษา",
		description: "โปรไฟล์และข้อมูลพื้นฐานของนักศึกษา",
		icon: "ph:identification-card-duotone",
		accent: "#f97316",
		order: 2,
	},
	{
		key: "header3",
		id: "registration",
		title: "การลงทะเบียน",
		description: "วางแผนตารางเรียนและการลงทะเบียน",
		icon: "ph:calendar-check-duotone",
		accent: "#f59e0b",
		order: 3,
	},
	{
		key: "header4",
		id: "grades",
		title: "ผลการเรียน",
		description: "ติดตามคะแนน สรุปผล และทรานสคริปต์",
		icon: "ph:chart-line-up-duotone",
		accent: "#f97316",
		order: 4,
	},
	{
		key: "header5",
		id: "scholarship",
		title: "ทุนและสวัสดิการ",
		description: "ประกาศทุนและข้อมูลการสนับสนุนนักศึกษา",
		icon: "ph:hand-coins-duotone",
		accent: "#fb923c",
		order: 5,
	},
	{
		key: "header6",
		id: "systems",
		title: "ระบบสนับสนุน",
		description: "เครื่องมือและระบบเสริมการเรียน",
		icon: "ph:toolbox-duotone",
		accent: "#fbbf24",
		order: 6,
	},
	{
		key: "header7",
		id: "news",
		title: "ข่าวและประกาศ",
		description: "ข่าวสาร กิจกรรม และเว็บบอร์ด",
		icon: "ph:megaphone-duotone",
		accent: "#fb923c",
		order: 7,
	},
	{
		key: "header8",
		id: "messages",
		title: "กล่องข้อความ",
		description: "ส่งข้อความ รายงานปัญหา และติดตามแจ้งเตือน",
		icon: "ph:chat-circle-text-duotone",
		accent: "#fb923c",
		order: 8,
	},
];

const HEADER_META = new Map<string, SectionMeta>(
	SECTION_LOOKUP.map((meta) => [meta.key, meta])
);

export default class PortalScraping {
	private readonly root: Document;
	private readonly pageUrl: string;
	private readonly pageOrigin: string;

	constructor(root: Document, pageUrl: string) {
		this.root = root;
		this.pageUrl = pageUrl;
		this.pageOrigin = new URL(pageUrl).origin;
	}

	public getPortalDataset(): PortalDataset {
		return {
			sections: this.extractSections(),
			meta: this.extractMeta(),
		};
	}

	private extractSections(): PortalSection[] {
		const sectionMap = new Map<string, PortalSection>();
		const anchors = Array.from(
			this.root.querySelectorAll<HTMLAnchorElement>("td.slideMenu a")
		);
		const takenUrls = new Set<string>();

		anchors.forEach((anchor, index) => {
			const headerKey = this.resolveHeaderKey(anchor);
			if (!headerKey) return;

			const meta = HEADER_META.get(headerKey);
			if (!meta) return;

			const item = this.buildMenuItem(anchor, meta.id, index);
			if (!item) return;

			const dedupeKey = `${meta.id}|${item.absoluteUrl}`;
			if (takenUrls.has(dedupeKey)) return;
			takenUrls.add(dedupeKey);

			if (!sectionMap.has(meta.id)) {
				sectionMap.set(meta.id, {
					...meta,
					items: [],
				});
			}

			sectionMap.get(meta.id)?.items.push(item);
		});

		const sections = Array.from(sectionMap.values())
			.map((section) => ({
				...section,
				items: section.items.sort((a, b) =>
					a.label.localeCompare(b.label, "th")
				),
			}))
			.sort((a, b) => a.order - b.order);

		return sections;
	}

	private extractMeta(): PortalMeta {
		const title = this.root.title?.trim() || "KMITL Portal";
		const logoCandidate = this.root.querySelector<HTMLImageElement>(
			"img[src*='KMITL_Sublogo'], img[src*='LogoX']"
		);
		const logoUrl = logoCandidate
			? this.toAbsoluteUrl(logoCandidate.getAttribute("src"))
			: null;

		return {
			title,
			logoUrl,
			initialServerTime: this.extractServerSeed(),
			homeUrl: this.pageUrl,
		};
	}

	private buildMenuItem(
		anchor: HTMLAnchorElement,
		sectionId: string,
		index: number
	): PortalMenuItem | null {
		const rawLabel = anchor.textContent || anchor.innerText || "";
		const label = this.normalizeLabel(rawLabel);
		if (!label) return null;

		const onclick = anchor.getAttribute("onclick") || "";
		const extractedUrl = this.extractUrlFromOnclick(onclick);
		const href = anchor.getAttribute("href") || "";

		let candidateUrl = extractedUrl || href;
		if (!candidateUrl || candidateUrl.startsWith("javascript")) return null;

		const absoluteUrl = this.toAbsoluteUrl(candidateUrl);
		if (!absoluteUrl) return null;

		const isSameOrigin = this.isSameOrigin(absoluteUrl);
		const openInNewTab = anchor.getAttribute("target") === "_blank";
		const type = isSameOrigin ? "internal" : "external";
		const supportsEmbed = isSameOrigin && !!extractedUrl;

		const id = this.generateId(sectionId, index, absoluteUrl);

		return {
			id,
			label,
			url: candidateUrl,
			absoluteUrl,
			type,
			supportsEmbed,
			openInNewTab: openInNewTab || !supportsEmbed,
			rawOnclick: onclick || null,
		};
	}

	private resolveHeaderKey(anchor: HTMLAnchorElement): string | null {
		const table = anchor.closest("table");
		if (!table) return null;
		const headerImage = table.querySelector<HTMLImageElement>(
			"img[src*='header']"
		);
		if (!headerImage) return null;
		const src = headerImage.getAttribute("src") || "";
		const match = src.match(/header(\d+)/i);
		return match ? `header${match[1]}` : null;
	}

	private normalizeLabel(label: string): string {
		return label.replace(/\s+/g, " ").replace(/\u00A0/g, " ").trim();
	}

	private extractUrlFromOnclick(onclick: string): string {
		const match = onclick.match(/getiContent\(['\"]([^'\"]+)/i);
		return match ? match[1] : "";
	}

	private toAbsoluteUrl(url: string | null): string | null {
		if (!url) return null;
		try {
			return new URL(url, this.pageUrl).toString();
		} catch (error) {
			return null;
		}
	}

	private isSameOrigin(url: string): boolean {
		try {
			return new URL(url).origin === this.pageOrigin;
		} catch (error) {
			return false;
		}
	}

	private generateId(sectionId: string, index: number, url: string): string {
		const safeUrl = url.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
		return `${sectionId}-${index}-${safeUrl}`;
	}

	private extractServerSeed(): string | null {
		const scripts = Array.from(this.root.querySelectorAll("script"));
		for (const script of scripts) {
			const content = script.textContent || "";
			const match = content.match(/server_date\(['\"]([^'\"]+)['\"]\)/);
			if (match) return match[1];
		}
		return null;
	}
}