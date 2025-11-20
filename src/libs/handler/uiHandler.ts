import { mount } from "svelte";
import tailwind from "../../assets/css/tailwind.css?inline";

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

  return new Promise((resolve) => {
    mount(componentImport.default, {
      target: shadowRoot,
      props,
    });
    resolve();
  });
}
