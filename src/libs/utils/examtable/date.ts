export function parseExamDateToDate(
  day: string,
  month: string,
  year: string
): Date | null {
  try {
    const monthMapThai: Record<string, number> = {
      "ม.ค.": 0,
      "ก.พ.": 1,
      "มี.ค.": 2,
      "เม.ย.": 3,
      "พ.ค.": 4,
      "มิ.ย.": 5,
      "ก.ค.": 6,
      "ส.ค.": 7,
      "ก.ย.": 8,
      "ต.ค.": 9,
      "พ.ย.": 10,
      "ธ.ค.": 11,
    };
    const monthMapEng: Record<string, number> = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };
    const monthIndex = monthMapThai[month] ?? monthMapEng[month];
    if (monthIndex === undefined) return null;

    return new Date(parseInt(year), monthIndex, parseInt(day));
  } catch {
    return null;
  }
}

export function calculateDateDifference(date1: Date, date2: Date): number {
  const diffTime = date2.getTime() - date1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function parseDateInfo(
  raw: string,
  today: Date,
  date: Date | null
): { fullDate: string; daysUntil: number } {
  if (raw === "อื่นๆ") {
    return { fullDate: "ไม่ระบุวันที่", daysUntil: 999 };
  }

  if (raw === "จัดสอบเอง") {
    return { fullDate: "จัดสอบเอง", daysUntil: 999 };
  }

  if (!date) {
    return { fullDate: "ไม่ระบุวันที่", daysUntil: 999 };
  }

  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  const fullDate = `${date?.getDate() || ""} ${thaiMonths[date?.getMonth() || 0]} ${date ? date.getFullYear() + 543 : ""}`;

  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return { fullDate, daysUntil: calculateDateDifference(todayStart, date) };
}

export function getDayName(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("th-TH", { weekday: "long" }).format(date);
}

export function getDaysText(days: number): string {
  if (days >= 999) return "ไม่ระบุวันที่";
  if (days < 0) return "สอบไปแล้ว";
  if (days === 0) return "สอบวันนี้!";
  if (days === 1) return "สอบพรุ่งนี้";
  return `อีก ${days} วัน`;
}

export function getDaysColor(days: number): string {
  if (days >= 999) return "text-gray-600";
  if (days < 0) return "text-gray-400";
  if (days === 0) return "text-red-500";
  if (days === 1) return "text-orange-500";
  if (days <= 3) return "text-yellow-500";
  if (days <= 7) return "text-blue-500";
  return "text-green-500";
}
