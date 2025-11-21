/**
 * Design Tokens
 * Single source of truth for all design values in the AI Academic Advisor
 * 
 * Brand Identity: Deep Sapphire Blue + Electric Purple + Teal
 * Typography: Sora (headings) + Inter (body/UI)
 * Theme: Dark-first with WCAG AA compliance
 */

// ============================================================================
// COLOR SYSTEM
// ============================================================================

/**
 * Primary: Deep Sapphire Blue
 * Trustworthy, professional, core brand color
 * Used for: primary CTAs, links, focus states, brand elements
 */
export const primary = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93bbfd',
  400: '#5b91fa',
  500: '#0d5eff',  // HSL(220, 100%, 53%) - Core brand
  600: '#0b4fd9',
  700: '#0a3fb0',
  800: '#0d3491',
  900: '#102d75',
  950: '#0a1a47',
} as const;

/**
 * Accent: Electric Purple
 * Energetic, tech-forward, AI/innovation signal
 * Used for: secondary CTAs, highlights, AI-related elements, hover states
 */
export const accent = {
  50: '#faf5ff',
  100: '#f3e8ff',
  200: '#e9d5ff',
  300: '#d8b4fe',
  400: '#c084fc',
  500: '#a855f7',  // HSL(270, 91%, 65%) - Core accent
  600: '#9333ea',
  700: '#7e22ce',
  800: '#6b21a8',
  900: '#581c87',
  950: '#3b0764',
} as const;

/**
 * Secondary Accent: Teal
 * System/status indicator
 * Used for: success states, status indicators, progress elements
 */
export const secondary = {
  50: '#f0fdfa',
  100: '#ccfbf1',
  200: '#99f6e4',
  300: '#5eead4',
  400: '#2dd4bf',
  500: '#14b8a6',
  600: '#0d9488',
  700: '#0f766e',
  800: '#115e59',
  900: '#134e4a',
  950: '#042f2e',
} as const;

/**
 * Semantic Colors
 * Aligned with brand identity and usage patterns
 */
export const semantic = {
  success: {
    500: '#14b8a6', // Teal-based
    600: '#0d9488',
  },
  warning: {
    500: '#f59e0b',
    600: '#d97706',
  },
  error: {
    500: '#ef4444',
    600: '#dc2626',
  },
  info: {
    500: '#0d5eff', // Sapphire-based
    600: '#0b4fd9',
  },
} as const;

/**
 * Semantic Color System - World-Class Usage Guidelines
 * 
 * Charts & Data Visualization:
 * - Primary data: primary[400] (#5b91fa) - main metrics, trend lines
 * - Secondary data: accent[400] (#c084fc) - comparison, alternate series
 * - Tertiary data: secondary[400] (#2dd4bf) - additional context, status
 * - Grid lines: rgba(148, 163, 184, 0.12) - subtle, non-intrusive
 * - Axis labels: #94a3b8 (slate-400) - readable, muted
 * 
 * Badges & Status:
 * - High priority: danger[500] (#ef4444) - urgent, critical
 * - Medium priority: warning[500] (#f59e0b) - important, attention needed
 * - Low priority: gray[600] (#475569) - routine, low urgency
 * - Success: secondary[500] (#14b8a6) - completed, positive
 * - Info: primary[500] (#0d5eff) - informational, neutral
 * 
 * Interactive Elements:
 * - Links: primary[400] text, primary[300] hover, underline on hover
 * - Hover states: -100 lighter shade of base color
 * - Active states: +100 darker shade of base color
 * - Focus rings: accent[500] (#a855f7) with 25% opacity glow
 * 
 * Calendar Events:
 * - Exam: danger[500] (#ef4444) - red
 * - Assignment: primary[500] (#0d5eff) - blue
 * - Study session: accent[500] (#a855f7) - purple
 * - Other: gray[500] (#64748b) - neutral gray
 */
