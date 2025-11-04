/** @type {import('tailwindcss').Config} */
import plugin3d from '@xpd/tailwind-3dtransforms';

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
  plugins: [
    plugin3d,
    // Custom scrollbar plugin
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
        },
        '.scrollbar-thumb-orange-300\\/50': {
          'scrollbar-color': 'rgb(253 186 116 / 0.5) transparent',
        },
        '.scrollbar-thumb-orange-500\\/30': {
          'scrollbar-color': 'rgb(249 115 22 / 0.3) transparent',
        },
        '.scrollbar-track-transparent': {
          'scrollbar-color': 'transparent transparent',
        },
        '.hover\\:scrollbar-thumb-orange-400\\/60:hover': {
          'scrollbar-color': 'rgb(251 146 60 / 0.6) transparent',
        },
        '.dark .dark\\:scrollbar-thumb-orange-500\\/30': {
          'scrollbar-color': 'rgb(249 115 22 / 0.3) transparent',
        },
        '.dark .dark\\:hover\\:scrollbar-thumb-orange-400\\/40:hover': {
          'scrollbar-color': 'rgb(251 146 60 / 0.4) transparent',
        },
        // Webkit scrollbar styles
        '.scrollbar-thin::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '.scrollbar-thin::-webkit-scrollbar-track': {
          background: 'transparent',
          'border-radius': '8px',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb': {
          background: 'rgb(253 186 116 / 0.5)',
          'border-radius': '8px',
          transition: 'background 0.2s',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb:hover': {
          background: 'rgb(251 146 60 / 0.6)',
        },
        '.dark .scrollbar-thin::-webkit-scrollbar-thumb': {
          background: 'rgb(249 115 22 / 0.3)',
        },
        '.dark .scrollbar-thin::-webkit-scrollbar-thumb:hover': {
          background: 'rgb(251 146 60 / 0.4)',
        },
      })
    },
  ],
  safelist: process.env.NODE_ENV === "development" ? [{ pattern: /./ }] : [],
};
