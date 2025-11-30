import type { ExamObject } from "../../types/report-examtable.types";

export function formatLocation(venue: ExamObject["venue"]) {
  if (!venue) return "-";
  const { building, room, seat, raw } = venue as any;
  if (!building && !room && !seat) return raw || "-";

  const parts: string[] = [];
  if (building) parts.push(`อาคาร ${building}`);
  if (room) parts.push(`ห้อง ${room}`);
  if (seat) parts.push(`ที่นั่ง ${seat}`);
  return parts.length > 0 ? parts.join(" · ") : raw || "-";
}