export const semanticUsage = {
  chart: {
    primary: primary[400],
    secondary: accent[400],
    tertiary: secondary[400],
    grid: 'rgba(148, 163, 184, 0.12)',
    axis: '#94a3b8',
  },
  badge: {
    high: semantic.error[500],
    medium: semantic.warning[500],
    low: '#475569', // gray[600]
    success: secondary[500],
    info: primary[500],
  },
  link: {
    default: primary[400],
    hover: primary[300],
    visited: primary[500],
  },
  event: {
    exam: semantic.error[500],
    assignment: primary[500],
    study: accent[500],
    other: '#64748b', // gray[500]
  },
} as const;

/**
 * Grayscale: Cool-toned 10-step scale
 * Optimized for dark theme with proper contrast ratios
 */
export const gray = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
} as const;

/**
 * Background Colors
 * Purpose-specific background tokens
 */
export const background = {
  DEFAULT: '#020617',    // gray-950 - Main app background
  elevated: '#0f172a',   // gray-900 - Elevated surfaces
  subtle: '#1e293b',     // gray-800 - Subtle backgrounds
  card: 'rgba(15, 23, 42, 0.6)',  // glass effect
} as const;

/**
 * Surface Tier System
 * 4-tier hierarchy for consistent depth and elevation
 * 
 * Usage guidelines:
 * - background: Root app canvas, page backgrounds
 * - base: Default cards, containers, primary content areas
 * - elevated: Popovers, dropdowns, cards that sit above base
 * - overlay: Modals, drawers, dialogs - highest layer
 */
export const surface = {
  background: '#020617',              // gray-950 - Root canvas
  base: '#0f172a',                    // gray-900 - Base cards, containers
  elevated: '#1e293b',                // gray-800 - Elevated elements, popovers
  overlay: 'rgba(15, 23, 42, 0.95)',  // gray-900/95 - Modals, overlays
} as const;

/**
 * Border Colors
 * Hierarchy of border emphasis
 */
