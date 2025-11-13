// Centralized font injector for KMITL X content scripts
// Runs at document_start. Preconnects and preloads Google Fonts stylesheet,
// and sets a class on <html> when font loading completes so pages can apply
// the Prompt font only after it's available to reduce flashes.

const GOOGLE_CSS =
  "https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap";

function appendToHead(el: HTMLElement) {
  if (document.head) document.head.appendChild(el);
  else
    document.addEventListener(
      "DOMContentLoaded",
      () => document.head && document.head.appendChild(el),
      { once: true }
    );
}

// Avoid injecting multiple times
if (!document.querySelector("link[data-kmitlx-font]") && !document.querySelector("style[data-kmitlx-font]")) {
  // Preconnect to Google Fonts domains
  const p1 = document.createElement("link");
  p1.rel = "preconnect";
  p1.href = "https://fonts.googleapis.com";
  p1.dataset.kmitlxFont = "true";
  appendToHead(p1);

  const p2 = document.createElement("link");
  p2.rel = "preconnect";
  p2.href = "https://fonts.gstatic.com";
  p2.crossOrigin = "anonymous";
  p2.dataset.kmitlxFont = "true";
  appendToHead(p2);

  // Preload stylesheet (non-blocking) and swap to stylesheet onload
  const preloadCss = document.createElement("link");
  preloadCss.rel = "preload";
  preloadCss.as = "style";
  preloadCss.href = GOOGLE_CSS;
  preloadCss.dataset.kmitlxFont = "true";
  preloadCss.onload = function () {
    (this as HTMLLinkElement).rel = "stylesheet";
  };
  preloadCss.onerror = function () {
    // fallback: directly append stylesheet
    const s = document.createElement("link");
    s.rel = "stylesheet";
    s.href = GOOGLE_CSS;
    s.dataset.kmitlxFont = "true";
    appendToHead(s);
  };
  appendToHead(preloadCss);

  // noscript fallback
  const nos = document.createElement("noscript");
  nos.dataset.kmitlxFont = "true";
  nos.innerHTML = `<link href="${GOOGLE_CSS}" rel="stylesheet">`;
  appendToHead(nos);

}
