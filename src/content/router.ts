export function getCurrentRoute() {
  const url = window.location.pathname;

  if (url.includes("/u_student/index.php")) return { name: "portal", url: "index.php" };

  return { name: "unknown", url };
}
