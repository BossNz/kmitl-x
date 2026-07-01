import { th } from "./th";
import { en } from "./en";
import type { Lang } from "./lang";

export type TranslationKey = keyof typeof th;

const catalogs: Record<Lang, Record<TranslationKey, string>> = { th, en };

// Translate a key into the given language. Unknown keys fall back to Thai and
// then to the key itself. Variables replace {name} style placeholders.
export function t(
  key: TranslationKey,
  lang: Lang,
  vars?: Record<string, string | number>
): string {
  let str: string = catalogs[lang]?.[key] ?? th[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      str = str.split(`{${name}}`).join(String(value));
    }
  }
  return str;
}

export * from "./lang";
export * from "./fieldMap";
