/**
 * Design System Exports
 * Central export point for design tokens and utilities
 */

export { DesignTokens, UtilityClasses, cn } from './design-tokens';
export type { DesignTokensType, UtilityClassesType } from './design-tokens';

// Re-export for convenience
import { UtilityClasses } from './design-tokens';

/**
 * Quick access to utility classes
 * Usage: import { classes } from '@/libs/styles';
 */
export const classes = UtilityClasses;
