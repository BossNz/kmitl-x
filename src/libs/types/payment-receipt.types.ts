export interface ReceiptRecord {
  studentId: string;
  name: string;
  requestedDate: string;
  approvedDate: string;
  status: string;
  // When the receipt is available, the request/print column is a download link.
  receiptUrl: string;
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
