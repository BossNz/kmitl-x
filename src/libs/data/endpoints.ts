// Central list of registrar URLs. Paths are built from the current origin so
// the extension works on whichever reg.kmitl.ac.th host the user is on.

function base(): string {
  return location.origin;
}

export const endpoints = {
  studentProfile: (): string => `${base()}/u_officer/student.php`,
  langSwitch: (): string => `${base()}/index/lang.php`,
  home: (): string => base(),

  // Registrar JSON API on a sibling subdomain.
  currentYearSemester: (levelId = 1): string =>
    `https://regis.reg.kmitl.ac.th/api/?function=get-year-semester-now&level_id=${levelId}`,
};
