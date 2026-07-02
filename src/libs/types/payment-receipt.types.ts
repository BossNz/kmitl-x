export interface ReceiptRecord {
  studentId: string;
  name: string;
  requestedDate: string;
  approvedDate: string;
  status: string;
}

export interface FeeDocument {
  name: string;
  url: string;
}

export interface PaymentReceiptData {
  yearOptions: string[];
  semesterOptions: string[];
  selectedYear: string;
  selectedSemester: string;
  records: ReceiptRecord[];
  documents: FeeDocument[];
}
