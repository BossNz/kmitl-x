import { mount } from "svelte";

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
  document.body.innerHTML = "";
  return new Promise((resolve) => {
    mount(componentImport.default, {
      target,
      props,
    });
    resolve();
  });
}
