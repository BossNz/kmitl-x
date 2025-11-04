import { mount } from "svelte";
import PortalScraping from "../libs/utils/PortalScraping";
import Portal from "../pages/Portal.svelte";

const createLoadingOverlay = (): (() => void) => {
  try {
    // Root container attached to <html> so it exists even if <body> is not yet parsed
    const root = document.createElement("div");
    root.id = "kmitlx-loading-root";

    // Use shadow DOM to isolate styles from the host page
    const shadow = root.attachShadow({ mode: "open" });

    const THEME_KEY = "theme";

    // safely read theme from localStorage
    let theme: "light" | "dark" = "dark";
    try {
      const v = localStorage.getItem(THEME_KEY);
      if (v === "light" || v === "dark") theme = v;
    } catch (e) {
      theme = "dark";
    }

    const getColors = (t: "light" | "dark") =>
      t === "light"
        ? {
            bg: "#f9fafb",
            text: "#030712",
            accent: "#fb923c",
            accentTop: "#fff7ed",
          }
        : {
            bg: "#111827",
            text: "white",
            accent: "#f97316",
            accentTop: "#fff7ed",
          };

    const c = getColors(theme);

    shadow.innerHTML = `
        <style>
            :host { all: initial; }
            .overlay {
                position: fixed;
                inset: 0;
                display: flex;
                flex-direction: column;
                gap: 16px;
                align-items: center;
                justify-content: center;
                background: ${c.bg};
                color: ${c.text};
                font-family: sans-serif, system-ui;
                z-index: 2147483646;
            }
            .spinner {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                display: inline-block;
                border: 6px solid ${c.accent};
                border-top-color: ${c.accentTop};
                animation: spin 1s linear infinite;
            }
            .kmitlx {
                font-weight: bold;
                font-size: 24px;
            }
            .x {
                color: ${c.accent};
            }
            @keyframes spin { to { transform: rotate(360deg); } }
        </style>
        <div class="overlay" aria-hidden="true">
            <div class="spinner" role="status" aria-label="loading"></div>
            <div><span class="kmitlx k">KMITL</span> <span class="kmitlx x">X</span></div>
        </div>
    `;

    document.documentElement.appendChild(root);

    return () => {
      try {
        root.remove();
      } catch (e) {}
    };
  } catch (error) {
    // If anything fails (very unlikely), return noop remover
    return () => {};
  }
};

// Show overlay immediately; remove later after mount/ready
const removeLoading = createLoadingOverlay();

const PORTAL_MODE_KEY = "kmitlx:portal:view";

const isPortalPage = window.location.pathname.includes("/u_student/index.php");

const mode = isPortalPage ? sessionStorage.getItem(PORTAL_MODE_KEY) : null;
const isOriginalMode = mode === "original";

if (!isOriginalMode) {
  import("../assets/css/tailwind.css");
}

const ensureFontLoaded = () => {
  if (document.querySelector("style[data-kmitlx-font=true]")) return;
  const font = document.createElement("style");
  font.dataset.kmitlxFont = "true";
  font.innerHTML =
    "@import url('https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');";
  // head may not be available at document_start in some cases; guard it
  if (document.head) {
    document.head.appendChild(font);
  } else {
    document.addEventListener(
      "DOMContentLoaded",
      () => document.head && document.head.appendChild(font),
      { once: true }
    );
  }
};

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
    // Remove loading overlay since we are not changing anything
    try {
      requestAnimationFrame(() => removeLoading());
    } catch (e) {
      removeLoading();
    }
  } else {
    sessionStorage.setItem(PORTAL_MODE_KEY, "new");
    ensureFontLoaded();

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

      // Remove loading overlay after the new UI has been mounted and painted
      try {
        requestAnimationFrame(() => removeLoading());
      } catch (e) {
        removeLoading();
      }
    };

    if (document.body) mountPortal();
    else
      document.addEventListener("DOMContentLoaded", mountPortal, {
        once: true,
      });
  }
}
