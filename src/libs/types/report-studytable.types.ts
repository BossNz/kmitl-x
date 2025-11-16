export interface ScheduleObject {
  order: number;
  subjectCode: string;
  subjectName: string;
  credit: number;
  lectureSection: number;
  practiceSection?: number;
  room: string;
  building: string;
  note?: string;
}

export interface StudySchedule extends ScheduleObject {
  time: Array<{
    day: string;
    startTime: string;
    endTime: string;
    type: "lecture" | "practice";
  }>;
}

export interface StudentInfo {
  studentId: string;
  name: string;
  faculty: string;
  department: string;
  curriculum: string;
  semester: string;
  year: string;
}

export interface StudyTable {
  studentInfo: StudentInfo;
  studySchedules: StudySchedule[];
}