// The portal caches its menu here so the command palette can offer it on every
// page, not just the portal.
export interface MenuLink {
  label: string;
  url: string;
}

const MENU_KEY = "kmitlx:menu";

export function saveMenu(links: MenuLink[]): void {
  try {
    localStorage.setItem(MENU_KEY, JSON.stringify(links));
  } catch {
    // localStorage may be unavailable; the palette just has no entries.
  }
}

export function loadMenu(): MenuLink[] {
  try {
    const raw = localStorage.getItem(MENU_KEY);
    if (raw) return JSON.parse(raw) as MenuLink[];
  } catch {
    // ignore malformed or unavailable storage
  }
  return [];
}
