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
      keyframes: {
        "slide-in": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "slide-in": "slide-in 0.2s ease-out",
      },
    },
  },
};
