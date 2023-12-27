import type { ScheduleI } from "./StudentScraping";

export const createTimeSlot = (
  schedule: ScheduleI[],
  day: string = "จ."
): Array<undefined | (ScheduleI & { colSpan: number })> => {
  const timeSlot = [];
  const findDay = schedule.filter((item) => item.time.day == day);
  let colSlot = 44;
  const startTime = 8 * 60;
  const timeInterval = 15;
  for (let i = 0; colSlot > i; i++) {
    const currentTime = startTime + i * timeInterval;
    const hours = Math.floor(currentTime / 60);
    const minutes = currentTime % 60;
    const formattedTime = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;
    const findTime = findDay.find((item) => item.time.start == formattedTime);
    if (findTime) {
      const colSpan = calculateNumberOfCols(
        findTime.time.start,
        findTime.time.end,
        timeInterval
      );
      i += colSpan - 1;
      timeSlot.push({ ...findTime, colSpan });
    } else timeSlot.push(undefined);
  }
  return timeSlot;
};

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
