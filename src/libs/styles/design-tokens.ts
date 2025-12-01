import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper to merge Tailwind classes and handle conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// =========================================
// PRIMITIVES (Raw Values)
// Useful for JS-based logic (e.g., Canvas, Charts)
// =========================================
export const Primitives = {
  colors: {
    orange: {
      50: "#fff7ed",
      100: "#ffedd5",
      200: "#fed7aa",
      300: "#fdba74",
      400: "#fb923c",
      500: "#f97316", // Brand Base
      600: "#ea580c", // Text / Interactive
      700: "#c2410c",
      800: "#9a3412",
      900: "#7c2d12",
      950: "#431407",
    },
    amber: {
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
    },
    slate: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1e293b",
      900: "#0f172a",
      950: "#020617",
    },
  },
} as const;

// =========================================
// SEMANTIC TOKENS (JS Reference)
// =========================================
export const DesignTokens = {
  colors: {
    primary: Primitives.colors.orange,
    secondary: Primitives.colors.amber,
    neutral: Primitives.colors.slate,
    state: {
      success: { light: "#22c55e", dark: "#4ade80" },
      warning: { light: "#f59e0b", dark: "#fbbf24" },
      error: { light: "#ef4444", dark: "#f87171" },
      info: { light: "#3b82f6", dark: "#60a5fa" },
    },
  },
} as const;

// =========================================
// SHARED STYLES (Internal Use)
// =========================================
const Bases = {
  glass:
    "backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-white/10 shadow-sm",
  glassHigh:
    "backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-white/10 shadow-md",
  transition: "transition-all duration-200 ease-out",
  focusRing:
    "focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500",
  alertBase:
    "flex items-start gap-3 p-4 backdrop-blur-sm border rounded-xl text-sm shadow-sm",
};

// =========================================
// UTILITY CLASSES (Component Styles)
// =========================================
export const UtilityClasses = {
  // Layout & Containers
  card: {
    base: cn(
      Bases.glass,
      "rounded-2xl p-6",
      "shadow-orange-500/5 dark:shadow-black/40"
    ),
    interactive: cn(
      Bases.glass,
      Bases.transition,
      "rounded-2xl p-6 cursor-pointer",
      "hover:shadow-lg hover:shadow-orange-500/10 dark:hover:shadow-black/50",
      "hover:-translate-y-0.5 active:translate-y-0"
    ),
    header: cn(
      Bases.glassHigh,
      "rounded-xl p-4 border-b border-orange-100/50 dark:border-orange-900/20"
    ),
  },

  // Global Headers
  header: {
    gradient:
      "bg-gradient-to-r from-orange-500/95 to-amber-500/95 backdrop-blur-sm text-white shadow-sm",
    gradientSubtle:
      "bg-gradient-to-r from-orange-50/90 to-amber-50/90 dark:from-orange-900/30 dark:to-amber-900/30 backdrop-blur-sm text-orange-900 dark:text-orange-100 border-b border-orange-200/60 dark:border-orange-800/50",
  },

  // Buttons
  button: {
    base: cn(
      "inline-flex items-center justify-center gap-2",
      "rounded-lg font-prompt font-medium text-sm",
      Bases.transition,
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
    ),
    primary: cn(
      "bg-orange-600 text-white shadow-md shadow-orange-500/20",
      "hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-500/30",
      "active:bg-orange-700 active:shadow-sm"
    ),
    secondary: cn(
      Bases.glass,
      "text-slate-700 dark:text-slate-200",
      "hover:bg-white/90 dark:hover:bg-slate-800/80",
      "border-slate-200/60 dark:border-slate-700/50"
    ),
    ghost: cn(
      "bg-transparent text-slate-600 dark:text-slate-300",
      "hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-300"
    ),
    sizes: {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2.5",
      lg: "px-6 py-3 text-base",
      icon: "w-10 h-10 p-0 rounded-xl shrink-0",
    },
  },

  // Typography
  text: {
    h1: "font-prompt text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight",
    h2: "font-prompt text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight",
    h3: "font-prompt text-xl font-semibold text-slate-800 dark:text-slate-100",
    body: "font-prompt text-base text-slate-600 dark:text-slate-300 leading-relaxed",
    caption: "font-prompt text-xs text-slate-500 dark:text-slate-400",
    gradient:
      "bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500 font-bold",
  },

  // Badges / Tags
  badge: {
    base: "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap",
    primary:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800/30",
    success:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800/30",
    glass: cn(
      Bases.glass,
      "text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full border-slate-200 dark:border-slate-700"
    ),
  },

  // Form Inputs
  input: {
    wrapper: "relative w-full",
    base: cn(
      "w-full px-4 py-2.5 rounded-xl font-prompt text-sm",
      "bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm",
      "border border-slate-200 dark:border-slate-700",
      "text-slate-900 dark:text-white placeholder:text-slate-400",
      Bases.transition,
      Bases.focusRing,
      "hover:border-orange-300 dark:hover:border-orange-700/50"
    ),
    error: "border-red-500 focus:ring-red-500/30 focus:border-red-500 pr-10",
    label:
      "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5",
  },

  // Data Tables
  table: {
    container:
      "w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white/50 dark:bg-slate-900/50",
    root: "w-full text-left text-sm border-collapse",
    thead:
      "bg-orange-50/50 dark:bg-orange-900/10 backdrop-blur-sm border-b border-orange-100 dark:border-orange-900/20",
    th: "h-10 px-4 text-left align-middle font-medium text-orange-900 dark:text-orange-100 whitespace-nowrap",
    tbody: "[&_tr:last-child]:border-0",
    tr: "border-b border-slate-100 dark:border-slate-800 transition-colors hover:bg-orange-50/30 dark:hover:bg-orange-900/10",
    td: "p-4 align-middle text-slate-700 dark:text-slate-300",
    caption: "mt-4 text-sm text-slate-500 dark:text-slate-400 text-center",
  },

  // Alerts / Callouts
  note: {
    info: cn(
      Bases.alertBase,
      "bg-blue-50/80 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800"
    ),
    warning: cn(
      Bases.alertBase,
      "bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800"
    ),
    success: cn(
      Bases.alertBase,
      "bg-green-50/80 dark:bg-green-950/30 text-green-900 dark:text-green-200 border-green-200 dark:border-green-800"
    ),
    error: cn(
      Bases.alertBase,
      "bg-red-50/80 dark:bg-red-950/30 text-red-900 dark:text-red-200 border-red-200 dark:border-red-800"
    ),
  },

  // Misc
  legend: {
    base: "flex items-center gap-2 px-3 py-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg border border-slate-200/60 dark:border-slate-700/50 text-xs font-medium text-slate-600 dark:text-slate-300",
    dot: "w-2 h-2 rounded-full",
  },
} as const;

export type DesignTokensType = typeof DesignTokens;
export type UtilityClassesType = typeof UtilityClasses;
