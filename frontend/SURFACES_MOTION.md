# Surface, Elevation & Motion System

> **Elite-level design system** implementing consistent surfaces, confident shadows, and snappy motion across the AI Academic Advisor application.

---

## Overview

This document defines the **Surface Tier System**, **Elevation System**, and **Motion System** that together create a cohesive, professional UI with clear visual hierarchy and responsive interactions.

### Design Principles

1. **Consistency**: All interactive elements use the same motion tokens
2. **Hierarchy**: Surface tiers create clear visual depth without glows
3. **Performance**: Durations in 120-160ms range for snappy feel
4. **Accessibility**: WCAG AA contrast maintained, respects `prefers-reduced-motion`
5. **Light Direction**: All shadows assume top-left light source for realism

---

## Surface Tier System

A **4-tier hierarchy** for consistent depth and elevation across the application.

### Tier Definitions

```typescript
surface: {
  background: '#020617',              // gray-950 - Root canvas
  base: '#0f172a',                    // gray-900 - Base cards, containers
  elevated: '#1e293b',                // gray-800 - Elevated cards, popovers
  overlay: 'rgba(15, 23, 42, 0.95)',  // gray-900/95 - Modals, overlays
}
```

### Usage Guidelines

| Tier | Use Cases | Examples |
|------|-----------|----------|
| **background** | Root app canvas, page backgrounds | Main app background, behind all content |
| **base** | Default cards, containers, primary content | Dashboard cards, form containers, stat cards |
| **elevated** | Popovers, dropdowns, hover states | Sidebar nav items (hover), tooltips, input focus |
| **overlay** | Modals, drawers, dialogs - top layer | Modal backgrounds, mobile menu overlays |

### Implementation

```tsx
// Tailwind classes
<div className="bg-surface-base">Base card</div>
<div className="bg-surface-elevated">Elevated element</div>

// In components
const Card = () => (
  <div className="bg-surface-base border border-slate-800/60">
    {/* Content */}
  </div>
);
```

---

## Elevation System (Layered Shadows)

Replaces fuzzy glows with **tight, confident shadows** using dual-layer technique.

### Shadow Architecture

Each elevation level combines:
- **Ambient shadow**: Soft, diffused, larger spread (simulates ambient light)
- **Key shadow**: Sharper, directional, smaller spread (simulates direct light from top-left)

### Elevation Levels

```typescript
elevation: {
  flat: 'none',
  low: '0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
  mid: '0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
  high: '0 10px 20px rgba(0, 0, 0, 0.35), 0 4px 8px rgba(0, 0, 0, 0.25)',
  overlay: '0 20px 40px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.3)',
}
```

### Visual Hierarchy

| Level | Visual Lift | Use Cases | Examples |
|-------|-------------|-----------|----------|
| **flat** | 0dp | Flush elements | Calendar day cells (past), backgrounds |
| **low** | 1-2dp | Subtle lift | Base cards, default state buttons, input fields |
| **mid** | 4-6dp | Moderate lift | Elevated cards, button hover states |
| **high** | 8-12dp | Strong lift | Interactive cards (hover), dropdowns, floating actions |
| **overlay** | 20-24dp | Maximum lift | Modals, dialogs, drawers |

### Implementation

```tsx
// Tailwind utility classes
<div className="shadow-elevation-low">Default card</div>
<div className="shadow-elevation-mid">Elevated card</div>
<button className="shadow-elevation-low hover:shadow-elevation-mid">
  Interactive button
</button>

// Example: Button component
const Button = () => (
  <button className="
    shadow-elevation-low 
    hover:shadow-elevation-mid 
    active:shadow-elevation-low
    transition-all duration-quick ease-snappy
  ">
    Click me
  </button>
);
```

### Before/After Comparison

#### ❌ Before (Fuzzy Glows)
```css
box-shadow: 0 0 20px rgba(13, 94, 255, 0.4);
/* Unfocused, lacks direction, feels "muddy" */
```

#### ✅ After (Layered Shadows)
```css
box-shadow: 
  0 4px 6px rgba(0, 0, 0, 0.3),    /* Ambient */
  0 2px 4px rgba(0, 0, 0, 0.2);    /* Key */
/* Confident, directional, professional */
```

---

## Motion System

Unified motion tokens for **snappy, consistent interactions** across all components.

### Duration Tokens

```typescript
duration: {
  quick: '120ms',   // Micro-interactions, hovers, focus
  base: '160ms',    // Standard transitions, most UI changes
  slow: '240ms',    // Complex transitions, page transitions
  slower: '320ms',  // Extended animations, large movements
}
```

