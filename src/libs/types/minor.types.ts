export interface MinorEvent {
  description: string;
  schedule: string;
}

export interface MinorData {
  studentId: string;
  name: string;
  events: MinorEvent[];
}
