/**
 * Design System Exports
 * Central export point for design tokens and utilities
 */

export { DesignTokens, UtilityClasses, cn } from './design-tokens';
export type { DesignTokensType, UtilityClassesType } from './design-tokens';

// Re-export for convenience
import { UtilityClasses } from './design-tokens';

export const classes = UtilityClasses;