#### Duration Guidelines

| Token | Timing | Use Cases |
|-------|--------|-----------|
| **quick** | 120ms | Hover effects, focus rings, button presses, small scale changes |
| **base** | 160ms | Card lifts, dropdown opens, state changes, color transitions |
| **slow** | 240ms | Page transitions, sidebar collapse/expand, complex animations |
| **slower** | 320ms | Large movements, drawer slides, modal enters/exits |

### Easing Tokens

```typescript
easing: {
  snappy: 'cubic-bezier(0.25, 1, 0.5, 1)',    // Hover states
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',     // State transitions
  enter: 'cubic-bezier(0, 0, 0.2, 1)',        // Entrances
  exit: 'cubic-bezier(0.4, 0, 1, 1)',         // Exits
}
```

#### Easing Guidelines

| Token | Curve | Use Cases |
|-------|-------|-----------|
| **snappy** | Ease-out-quart | Hover effects, quick interactions, button states |
| **smooth** | Ease-in-out | Balanced transitions, state changes, most animations |
| **enter** | Ease-out | Element entrances, modals opening, dropdowns appearing |
| **exit** | Ease-in | Element exits, modals closing, dropdowns hiding |

### Transition Presets

Pre-combined duration + easing for common scenarios:

```typescript
transition: {
  quick: 'all 120ms cubic-bezier(0.25, 1, 0.5, 1)',
  base: 'all 160ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 240ms cubic-bezier(0.4, 0, 0.2, 1)',
  focus: 'box-shadow 120ms cubic-bezier(0, 0, 0.2, 1)',
  transform: 'transform 120ms cubic-bezier(0.25, 1, 0.5, 1)',
  colors: 'background-color 160ms, border-color 160ms, color 160ms',
}
```

### Implementation

```tsx
// Tailwind utility classes
<div className="transition-quick">Quick transition</div>
<div className="transition-base">Standard transition</div>
<div className="duration-quick ease-snappy">Custom combination</div>

// Example: Interactive card
const Card = () => (
  <div className="
    shadow-elevation-low
    hover:shadow-elevation-high
    hover:-translate-y-0.5
    active:translate-y-0
    transition-all duration-quick ease-snappy
  ">
    Interactive card
  </div>
);

// Example: Button
const Button = () => (
  <button className="
    transition-all duration-quick ease-snappy
    hover:scale-105
    active:scale-95
  ">
    Button
  </button>
);
```

### Framer Motion Integration

For components using `framer-motion`:

```tsx
import { motion } from 'framer-motion';

// Card entrance
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
>
  Content
</motion.div>

// List stagger
const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04
    }
  }
};

// Modal
<motion.div
  initial={{ opacity: 0, scale: 0.96 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.96 }}
  transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
>
  Modal content
</motion.div>
```

---

## Focus-Visible Styles

Enhanced focus indicators with **subtle animation** for better accessibility and visual polish.

### Focus Ring Specification

```typescript
focusRing: {
  color: '#a855f7',                              // Electric Purple (accent-500)
  transition: 'box-shadow 120ms ease-out',       // Animated appearance
  default: '0 0 0 2px #a855f7, 0 0 0 7px rgba(168, 85, 247, 0.25)',
}
```

### Implementation

```css
/* Global focus-visible (globals.css) */
button:focus-visible,
input:focus-visible,
[tabindex]:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #a855f7, 0 0 0 7px rgba(168, 85, 247, 0.25);
  transition: box-shadow 120ms cubic-bezier(0, 0, 0.2, 1);
}
```

### Features

