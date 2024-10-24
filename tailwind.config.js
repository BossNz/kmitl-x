/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{svelte,js,ts,jsx,tsx}"],
  darkMode: "class",
  env: { node: true },
  theme: {
    extend: {
      fontFamily: {
        prompt: ["Prompt", "sans-serif"],
      },
    },
  },
  plugins: [require("@xpd/tailwind-3dtransforms")],
  safelist: process.env.NODE_ENV === "development" ? [{ pattern: /./ }] : [],
};
