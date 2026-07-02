export interface CheckRegis {
  studentId: string;
  name: string;
  semester: string;
  // The eligibility message shown by the registrar, with its own color.
  statusMessage: string;
  statusColor: string;
  registerUrl: string;
  calendarUrl: string;
}
