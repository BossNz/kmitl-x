export const DesignTokens = {
  // ===== COLORS =====
  colors: {
    // Primary - Orange Accent
    primary: {
      50: '#fff7ed',   // ใช้สำหรับ background ที่อ่อนมาก
      100: '#ffedd5',  // ใช้สำหรับ hover states
      200: '#fed7aa',  // ใช้สำหรับ border, divider
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',  // Main primary color
      600: '#ea580c',  // ใช้สำหรับ hover, active
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    
    // Secondary - Amber for gradients
    secondary: {
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
    },
    
    // Neutral - Gray scale (NOT Zinc!)
    neutral: {
      50: '#f9fafb',   // gray-50
      100: '#f3f4f6',  // gray-100
      200: '#e5e7eb',  // gray-200
      300: '#d1d5db',  // gray-300
      400: '#9ca3af',  // gray-400
      500: '#6b7280',  // gray-500
      600: '#4b5563',  // gray-600
      700: '#374151',  // gray-700
      800: '#1f2937',  // gray-800
      900: '#111827',  // gray-900
      950: '#030712',  // gray-950
    },
    
    // Semantic Colors
    success: {
      light: '#22c55e',
      dark: '#4ade80',
    },
    warning: {
      light: '#f59e0b',
      dark: '#fbbf24',
    },
    error: {
      light: '#ef4444',
      dark: '#f87171',
    },
    info: {
      light: '#3b82f6',
      dark: '#60a5fa',
    },
  },

  // ===== GLASS MORPHISM =====
  glass: {
    // Background opacities
    bg: {
      light: '90',      // bg-white/90
      medium: '80',     // bg-white/80
      heavy: '95',      // bg-white/95
      card: '90',       // standard card background
      hover: '70',      // hover states
    },
    bgDark: {
      light: '80',      // dark:bg-gray-800/80
      medium: '70',     // dark:bg-gray-800/70
      heavy: '90',      // dark:bg-gray-800/90
      card: '80',       // standard card background
      hover: '60',      // hover states
    },
    // Border opacities
    border: {
      light: '60',      // border-gray-200/60
      dark: '50',       // dark:border-gray-700/50
    },
    // Shadow opacities
    shadow: {
      base: '25',       // shadow-orange-500/25
      hover: '30',      // shadow-orange-500/30
    },
    // Blur effects
    blur: 'backdrop-blur-sm',
  },

  // ===== TYPOGRAPHY =====
  typography: {
    fontFamily: {
      base: "'Prompt', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
    },
    
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
    
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
    },
  },

  // ===== SPACING =====
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
  },

  // ===== BORDERS =====
  borders: {
    width: {
      none: '0',
      thin: '1px',
      medium: '2px',
      thick: '4px',
    },
    radius: {
      none: '0',
      sm: '0.375rem',    // 6px
      md: '0.5rem',      // 8px
      lg: '0.75rem',     // 12px
      xl: '1rem',        // 16px (modern default)
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      full: '9999px',
    },
  },

  // ===== SHADOWS =====
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    // Glass morphism shadows with orange tint
    glassBase: '0 1px 2px 0 rgba(249, 115, 22, 0.25)',
    glassHover: '0 4px 6px -1px rgba(249, 115, 22, 0.30)',
  },

  // ===== COMPONENT STYLES (Glass Morphism) =====
  components: {
    // Card
    card: {
      bg: {
        light: 'rgba(255, 255, 255, 0.9)',    // bg-white/90
        dark: 'rgba(31, 41, 55, 0.8)',         // bg-gray-800/80
      },
      border: {
        light: 'rgba(229, 231, 235, 0.6)',     // border-gray-200/60
        dark: 'rgba(55, 65, 81, 0.5)',         // border-gray-700/50
      },
      shadow: '0 1px 2px 0 rgba(249, 115, 22, 0.25)',
      blur: 'backdrop-blur-sm',
      radius: '1rem',      // rounded-xl (16px)
      padding: '1.5rem',   // 24px
    },
    
    // Button
    button: {
      primary: {
        bg: 'rgba(249, 115, 22, 0.9)',         // bg-orange-500/90
        bgHover: 'rgba(234, 88, 12, 0.9)',     // bg-orange-600/90
        text: '#ffffff',
        shadow: '0 1px 2px 0 rgba(249, 115, 22, 0.25)',
        shadowHover: '0 4px 6px -1px rgba(249, 115, 22, 0.30)',
        blur: 'backdrop-blur-sm',
        radius: '0.75rem',   // rounded-lg (12px)
        paddingX: '1rem',    // 16px
        paddingY: '0.5rem',  // 8px
      },
      secondary: {
        bg: 'rgba(255, 255, 255, 0.8)',        // bg-white/80
        bgDark: 'rgba(55, 65, 81, 0.6)',       // dark:bg-gray-700/60
        bgHover: 'rgba(249, 250, 251, 0.7)',   // hover:bg-gray-50/70
        bgHoverDark: 'rgba(31, 41, 55, 0.7)',  // dark:hover:bg-gray-800/70
        text: '#f97316',
        border: {
          light: 'rgba(229, 231, 235, 0.6)',
          dark: 'rgba(55, 65, 81, 0.5)',
        },
        blur: 'backdrop-blur-sm',
        radius: '0.75rem',
        paddingX: '1rem',
        paddingY: '0.5rem',
      },
    },
    
    // Input
    input: {
      bg: {
        light: 'rgba(255, 255, 255, 0.9)',     // bg-white/90
        dark: 'rgba(55, 65, 81, 0.8)',         // bg-gray-700/80
      },
      border: {
        light: 'rgba(229, 231, 235, 0.6)',     // border-gray-200/60
        dark: 'rgba(55, 65, 81, 0.5)',         // border-gray-700/50
      },
      borderFocus: '#f97316',
      text: {
        light: 'rgb(17, 24, 39)',              // gray-900
        dark: 'rgb(255, 255, 255)',            // white
      },
      placeholder: {
        light: 'rgb(156, 163, 175)',           // gray-400
        dark: 'rgb(107, 114, 128)',            // gray-500
      },
      blur: 'backdrop-blur-sm',
      radius: '0.75rem',    // rounded-xl
      paddingX: '0.75rem',
      paddingY: '0.625rem',
    },
    
    // Table
    table: {
      bg: {
        light: 'rgba(255, 255, 255, 0.95)',    // bg-white/95
        dark: 'rgba(31, 41, 55, 0.9)',         // bg-gray-800/90
      },
      headerBg: {
        light: 'linear-gradient(to right, rgba(249, 115, 22, 0.95), rgba(245, 158, 11, 0.95))',
        dark: 'linear-gradient(to right, rgba(249, 115, 22, 0.95), rgba(245, 158, 11, 0.95))',
      },
      rowBg: {
        light: 'transparent',
        dark: 'transparent',
      },
      rowHoverBg: {
        light: 'rgba(249, 250, 251, 0.5)',     // hover:bg-gray-50/50
        dark: 'rgba(31, 41, 55, 0.5)',         // dark:hover:bg-gray-800/50
      },
      border: {
        light: 'rgba(229, 231, 235, 0.6)',
        dark: 'rgba(55, 65, 81, 0.5)',
      },
      blur: 'backdrop-blur-sm',
      cellPaddingX: '1.5rem',
      cellPaddingY: '0.75rem',
    },
    
    // Badge
    badge: {
      bg: {
        light: 'rgba(254, 215, 170, 0.8)',     // bg-orange-200/80
        dark: 'rgba(249, 115, 22, 0.2)',       // bg-orange-500/20
      },
      blur: 'backdrop-blur-sm',
      radius: '0.75rem',    // rounded-lg
      paddingX: '0.75rem',
      paddingY: '0.375rem',
      fontSize: '0.75rem',  // text-xs
      fontWeight: '600',
    },
  },
} as const;

