import type { ScheduleI } from "../types";

const downloadBlob = (blob: Blob, name = "file.txt") => {
  if ((window.navigator as any) && (window.navigator as any).msSaveOrOpenBlob)
    return (window.navigator as any).msSaveOrOpenBlob(blob);
  const data = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = data;
  link.download = name;

  link.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  );

  setTimeout(() => {
    window.URL.revokeObjectURL(data);
    link.remove();
  }, 100);
};
const createTimeSlot = (
  schedule: ScheduleI[],
  day: string = "จ.",
  startHour: number = 8,
  endHour: number = 19,
  timeInterval: number = 15
): Array<undefined | (ScheduleI & { colSpan: number })> => {
  const timeSlot: Array<undefined | (ScheduleI & { colSpan: number })> = [];
  const findDay = schedule.filter((item) => item.time.day == day);
  const startTime = startHour * 60;
  if (startHour >= endHour) return timeSlot;

  const colSlot = Math.ceil(((endHour - startHour) * 60) / timeInterval);
  const used = new Set<number>();

  for (let i = 0; i < colSlot; i++) {
    const slotStart = startTime + i * timeInterval;
    const slotEnd = slotStart + timeInterval;

    let foundIndex = -1;
    for (let idx = 0; idx < findDay.length; idx++) {
      if (used.has(idx)) continue;
      const item = findDay[idx];
      const s = convertToMinutes(item.time.start);
      const e = convertToMinutes(item.time.end);
      
      if (e > slotStart && s < slotEnd) {
        foundIndex = idx;
        break;
      }
    }

    if (foundIndex === -1) {
      timeSlot.push(undefined);
      continue;
    }

    const item = findDay[foundIndex];
    const s = convertToMinutes(item.time.start);
    const e = convertToMinutes(item.time.end);

    const effectiveStart = Math.max(s, slotStart);
    const remainingMinutes = Math.max(0, e - effectiveStart);
    let colSpan = Math.ceil(remainingMinutes / timeInterval);
    
    colSpan = Math.min(colSpan, colSlot - i);

    used.add(foundIndex);
    timeSlot.push({ ...item, colSpan });
    i += colSpan - 1;
  }
  return timeSlot;
};

const convertToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":");
  return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
};

export { downloadBlob, createTimeSlot };
