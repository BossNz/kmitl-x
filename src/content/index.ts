import { mount } from "svelte";
import StudentTable from "../pages/StudentTable.svelte";
import Portal from "../pages/Portal.svelte";
import ScheduleTableScraping from "../libs/utils/ScheduleTableScraping";
import PortalScraping from "../libs/utils/PortalScraping";
import { originalTable } from "../stores/ScheduleTable";

const PORTAL_MODE_KEY = "kmitlx:portal:view";

const isPortalPage =
  window.location.pathname.includes("/u_student/index.php") &&
  !window.location.pathname.includes("report_studytable_show.php");
const isSchedulePage = window.location.pathname.includes(
  "report_studytable_show.php"
);

// Check if in original mode FIRST
const mode = isPortalPage ? sessionStorage.getItem(PORTAL_MODE_KEY) : null;
const isOriginalMode = mode === "original";

// Only import CSS if NOT in original mode
if (!isOriginalMode) {
  // Import Tailwind CSS for new UI and schedule page
  import("../assets/css/tailwind.css");
}

const ensureFontLoaded = () => {
  if (document.querySelector("style[data-kmitlx-font=true]")) return;
  const font = document.createElement("style");
  font.dataset.kmitlxFont = "true";
  font.innerHTML =
    "@import url('https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');";
  document.head.appendChild(font);
};

const enableTheme = () => {
  if (!document.documentElement.classList.contains("dark")) {
    document.documentElement.classList.add("dark");
  }
};

const injectPortalOriginalButton = () => {
  if (document.querySelector("#kmitlx-original-toggle")) return;
  
  // Remove all Tailwind CSS and custom styles from the page
  const removeStyles = () => {
    // Remove all <style> tags that contain Tailwind or custom CSS from extension
    document.querySelectorAll('style').forEach(style => {
      const content = style.textContent || '';
      // Only remove if it's from our extension
      if (content.includes('tailwind') || 
          content.includes('@layer') ||
          content.includes('font-prompt') ||
          (content.includes('Prompt') && content.includes('@import'))) {
        style.remove();
      }
    });
    
    // Don't remove any <link> tags - they're from original site
    // Only remove if we add them (which we don't in original mode)
  };
  
  // Remove styles immediately
  removeStyles();
  
  // Use MutationObserver to remove any dynamically added styles from extension only
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'STYLE') {
          const element = node as HTMLElement;
          const content = element.textContent || '';
          // Only remove our extension's styles
          if (content.includes('tailwind') || 
              content.includes('@layer') ||
              (content.includes('Prompt') && content.includes('@import'))) {
            element.remove();
          }
        }
      });
    });
  });
  
  observer.observe(document.head, {
    childList: true,
    subtree: true
  });
  
  const button = document.createElement("button");
  button.id = "kmitlx-original-toggle";
  button.type = "button";
  button.textContent = "NEW VERSION";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.left = "20px";
  button.style.zIndex = "2147483647";
  button.style.padding = "12px 24px";
  button.style.borderRadius = "9999px";
  button.style.border = "none";
  button.style.background = "linear-gradient(135deg, #f97316 0%, #ea580c 100%)";
  button.style.color = "#ffffff";
  button.style.fontFamily = "Prompt, sans-serif";
  button.style.fontSize = "14px";
  button.style.fontWeight = "600";
  button.style.letterSpacing = "0.03em";
  button.style.boxShadow = "0 20px 40px rgba(249, 115, 22, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)";
  button.style.cursor = "pointer";
  button.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  button.addEventListener("mouseenter", () => {
    button.style.transform = "translateY(-3px) scale(1.05)";
    button.style.boxShadow = "0 25px 50px rgba(249, 115, 22, 0.5), 0 8px 16px rgba(0, 0, 0, 0.25)";
  });
  button.addEventListener("mouseleave", () => {
    button.style.transform = "translateY(0) scale(1)";
    button.style.boxShadow = "0 20px 40px rgba(249, 115, 22, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)";
  });
  button.addEventListener("click", () => {
    sessionStorage.removeItem(PORTAL_MODE_KEY);
    // Instead of reload, navigate back to portal index
    window.location.href = window.location.pathname;
  });
  document.body.appendChild(button);
};

if (isPortalPage) {
  if (isOriginalMode) {
    // Original mode: just inject button, don't touch anything else
    injectPortalOriginalButton();
  } else {
    ensureFontLoaded();
    enableTheme();
    sessionStorage.setItem(PORTAL_MODE_KEY, "new");

    const scraping = new PortalScraping(document, window.location.href);
    const portalData = scraping.getPortalDataset();

    document.body.innerHTML = "";

    mount(Portal, {
      target: document.body,
      props: {
        sections: portalData.sections,
        portalMeta: portalData.meta,
        originalModeKey: PORTAL_MODE_KEY,
      },
    });
  }
} else if (isSchedulePage) {
  ensureFontLoaded();
  enableTheme();

  const scheduleTable = document.querySelector("table") as HTMLTableElement;
  const scrapingData = new ScheduleTableScraping(scheduleTable);

  originalTable.set(document.body.innerHTML);
  document.body.innerHTML = "";

  mount(StudentTable, {
    target: document.body,
    props: {
      schedule: scrapingData.getSchedule(),
      information: scrapingData.getStudent(),
    },
  });
}
