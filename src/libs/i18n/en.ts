import type { th } from "./th";

// Must provide every key that th provides.
export const en: Record<keyof typeof th, string> = {
  home: "Home",
  favorites: "Favorites",
  allMenu: "All menus",
  quickAccess: "Quick access",
  editFavorites: "Edit favorites",
  done: "Done",
  logout: "Log out",
  profile: "Profile",
  notifications: "Notifications",
  toggleTheme: "Toggle theme",
  toggleLanguage: "Switch language",
  welcome: "Welcome",
  greeting: "Hello, {name}",
  currentSemester: "Current semester",
  studentId: "Student ID",
  todaySchedule: "Today's schedule",
  cannotLoad: "Could not load data",
  registrarHome: "Registrar home",
  underMaintenance: "This page is under maintenance",
  unusedPage: "This page is no longer in use",
  backHome: "Back to home",
};
