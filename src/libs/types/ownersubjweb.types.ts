export interface OwnersubjwebSubject {
  code: string;
  name: string;
  credit: string;
  url: string;
}

export interface OwnersubjwebData {
  semester: string;
  year: string;
  headings: string[];
  subjects: OwnersubjwebSubject[];
}