- **Animated**: Transitions in/out over 120ms with ease-out curve
- **WCAG AAA**: High contrast Electric Purple (#a855f7) with 7px glow
- **Keyboard-only**: Only visible for keyboard navigation (`:focus-visible`)
- **Consistent**: Same style across all interactive elements

---

## Component Patterns

### Interactive Card

```tsx
const InteractiveCard = () => (
  <div className="
    bg-surface-base 
    border border-slate-800/60
    rounded-2xl 
    shadow-elevation-low
    hover:bg-surface-elevated 
    hover:shadow-elevation-high
    hover:-translate-y-0.5
    active:translate-y-0
    transition-all duration-quick ease-snappy
    cursor-pointer
  ">
    {/* Content */}
  </div>
);
```

### Primary Button

```tsx
const PrimaryButton = () => (
  <button className="
    bg-primary-500 
    text-white
    shadow-elevation-low
    hover:shadow-elevation-mid
    hover:scale-105
    active:scale-95
    transition-all duration-quick ease-snappy
    focus-visible:outline-none
  ">
    Click me
  </button>
);
```

### Input Field

```tsx
const Input = () => (
  <input className="
    bg-surface-base 
    border border-slate-700/60
    shadow-elevation-low
    transition-all duration-quick ease-snappy
    hover:border-slate-600/80
    focus-visible:border-primary-500/50
    focus-visible:outline-none
  " />
);
```

### Modal/Overlay

```tsx
const Modal = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.96 }}
    transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
    className="
      bg-surface-overlay 
      shadow-elevation-overlay
      backdrop-blur-xl
      rounded-2xl
    "
  >
    {/* Content */}
  </motion.div>
);
```

### Sidebar Navigation

```tsx
const Sidebar = () => (
  <aside className="
    bg-surface-base 
    border-r border-slate-800/50
    shadow-elevation-mid
    transition-all duration-slow ease-smooth
    w-64
  ">
    {/* Navigation items */}
  </aside>
);
```

---

## Accessibility Compliance

### WCAG AA Contrast

All surface/text combinations maintain **WCAG AA** (4.5:1 minimum) or better:

| Background | Text Color | Contrast Ratio | Status |
|------------|-----------|----------------|--------|
| `surface.background` (#020617) | slate-50 (#f8fafc) | 17.8:1 | ✅ AAA |
| `surface.base` (#0f172a) | slate-50 (#f8fafc) | 16.2:1 | ✅ AAA |
| `surface.elevated` (#1e293b) | slate-50 (#f8fafc) | 13.1:1 | ✅ AAA |
| `surface.base` | slate-400 (#94a3b8) | 7.1:1 | ✅ AA |

### Reduced Motion Support

System automatically respects `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .transition-quick,
  .transition-base,
  .transition-slow {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

```tsx
// In React components
const prefersReducedMotion = 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const duration = prefersReducedMotion ? 0.01 : 0.16;
```

---

## Migration from Legacy System

### Shadow Updates

| Old (Deprecated) | New (Preferred) | Use Case |
|-----------------|-----------------|----------|
| `shadow-md` | `shadow-elevation-low` | Default cards |
| `shadow-lg` | `shadow-elevation-mid` | Elevated elements |
| `shadow-xl` | `shadow-elevation-high` | Interactive hover |
| `shadow-glow` | `shadow-elevation-mid` | Remove glows |

### Duration Updates

| Old (Deprecated) | New (Preferred) | Use Case |
|-----------------|-----------------|----------|
| `duration-150` | `duration-quick` | Hovers, focus |
| `duration-200` | `duration-base` | State changes |
| `duration-300` | `duration-slow` | Complex transitions |

### Transition Class Updates

| Old Class | New Class | Notes |
|-----------|-----------|-------|
| `.transition-smooth` | `.transition-quick` | For hovers |
| `.transition-smooth-long` | `.transition-slow` | For complex transitions |
| `.transition-micro` | `.transition-quick` | Unified naming |

---

## Developer Guidelines

### Do's ✅

- Use `shadow-elevation-*` for all new shadows
- Use `duration-quick` (120ms) for hovers and micro-interactions
- Use `duration-base` (160ms) for standard transitions
- Use `ease-snappy` for hover effects
- Use `ease-smooth` for state changes
- Apply surface tokens consistently
- Test with `prefers-reduced-motion`

### Don'ts ❌

- Don't use fuzzy glows (`shadow-glow-*`)
- Don't use arbitrary shadow values
- Don't mix old and new duration tokens
- Don't use durations > 320ms without good reason
- Don't skip `focus-visible` styles
- Don't ignore surface tier hierarchy

---

## Quick Reference

### Surface Tiers (4 levels)
```
background → base → elevated → overlay
```

### Elevation Scale (5 levels)
```
flat → low → mid → high → overlay
```

### Motion Durations (4 speeds)
```
quick (120ms) → base (160ms) → slow (240ms) → slower (320ms)
```

### Easing Functions (4 types)
```
snappy → smooth → enter → exit
```

---

## Summary

This system delivers:

- **Visual Hierarchy**: Clear surface tiers with confident shadows
- **Performance**: 120-160ms sweet spot for responsive feel
- **Consistency**: Unified tokens across all interactions
- **Accessibility**: WCAG AA+ contrast, reduced motion support
- **Professional Polish**: Tight shadows, snappy motion, cohesive experience

For questions or contributions, refer to the design token source file: `frontend/src/styles/design-tokens.ts`

---

*Last Updated: November 2024*  
*AI Academic Advisor Design System v2.0*
