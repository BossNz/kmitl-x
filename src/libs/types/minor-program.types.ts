export interface MinorProgramItem {
  name: string;
  url: string;
}

export interface MinorProgramCategory {
  category: string;
  items: MinorProgramItem[];
}

export interface MinorProgramData {
  studentId: string;
  name: string;
  categories: MinorProgramCategory[];
}
