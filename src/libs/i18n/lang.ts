import { apiClient } from "../data/client";
import { endpoints } from "../data/endpoints";

export type Lang = "th" | "en";

// The registrar language toggle points at the other language, so the value the
// portal scraper reads (the toggle target) is the opposite of the current page
// language. This returns the language the page is currently shown in.
export function detectLang(toggleTarget: string): Lang {
  const target = toggleTarget.toLowerCase();
  if (target.startsWith("en")) return "th";
  if (target.startsWith("th")) return "en";
  return "th";
}

// Switch the registrar session to the given language, then reload so the pages
// we scrape come back in that language.
export async function switchLanguage(target: string): Promise<void> {
  try {
    await apiClient.postForm(endpoints.langSwitch(), { lang: target });
  } finally {
    location.reload();
  }
}