export const border = {
  DEFAULT: 'rgba(51, 65, 85, 0.6)',  // gray-700/60
  light: 'rgba(71, 85, 105, 0.4)',   // gray-600/40
  strong: 'rgba(100, 116, 139, 0.8)', // gray-500/80
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

/**
 * Font Families
 */
export const fontFamily = {
  display: '"Sora", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
} as const;

/**
 * Font Weights
 */
export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/**
 * Type Scale - Responsive Typography
 * Mobile -> Tablet -> Desktop
 */
export const typography = {
  h1: {
    mobile: { size: '2rem', lineHeight: '1.1', letterSpacing: '-0.02em' },
    tablet: { size: '2.5rem', lineHeight: '1.1', letterSpacing: '-0.02em' },
    desktop: { size: '3rem', lineHeight: '1.1', letterSpacing: '-0.02em' },
    weight: fontWeight.semibold,
    family: fontFamily.display,
  },
  h2: {
    mobile: { size: '1.75rem', lineHeight: '1.2', letterSpacing: '-0.015em' },
    tablet: { size: '2rem', lineHeight: '1.2', letterSpacing: '-0.015em' },
    desktop: { size: '2.25rem', lineHeight: '1.2', letterSpacing: '-0.015em' },
    weight: fontWeight.semibold,
    family: fontFamily.display,
  },
  h3: {
    mobile: { size: '1.5rem', lineHeight: '1.25', letterSpacing: '-0.01em' },
    tablet: { size: '1.75rem', lineHeight: '1.25', letterSpacing: '-0.01em' },
    desktop: { size: '2rem', lineHeight: '1.25', letterSpacing: '-0.01em' },
    weight: fontWeight.semibold,
    family: fontFamily.display,
  },
  h4: {
    mobile: { size: '1.25rem', lineHeight: '1.3', letterSpacing: '-0.005em' },
    tablet: { size: '1.375rem', lineHeight: '1.3', letterSpacing: '-0.005em' },
    desktop: { size: '1.5rem', lineHeight: '1.3', letterSpacing: '-0.005em' },
    weight: fontWeight.semibold,
    family: fontFamily.display,
  },
  h5: {
    mobile: { size: '1.125rem', lineHeight: '1.4', letterSpacing: '0' },
    tablet: { size: '1.125rem', lineHeight: '1.4', letterSpacing: '0' },
    desktop: { size: '1.25rem', lineHeight: '1.4', letterSpacing: '0' },
    weight: fontWeight.semibold,
    family: fontFamily.display,
  },
  h6: {
    mobile: { size: '1rem', lineHeight: '1.4', letterSpacing: '0' },
    tablet: { size: '1rem', lineHeight: '1.4', letterSpacing: '0' },
    desktop: { size: '1.125rem', lineHeight: '1.4', letterSpacing: '0' },
    weight: fontWeight.semibold,
    family: fontFamily.display,
  },
  subtitle: {
    mobile: { size: '1.125rem', lineHeight: '1.5', letterSpacing: '0' },
    tablet: { size: '1.25rem', lineHeight: '1.5', letterSpacing: '0' },
    desktop: { size: '1.375rem', lineHeight: '1.5', letterSpacing: '0' },
    weight: fontWeight.normal,
    family: fontFamily.body,
  },
  body: {
    mobile: { size: '0.875rem', lineHeight: '1.6', letterSpacing: '0' },
    tablet: { size: '0.9375rem', lineHeight: '1.6', letterSpacing: '0' },
    desktop: { size: '1rem', lineHeight: '1.6', letterSpacing: '0' },
    weight: fontWeight.normal,
    family: fontFamily.body,
  },
  small: {
    mobile: { size: '0.75rem', lineHeight: '1.5', letterSpacing: '0' },
    tablet: { size: '0.8125rem', lineHeight: '1.5', letterSpacing: '0' },
    desktop: { size: '0.875rem', lineHeight: '1.5', letterSpacing: '0' },
    weight: fontWeight.normal,
    family: fontFamily.body,
  },
  overline: {
    mobile: { size: '0.6875rem', lineHeight: '1.4', letterSpacing: '0.05em' },
    tablet: { size: '0.75rem', lineHeight: '1.4', letterSpacing: '0.05em' },
    desktop: { size: '0.75rem', lineHeight: '1.4', letterSpacing: '0.05em' },
    weight: fontWeight.semibold,
    family: fontFamily.body,
  },
} as const;

/**
 * Typography Usage Guidelines - World-Class
 * 
 * Page Titles (H1):
 * - Use for main page heading only (Dashboard, Calendar, Profile, etc.)
 * - Color: text-slate-50 (full white for maximum contrast)
 * - Responsive: text-h1-mobile md:text-h1-tablet lg:text-h1-desktop
 * 
 * Section Titles (H4):
 * - Use for card headers and major sections (distinct identity)
 * - Color: text-slate-200 (not muted - clear hierarchy)
 * - Size: text-h4-mobile md:text-h4-tablet lg:text-h4-desktop
 * - Weight: font-semibold
 * 
 * Body Text:
 * - Default content text, paragraphs, descriptions
 * - Mobile: text-sm (0.875rem)
 * - Desktop: text-base (1rem)
 * - Color: text-slate-300 (default), text-slate-400 (muted)
 * - Line height: leading-relaxed (1.6)
 * 
 * Microtext (Timestamps, Captions, Labels):
 * - Compact, secondary information
 * - Size: text-[11px] (0.6875rem)
 * - Color: text-slate-500 (very muted, non-intrusive)
 * - Line height: leading-tight (1.25)
 * - Use for: timestamps, chart axis labels, card metadata
 * 
 * Chart Labels:
 * - Axis labels: text-[11px] leading-tight text-slate-400
 * - Data labels: text-xs font-medium text-slate-300
 * - Tooltip labels: text-[11px] text-slate-400
 * - Tooltip values: text-sm font-semibold text-slate-100
 * 
 * Interactive Text (Links):
 * - Base: text-primary-400 hover:text-primary-300
 * - Underline: hover:underline or underline decoration-primary-500/30
 * - Focus: focus-visible with accent ring
 */
export const typographyUsage = {
  pageTitle: {
    class: 'text-h1-mobile md:text-h1-tablet lg:text-h1-desktop',
    color: 'text-slate-50',
    weight: 'font-semibold',
  },
  sectionTitle: {
    class: 'text-h4-mobile md:text-h4-tablet lg:text-h4-desktop',
    color: 'text-slate-200',
    weight: 'font-semibold',
  },
  body: {
    mobile: 'text-sm',
    desktop: 'text-base',
    color: 'text-slate-300',
    muted: 'text-slate-400',
    lineHeight: 'leading-relaxed',
  },
  microtext: {
    size: 'text-[11px]',
    color: 'text-slate-500',
    lineHeight: 'leading-tight',
  },
  chartLabel: {
    axis: 'text-[11px] leading-tight text-slate-400',
    data: 'text-xs font-medium text-slate-300',
    tooltipLabel: 'text-[11px] text-slate-400',
    tooltipValue: 'text-sm font-semibold text-slate-100',
  },
  link: {
    base: 'text-primary-400 hover:text-primary-300',
    underline: 'hover:underline decoration-primary-500/30',
  },
} as const;

// ============================================================================
// SPACING SYSTEM
// ============================================================================

/**
 * Base Spacing Scale (multiples of 4px)
 */
export const spacing = {
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
  20: '5rem',     // 80px
} as const;

/**
 * Contextual Spacing Guidelines
 */
export const spacingGuidelines = {
  page: {
    mobile: spacing[4],    // 16px
    tablet: spacing[6],    // 24px
    desktop: spacing[8],   // 32px
  },
  card: {
    sm: spacing[4],        // 16px
    md: spacing[6],        // 24px
    lg: spacing[8],        // 32px
  },
  section: {
    mobile: spacing[6],    // 24px
    tablet: spacing[8],    // 32px
    desktop: spacing[12],  // 48px
  },
  component: {
    tight: spacing[2],     // 8px
    normal: spacing[4],    // 16px
    relaxed: spacing[6],   // 24px
  },
  grid: {
    sm: spacing[4],        // 16px
    md: spacing[6],        // 24px
    lg: spacing[8],        // 32px
  },
} as const;

// ============================================================================
// BORDER RADIUS SCALE
// ============================================================================

export const radius = {
  xs: '0.25rem',    // 4px - Small badges, pills
  sm: '0.5rem',     // 8px - Buttons, inputs, small cards
  md: '0.75rem',    // 12px - Standard cards, modals
  lg: '1rem',       // 16px - Large cards, feature sections
  xl: '1.25rem',    // 20px - Hero sections, prominent containers
  '2xl': '1.5rem',  // 24px - Maximum rounding for special elements
  full: '9999px',   // Fully rounded (circles, pills)
} as const;

// ============================================================================
// SHADOW TOKENS (DEPRECATED - Use elevation system instead)
// ============================================================================

export const shadows = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.4)',
  sm: '0 2px 4px rgba(0, 0, 0, 0.5)',
  md: '0 4px 12px rgba(0, 0, 0, 0.6)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.7)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.8)',
  glowPrimary: '0 0 20px rgba(13, 94, 255, 0.4)',     // Sapphire glow (deprecated)
  glowAccent: '0 0 20px rgba(168, 85, 247, 0.4)',     // Purple glow (deprecated)
  glowSecondary: '0 0 20px rgba(20, 184, 166, 0.4)',  // Teal glow (deprecated)
} as const;

