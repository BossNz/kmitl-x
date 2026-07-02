export interface MinorNewsItem {
  title: string;
  url: string;
  count: number;
  date: string;
}

export interface MinorNewsData {
  studentId: string;
  name: string;
  news: MinorNewsItem[];
}
