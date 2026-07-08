import { mount } from "svelte";
import tailwind from "../../assets/css/tailwind.css?inline";
import { getTheme } from "../utils/themeManager";
import CommandPalette from "../components/common/CommandPalette.svelte";

// Wait for DOM to be ready
export function onDOMReady(): Promise<void> {
  return new Promise((resolve) => {
    if (
      document.readyState === "interactive" ||
      document.readyState === "complete"
    ) {
      resolve();
    } else {
      document.addEventListener("DOMContentLoaded", () => resolve(), {
        once: true,
      });
    }
  });
}

// mounting ui
export async function mountUI(
  componentImport: any,
  target: HTMLElement,
  props: Record<string, any> = {}
): Promise<void> {
  // clear target
  target.innerHTML = "";

  // inject font styles (Google Fonts - Prompt)
  document.head.appendChild(
    Object.assign(document.createElement("link"), {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    })
  );
  document.head.appendChild(
    Object.assign(document.createElement("link"), {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    })
  );
  document.head.appendChild(
    Object.assign(document.createElement("link"), {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
    })
  );
  document.head.appendChild(
    Object.assign(document.createElement("link"), {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap",
    })
  );

  // create shadow root
  const shadowContainer = document.createElement("div");
  shadowContainer.id = "kmitlx-root";
  target.appendChild(shadowContainer);

  // attach shadow root
  const shadowRoot = shadowContainer.attachShadow({ mode: "open" });

  // inject tailwind styles
  const style = document.createElement("style");
  style.textContent = tailwind;
  shadowRoot.appendChild(style);

  const appRoot = document.createElement("div");

  let theme: string = getTheme();

  if (theme === "dark") appRoot.classList.add("dark");
  else if (theme === "light") appRoot.classList.add("light");

  shadowRoot.appendChild(appRoot);

  const onThemeChange = (ev: Event) => {
    try {
      const e = ev as CustomEvent<string>;
      const newTheme = e.detail;
      if (!appRoot) return;
      appRoot.classList.remove("light", "dark");
      if (newTheme === "dark") appRoot.classList.add("dark");
      else if (newTheme === "light") appRoot.classList.add("light");

      // persist to localStorage so future mounts respect it
      try {
        localStorage.setItem("kmitlx:theme", newTheme);
      } catch (e) {}
    } catch (e) {}
  };

  window.addEventListener(
    "kmitlx:theme-change",
    onThemeChange as EventListener
  );

  return new Promise((resolve) => {
    mount(componentImport.default, {
      target: appRoot,
      props,
    });
    // Global command palette (Ctrl-K) available on every reskinned page.
    mount(CommandPalette, { target: appRoot });
    resolve();
  });
}