/**
 * Elevation System (Layered Shadows) - World-Class
 * Directional, tight shadows that feel confident and intentional
 * 
 * Light Direction: Top-left (consistent across all shadows)
 * Each level combines:
 *   - Ambient shadow: Soft, diffused, negative spread for tightness
 *   - Key shadow: Sharper, directional, controlled spread
 * 
 * Usage Guidelines:
 *   - flat: No shadow, flush with background (inline elements, no hierarchy)
 *   - low: Base cards, default state (1-3dp elevation) - subtle presence
 *   - mid: Elevated cards, hover states (4-6dp elevation) - clear separation
 *   - high: Interactive cards on hover, dropdowns (8-16dp elevation) - prominent depth
 *   - overlay: Modals, dialogs, top-level overlays (20-40dp elevation) - maximum emphasis
 */
export const elevation = {
  flat: 'none',
  low: '0 1px 2px -1px rgba(0, 0, 0, 0.35), 0 1px 3px 0 rgba(0, 0, 0, 0.25)',
  mid: '0 2px 4px -1px rgba(0, 0, 0, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.3)',
  high: '0 4px 8px -2px rgba(0, 0, 0, 0.45), 0 8px 16px -4px rgba(0, 0, 0, 0.35)',
  overlay: '0 8px 16px -4px rgba(0, 0, 0, 0.5), 0 20px 40px -8px rgba(0, 0, 0, 0.4)',
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// MOTION & INTERACTION TOKENS
// ============================================================================

/**
 * Animation Durations
 * Optimized for perceived performance and responsiveness
 * New unified system: 120-160ms sweet spot for interactive feel
 */
export const duration = {
  // New unified system (preferred)
  quick: '120ms',   // Micro-interactions, hover, focus (120ms)
  base: '160ms',    // Standard transitions, state changes (160ms)
  slow: '240ms',    // Complex animations, page transitions (240ms)
  slower: '320ms',  // Extended animations, large movements (320ms)
  
  // Legacy tokens (deprecated, use new system above)
  xs: '50ms',
  sm: '100ms',
  md: '150ms',
  lg: '200ms',
  xl: '300ms',
  '2xl': '500ms',
  fast: '150ms',
  normal: '200ms',
} as const;

/**
 * Easing Functions
 * Provides natural, physics-inspired motion
 * New simplified system with clear semantic names
 */
export const easing = {
  // New unified system (preferred)
  snappy: 'cubic-bezier(0.25, 1, 0.5, 1)',      // Hover states - snappy out
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',       // State transitions - balanced
  enter: 'cubic-bezier(0, 0, 0.2, 1)',          // Entrances - ease out
  exit: 'cubic-bezier(0.4, 0, 1, 1)',           // Exits - ease in
  
  // Legacy tokens (deprecated)
  easeOutQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOutCubic: 'cubic-bezier(0.33, 1, 0.68, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;

/**
 * Transition Presets
 * Common transition combinations for consistency
 */
export const transition = {
  quick: `all ${duration.quick} ${easing.snappy}`,
  base: `all ${duration.base} ${easing.smooth}`,
  slow: `all ${duration.slow} ${easing.smooth}`,
  focus: `box-shadow ${duration.quick} ${easing.enter}`,
  transform: `transform ${duration.quick} ${easing.snappy}`,
  colors: `background-color ${duration.quick} ${easing.smooth}, border-color ${duration.quick} ${easing.smooth}, color ${duration.quick} ${easing.smooth}`,
} as const;

/**
 * Focus Ring Tokens
 * Implements WCAG-compliant, highly visible keyboard focus
 * Spec: 2px Electric Purple outline + 6-8px outer glow
 * Animates in/out subtly using quick duration
 */
export const focusRing = {
  // Core focus color: Electric Purple (accent brand)
  color: accent[500],        // #a855f7
  colorRGB: '168, 85, 247',  // For rgba() usage
  
  // Ring dimensions
  width: '2px',
  glowSize: '0 0 0 7px',     // 6-8px glow average
  glowOpacity: '0.25',       // 25% opacity (20-30% range)
  
  // Computed focus radius offset (component radius + 4px)
  radiusOffset: '4px',
  
  // Transition for subtle animation
  transition: `box-shadow ${duration.quick} ${easing.enter}`,
  
  // Prebuilt ring styles for common scenarios
  default: `0 0 0 2px ${accent[500]}, 0 0 0 7px rgba(168, 85, 247, 0.25)`,
  onDark: `0 0 0 2px ${accent[400]}, 0 0 0 7px rgba(168, 85, 247, 0.3)`,
  onLight: `0 0 0 2px ${accent[600]}, 0 0 0 7px rgba(168, 85, 247, 0.2)`,
} as const;

/**
 * Interactive State Shadows (DEPRECATED - Use elevation system)
 * Elevation changes for hover/active states
 */
export const interactiveShadows = {
  // Button hover states (deprecated - use elevation.mid)
  buttonHover: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 20px rgba(13, 94, 255, 0.3)',
  buttonActive: '0 2px 8px rgba(0, 0, 0, 0.7)',
  
  // Card hover states (deprecated - use elevation.high)
  cardHover: '0 8px 28px rgba(0, 0, 0, 0.7), 0 0 24px rgba(13, 94, 255, 0.15)',
  cardActive: '0 4px 16px rgba(0, 0, 0, 0.7)',
  
  // Input focus states (deprecated - use elevation.low + focusRing)
  inputFocus: '0 4px 12px rgba(13, 94, 255, 0.2)',
  inputError: '0 4px 12px rgba(239, 68, 68, 0.2)',
} as const;

/**
 * Motion Preferences
 * Utility for respecting user motion preferences
 */
export const motion = {
  // CSS media query
  reducedMotionQuery: '(prefers-reduced-motion: reduce)',
  
  // Helper function to check if reduced motion is preferred
  prefersReducedMotion: (): boolean => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  },
  
  // Safe duration (respects reduced motion)
  safeDuration: (normalDuration: string): string => {
    return motion.prefersReducedMotion() ? '0ms' : normalDuration;
  },
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
} as const;

// ============================================================================
// RESPONSIVE UTILITIES
// ============================================================================

/**
 * Media query helpers for responsive design
 * Matches breakpoint tokens above
 */
export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
} as const;

