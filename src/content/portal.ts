import { mount } from "svelte";
import "../assets/css/tailwind.css";
import PortalScraping from "../libs/utils/PortalScraping";
import Portal from "../pages/Portal.svelte";

const PORTAL_MODE_KEY = "kmitlx:portal:view";

const isPortalPage = window.location.pathname.includes("/u_student/index.php");

const mode = isPortalPage ? sessionStorage.getItem(PORTAL_MODE_KEY) : null;
const isOriginalMode = mode === "original";

const newVersionButton = () => {
  if (document.querySelector("#kmitlx-original-toggle")) return;
  
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
  button.style.boxShadow =
    "0 20px 40px rgba(249, 115, 22, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)";
  button.style.cursor = "pointer";
  button.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

  const style = document.createElement("style");
  style.textContent = 
    `
        @keyframes kmitlx-bounce {
        0%,
        100% {
            transform: translateY(0);
        }
        20%,
        80% {
            transform: translateY(-8px);
        }
        40%,
        60% {
            transform: translateY(-4px);
        }
        }
        .kmitlx-attention {
        animation: kmitlx-bounce 1.5s infinite;
        }
    `;
  document.head.appendChild(style);

  button.classList.add("kmitlx-attention");

  button.addEventListener("mouseenter", () => {
    button.style.transform = "translateY(-3px) scale(1.05)";
    button.style.boxShadow =
      "0 25px 50px rgba(249, 115, 22, 0.5), 0 8px 16px rgba(0, 0, 0, 0.25)";
  });
  button.addEventListener("mouseleave", () => {
    button.style.transform = "translateY(0) scale(1)";
    button.style.boxShadow =
      "0 20px 40px rgba(249, 115, 22, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)";
  });
  button.addEventListener("click", () => {
    sessionStorage.removeItem(PORTAL_MODE_KEY);
    // Instead of reload, navigate back to portal index
    window.location.href = window.location.pathname;
  });

  const appendButton = () => {
    if (document.body && !document.querySelector("#kmitlx-original-toggle")) {
      document.body.appendChild(button);
    }
  };

  if (document.body) appendButton();
  else
    document.addEventListener("DOMContentLoaded", appendButton, { once: true });
};

if (isPortalPage) {
  if (isOriginalMode) {
    // Original mode: just inject button, don't touch anything else
    newVersionButton();
    // Notify centralized overlay that app is ready
    try {
      window.postMessage({ type: 'kmitlx:app-ready' }, '*');
    } catch (e) {}
  } else {
    sessionStorage.setItem(PORTAL_MODE_KEY, "new");
    // Wait for body/DOM to be ready before scraping and replacing content
    const mountPortal = () => {
      const scraping = new PortalScraping(document, window.location.href);
      const portalData = scraping.getPortalDataset();

      // If body isn't present, skip (shouldn't happen because we waited)
      if (!document.body) return;

      document.body.innerHTML = "";

      mount(Portal, {
        target: document.body,
        props: {
          sections: portalData.sections,
          portalMeta: portalData.meta,
          originalModeKey: PORTAL_MODE_KEY,
        },
      });

      // signal app readiness to centralized overlay
      try {
        window.postMessage({ type: 'kmitlx:app-ready' }, '*');
      } catch (e) {}
    };

    if (document.body) mountPortal();
    else
      document.addEventListener("DOMContentLoaded", mountPortal, {
        once: true,
      });
  }
}
