/**
 * Normalize a year token from the exam table into a full Gregorian year string.
 *
 * The site sometimes gives a two digit year (for example "25") and sometimes a
 * full year (for example "2025"). Two digit years are treated as 20xx. Full
 * years are returned as is, so this keeps working past the year 2100.
 */
export function normalizeGregorianYear(raw: string | undefined): string {
  if (!raw) return "";
  const n = parseInt(raw, 10);
  if (isNaN(n)) return "";
  return (n >= 100 ? n : 2000 + n).toString();
}
