import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import { cached } from "./cache";

export interface YearSemester {
  YEAR: string;
  SEMESTER: string;
  START_DATETIME_SYSTEM: string;
  START_DATETIME_ACADEMIC: string;
  END_DATETIME_ACADEMIC: string;
}

const YEAR_SEMESTER_TTL_MS = 5 * 60 * 1000;

// Current academic year and semester from the registrar API. Cached for a few
// minutes and persisted so navigating between pages does not refetch it.
export function getCurrentYearSemester(levelId = 1): Promise<YearSemester> {
  return cached(
    `regis:year-semester:${levelId}`,
    YEAR_SEMESTER_TTL_MS,
    () => apiClient.fetchJson<YearSemester>(endpoints.currentYearSemester(levelId)),
    { persist: true }
  );
}
