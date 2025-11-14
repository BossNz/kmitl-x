export interface StudentProfileAnnouncement {
	id: string;
	title: string;
	href: string | null;
	description?: string;
	source: "personal-info" | "registrar-highlight";
	variant?: "highlight" | "info" | "empty";
}

export interface StudentProfile {
	studentId: string;
	nationalId: string;
	nationalIdMasked: string;
	thaiTitle: string;
	thaiName: string;
	thaiFullName: string;
	englishTitle: string;
	englishName: string;
	englishFullName: string;
	birthDate: string;
	gender: string;
	status: string;
	faculty: string;
	curriculum: string;
	admissionType: string;
	admissionYear: string;
	expectedGraduationYear: string;
	expectedGraduationDate: string;
	advisoryMessage: string;
	announcements: StudentProfileAnnouncement[];
}

// Portal scraping / fetching types
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

export interface PortalScript {
	src?: string;
	content?: string;
}

export interface PortalContent {
	url: string;
	html: string;
	title: string;
	scripts: PortalScript[];
	document: Document;
	encoding: string;
	fetchedAt: number;
}

export interface PortalFetcherOptions {
	throttleMs?: number;
}

// Score / grade related types (from PortalContentMapper)
export type ScoreStatus = "score" | "processing" | "notAnnounced" | "notEntered";

export interface ScoreAssessment {
	label: string;
	status: ScoreStatus;
	display: string;
	raw: string;
}

export interface ScoreCourse {
	order: string;
	courseNumber: string;
	courseTitle: string;
	section: string;
	assessments: ScoreAssessment[];
}

export interface ScoreLegendItem {
	status: ScoreStatus | "score";
	label: string;
	description: string;
}

export interface ScoreboardHeader {
	institution?: string;
	faculty?: string;
	studentId?: string;
	studentEnglishName?: string;
	studentThaiName?: string;
	major?: string;
	semester?: string;
}

export interface ScoreboardBlock {
	type: "scoreboard";
	header?: ScoreboardHeader;
	assessments: string[];
	courses: ScoreCourse[];
	legend: ScoreLegendItem[];
	note?: string;
}

export interface MidtermScoreBlock {
	type: "midtermScore";
	actionUrl: string;
	years: ScheduleOption[];
	semesters: ScheduleOption[];
	selectedYear?: string;
	selectedSemester?: string;
	header?: ScoreboardHeader;
	assessments: string[];
	courses: ScoreCourse[];
	legend: ScoreLegendItem[];
	note?: string;
}

export interface NewsItem {
	id: string;
	title: string;
	href: string;
	date?: string;
	category?: string;
}

export interface NewsListBlock {
	type: "newsList";
	title?: string;
	items: NewsItem[];
}

export interface ScheduleOption {
	value: string;
	label: string;
}

export interface ScheduleTableBlock {
	type: "scheduleTable";
	title?: string;
	years: ScheduleOption[];
	semesters: ScheduleOption[];
	actionUrl: string;
}

export interface ExamTableBlock {
	type: "examTable";
	title?: string;
	years: ScheduleOption[];
	semesters: ScheduleOption[];
	actionUrl: string;
}

export interface MinorProgramBlock {
	type: "minorProgram";
	sourceUrl: string;
}

export interface RegistrationEligibilityBlock {
	type: "registrationEligibility";
	studentId: string;
	studentName: string;
	semester: string;
	hasEligibility: boolean;
}

export interface GradeReportCourse {
	no: string;
	courseNo: string;
	courseTitle: string;
	section: string;
	credit: string;
	type: string;
	grade: string;
}

export interface GradeReportSummary {
	label: string;
	ca: string;
	cp: string;
	cd: string;
	gp: string;
	gpsGpa: string;
	status: string;
}

export interface GradeReportLegendItem {
	symbol: string;
	symbolColor: string;
	description: string;
}

export interface GradeReportBlock {
	type: "gradeReport";
	actionUrl: string;
	pdfUrl?: string;
	years: ScheduleOption[];
	semesters: ScheduleOption[];
	selectedYear?: string;
	selectedSemester?: string;
	header?: ScoreboardHeader;
	courses: GradeReportCourse[];
	summaries: GradeReportSummary[];
	legend: GradeReportLegendItem[];
	note?: string;
}

export interface TranscriptBlock {
	type: "transcript";
	actionUrl: string;
	pdfUrl?: string;
}

export type PortalBlock =
	| { type: "heading"; level: number; text: string }
	| { type: "paragraph"; text: string }
	| { type: "list"; ordered: boolean; items: string[] }
	| { type: "keyValue"; items: Array<{ label: string; value: string }> }
	| { type: "table"; headers: string[]; rows: string[][] }
	| { type: "links"; items: Array<{ label: string; href: string }> }
	| { type: "note"; tone: "info" | "warning"; text: string }
	| { type: "divider" }
	| ScoreboardBlock
	| MidtermScoreBlock
	| NewsListBlock
	| ScheduleTableBlock
	| ExamTableBlock
	| MinorProgramBlock
	| RegistrationEligibilityBlock
	| GradeReportBlock
	| TranscriptBlock;

export interface PortalContentModel {
	type?:
		| "registrationEligibility"
		| "minorProgram"
		| "newsList"
		| "schedule"
		| "exam"
		| "midtermScore"
		| "gradeReport"
		| "transcript";
	title: string;
	subtitle?: string;
	blocks: PortalBlock[];
}

export interface PortalContentMapperOptions {
	sourceUrl?: string;
}

// Schedule scraping types
export interface ScheduleI {
	order: string;
	code: string;
	name: string;
	credits: string;
	theory: string;
	practice: string;
	time: {
		day: string;
		start: string;
		end: string;
		type: string;
	};
	room: string;
	building: string;
	note: string;
}

export interface InformationI {
	faculty: string;
	department: string;
	major: string;
	Semester: string;
	year: string;
	studentID: string;
	name: string;
}

// ExamSchedule
export interface ExamLocation {
	building: string;
	room: string;
	seatNo: string;
	raw: string;
}

export interface ExamItem {
	no: number;
	code: string;
	name: string;
	section: string;
	credits: string;
	type: string;
	date: string;
	time: string;
	location: ExamLocation;
	seatMapUrl?: string;
}

export interface ExamGroup {
	date: string;
	dayName: string;
	fullDate: string;
	daysUntil: number;
	items: ExamItem[];
}

export interface CalendarDay {
	day: number;
	isCurrentMonth: boolean;
	isToday: boolean;
	exams: ExamItem[];
	daysUntil: number;
	fullDate: string;
}

// Design tokens types
export type DesignTokensType = typeof import("../styles/design-tokens").DesignTokens;
export type UtilityClassesType = typeof import("../styles/design-tokens").UtilityClasses;

