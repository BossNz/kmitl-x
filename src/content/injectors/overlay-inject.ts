// Centralized loading overlay injected at document_start for all portal pages.
// Listens for window.postMessage({ type: 'kmitlx:app-ready' }) to remove overlay.

const createOverlay = () => {
  try {
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

    return root;
  } catch (e) {
    return null;
  }
};

const removeOverlay = (root: HTMLElement | null) => {
  if (!root) return;
  try { root.remove(); } catch (e) {}
};

const overlayRoot = createOverlay();

// Remove overlay when we receive app-ready message AND fonts are ready (or timeout)
const waitForFonts = () => {
  if ((document as any).fonts && (document as any).fonts.ready) {
    return (document as any).fonts.ready;
  }
  return Promise.resolve();
};

let cleared = false;
const clearNow = () => {
  if (cleared) return;
  cleared = true;
  // allow one paint
  requestAnimationFrame(() => removeOverlay(overlayRoot));
};

// Listen for app readiness from the page (Svelte app should post this)
const onMessage = (e: MessageEvent) => {
  // Only accept messages from same window context
  if (e.source !== window) return;
  const data = e.data || {};
  if (data && data.type === 'kmitlx:app-ready') {
    // Wait for fonts to be ready to avoid flash, but don't wait forever
    Promise.race([waitForFonts(), new Promise((r) => setTimeout(r, 2500))])
      .then(() => clearNow())
      .catch(() => clearNow());
  }
};

window.addEventListener('message', onMessage, false);

// Safety: remove overlay after a maximum timeout even if no message arrives
const MAX_TIMEOUT = 6000;
setTimeout(() => clearNow(), MAX_TIMEOUT);