// ===== UTILITY CLASSES (Tailwind-compatible with Glass Morphism) =====
export const UtilityClasses = {
  // Card variations (Glass Morphism)
  card: {
    base: 'bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm shadow-orange-500/25 border border-gray-200/60 dark:border-gray-700/50',
    hover: 'bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm shadow-orange-500/25 border border-gray-200/60 dark:border-gray-700/50 hover:shadow-md hover:shadow-orange-500/30 transition-all duration-200 cursor-pointer',
    bordered: 'bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border-2 border-orange-500/30 dark:border-orange-500/30',
    interactive: 'bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm shadow-orange-500/25 border border-gray-200/60 dark:border-gray-700/50 hover:shadow-md hover:shadow-orange-500/30 transition-all duration-200',
    table: 'bg-white/95 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-700/50',
  },
  
  // Header variations (Glass Morphism)
  header: {
    gradient: 'bg-gradient-to-r from-orange-500/95 to-amber-500/95 backdrop-blur-sm text-white',
    gradientSubtle: 'bg-gradient-to-r from-orange-50/90 to-amber-50/90 dark:from-orange-900/30 dark:to-amber-900/30 backdrop-blur-sm text-orange-900 dark:text-orange-100 border-b border-orange-200/60 dark:border-orange-800/50',
  },
  
  // Button variations (Glass Morphism)
  button: {
    primary: 'font-prompt inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500/90 hover:bg-orange-600/90 backdrop-blur-sm text-white hover:text-white rounded-lg font-medium transition-all duration-200 shadow-sm shadow-orange-500/25 hover:shadow-md hover:shadow-orange-500/30',
    primaryRounded: 'font-prompt inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white hover:text-white rounded-full font-semibold text-sm transition-all duration-200',
    secondary: 'font-prompt inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/80 dark:bg-gray-700/60 backdrop-blur-sm hover:bg-gray-50/70 dark:hover:bg-gray-800/70 text-gray-700 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200/60 dark:border-gray-700/50 rounded-lg font-medium transition-all duration-200',
    outline: 'font-prompt inline-flex items-center justify-center gap-2 px-4 py-2 border border-orange-400/70 text-orange-500 dark:text-orange-200 hover:text-orange-500 dark:hover:text-orange-200 hover:bg-orange-100/70 dark:hover:bg-orange-500/15 rounded-full font-semibold text-sm transition-all duration-200',
    ghost: 'font-prompt inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent hover:bg-gray-100/70 dark:hover:bg-gray-800/70 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg font-medium transition-all duration-200',
    icon: 'inline-flex items-center justify-center w-10 h-10 rounded-xl bg-orange-100/80 dark:bg-orange-900/40 backdrop-blur-sm text-orange-600 dark:text-orange-400 hover:bg-orange-200/80 dark:hover:bg-orange-800/50 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200',
  },
  
  // Text variations
  text: {
    heading1: 'text-2xl md:text-3xl font-bold text-gray-900 dark:text-white',
    heading2: 'text-xl md:text-2xl font-bold text-gray-900 dark:text-white',
    heading3: 'text-lg md:text-xl font-semibold text-gray-900 dark:text-white',
    body: 'text-base text-gray-700 dark:text-gray-300',
    bodySecondary: 'text-sm text-gray-600 dark:text-gray-400',
    caption: 'text-xs text-gray-600 dark:text-gray-400',
    label: 'text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide',
    labelOrange: 'text-xs font-medium text-orange-400 dark:text-orange-300 uppercase tracking-wide',
  },
  
  // Badge variations (Glass Morphism)
  badge: {
    default: 'inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-gray-200/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 font-medium text-xs',
    primary: 'inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-orange-200/80 dark:bg-orange-500/20 backdrop-blur-sm text-orange-700 dark:text-orange-300 font-semibold text-xs',
    orange: 'inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-orange-200/80 dark:bg-orange-500/20 backdrop-blur-sm text-orange-700 dark:text-orange-300 font-semibold text-xs',
    gray: 'inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-gray-200/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 font-medium text-xs',
    info: 'inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-blue-100/80 dark:bg-blue-900/30 backdrop-blur-sm text-blue-700 dark:text-blue-300 font-semibold text-xs',
    success: 'inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-green-100/80 dark:bg-green-900/30 backdrop-blur-sm text-green-700 dark:text-green-300 font-semibold text-xs',
    error: 'inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-red-100/80 dark:bg-red-900/30 backdrop-blur-sm text-red-700 dark:text-red-300 font-semibold text-xs',
    warning: 'inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-amber-100/80 dark:bg-amber-900/30 backdrop-blur-sm text-amber-700 dark:text-amber-300 font-semibold text-xs',
  },
  
  // Input variations (Glass Morphism)
  input: {
    base: 'w-full px-3 py-2.5 bg-white/90 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200',
    error: 'w-full px-3 py-2.5 bg-white/90 dark:bg-gray-700/80 backdrop-blur-sm border border-red-300/60 dark:border-red-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all duration-200',
    select: 'w-full px-3 py-2.5 bg-white/90 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 cursor-pointer',
  },
  
  // Table variations (Glass Morphism)
  table: {
    container: 'overflow-x-auto rounded-xl',
    base: 'w-full border-collapse',
    wrapper: 'bg-white/95 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-700/50 overflow-hidden',
    header: 'bg-gradient-to-r from-orange-500/95 to-amber-500/95 backdrop-blur-sm',
    headerCell: 'px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider',
    th: 'px-6 py-3 text-xs font-semibold text-white uppercase tracking-wider',
    body: 'divide-y divide-gray-200/60 dark:divide-gray-700/50',
    row: 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200',
    cell: 'px-6 py-4 text-sm text-gray-900 dark:text-white border-t border-gray-200/60 dark:border-gray-700/50',
    divider: 'divide-y divide-gray-200/60 dark:divide-gray-700/50',
  },
  
  // Note/Alert variations (Glass Morphism)
  note: {
    info: 'flex items-start gap-3 p-4 bg-orange-50/70 dark:bg-orange-900/20 backdrop-blur-sm border border-orange-200/60 dark:border-orange-500/30 rounded-xl',
    warning: 'flex items-start gap-3 p-4 bg-amber-50/70 dark:bg-amber-900/20 backdrop-blur-sm border border-amber-200/60 dark:border-amber-500/30 rounded-xl',
    success: 'flex items-start gap-3 p-4 bg-green-50/70 dark:bg-green-900/20 backdrop-blur-sm border border-green-200/60 dark:border-green-500/30 rounded-xl',
    error: 'flex items-start gap-3 p-4 bg-red-50/70 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/60 dark:border-red-500/30 rounded-xl',
  },
  
  // Legend variations (Glass Morphism)
  legend: {
    base: 'flex items-center gap-2 px-3 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg border border-gray-200/60 dark:border-gray-700/50 text-xs',
  },
} as const;

// Helper function to build class strings
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export type DesignTokensType = typeof DesignTokens;
export type UtilityClassesType = typeof UtilityClasses;
