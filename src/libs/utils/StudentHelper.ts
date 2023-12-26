import type { ScheduleI } from "./StudentScraping";

export const createTimeSlot = (schedule: ScheduleI[], day: string = "อ.") => {
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
      const cols = calculateNumberOfCols(
        findTime.time.start,
        findTime.time.end,
        timeInterval
      );
      i += cols - 1;
      timeSlot.push({ ...findTime, cols });
    } else timeSlot.push(undefined);
  }
  return timeSlot;
};

function calculateNumberOfCols(
  startTime: string,
  endTime: string,
  intervalMinutes: number
) {
  const startMinutes = convertToMinutes(startTime);
  const endMinutes = convertToMinutes(endTime);

  const numberOfCols = (endMinutes - startMinutes) / intervalMinutes;

  return numberOfCols;
}

function convertToMinutes(time: string) {
  const [hours, minutes] = time.split(":");
  return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
}