/**
 * Helper to check if current viewport matches a breakpoint
 */
export const matchesBreakpoint = (breakpoint: keyof typeof breakpoints): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(`(min-width: ${breakpoints[breakpoint]})`).matches;
};

// ============================================================================
// ACCESSIBILITY UTILITIES
// ============================================================================

/**
 * Calculate relative luminance for WCAG contrast ratio
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
const getLuminance = (hex: string): number => {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const [rs, gs, bs] = [r, g, b].map((c) => {
    const srgb = c / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate WCAG contrast ratio between two colors
 * Returns ratio between 1 and 21
 * WCAG AA requires 4.5:1 for normal text, 3:1 for large text
 * WCAG AAA requires 7:1 for normal text, 4.5:1 for large text
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if color combination meets WCAG AA standard
 */
export const meetsWCAG_AA = (foreground: string, background: string, largeText = false): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return largeText ? ratio >= 3 : ratio >= 4.5;
};

/**
 * Check if color combination meets WCAG AAA standard
 */
export const meetsWCAG_AAA = (foreground: string, background: string, largeText = false): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return largeText ? ratio >= 4.5 : ratio >= 7;
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Primary = keyof typeof primary;
export type Accent = keyof typeof accent;
export type Secondary = keyof typeof secondary;
export type Gray = keyof typeof gray;
export type Semantic = keyof typeof semantic;
export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
export type Shadow = keyof typeof shadows;
export type Elevation = keyof typeof elevation;
export type Surface = keyof typeof surface;
export type Duration = keyof typeof duration;
export type Easing = keyof typeof easing;
export type Transition = keyof typeof transition;

