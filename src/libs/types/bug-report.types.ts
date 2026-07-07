export interface BugTypeOption {
  value: string;
  label: string;
}

export interface BugReportData {
  studentId: string;
  name: string;
  semester: string;
  typeOptions: BugTypeOption[];
  ssid: string;
  action: string;
}
