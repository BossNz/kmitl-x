import type { StudySchedule } from "../../types/report-studytable.types";

export function createTimeSlot(
  schedule: StudySchedule[],
  day: { name: string; code: string },
  startHour: number,
  endHour: number
): Array<undefined | (StudySchedule & { colSpan: number })> {
  const timeSlot = [];
  const filteredDay = extractSchedule(schedule).filter(
    (item) => item.time[0]?.day === day.code || item.time[0]?.day === day.name
  );

  // Default values
  let colSlot = 4 * (endHour - startHour);
  const startTime = startHour * 60;
  const timeInterval = 15;

  for (let i = 0; colSlot > i; i++) {
    const currentTime = startTime + i * timeInterval;
    const hours = Math.floor(currentTime / 60);
    const minutes = currentTime % 60;
    const formattedTime = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;

    const findSchedule = filteredDay.find(
      (item) => item.time[0]?.startTime === formattedTime
    );
    if (findSchedule) {
      const start = findSchedule.time[0].startTime;
      const end = findSchedule.time[0].endTime;
      const colSpan = calculateNumberOfCols(start, end, timeInterval);
      i += colSpan - 1;
      timeSlot.push({ ...findSchedule, colSpan: colSpan });
    } else timeSlot.push(undefined);
  }
  return timeSlot;
}

const calculateNumberOfCols = (
  startTime: string,
  endTime: string,
  intervalMinutes: number
): number => {
  const startMinutes = convertToMinutes(startTime);
  const endMinutes = convertToMinutes(endTime);

  const numberOfCols = (endMinutes - startMinutes) / intervalMinutes;

  return numberOfCols;
};

const convertToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":");
  return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
};

function extractSchedule(schedule: StudySchedule[]): StudySchedule[] {
  return schedule.flatMap((item) =>
    item.time.map((time) => ({ ...item, time: [time] }))
  );
}
