import { Primitives } from "./src/libs/styles/design-tokens";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{svelte,js,ts,jsx,tsx}"],
  darkMode: "class",
  env: { node: true },
  theme: {
    extend: {
      colors: {
        primary: Primitives.colors.orange,
        gray: Primitives.colors.slate,
      },
      fontFamily: {
        prompt: ["Prompt", "sans-serif"],
      },
    },
  },
};
