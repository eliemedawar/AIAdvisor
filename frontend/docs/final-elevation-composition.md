# Final Elevation & Composition System

## Overview

This document describes the world-class elevation and composition system implemented for the AI Academic Advisor. The system uses directional, layered shadows and clear hierarchical organization to create depth and visual rhythm across all screens.

## Elevation System

### 5-Tier Hierarchy

The app uses a consistent 5-level elevation system with directional shadows (light source: top-left):

```css
elevation-flat: none
  Usage: Inline elements, no hierarchy needed
  Example: Section dividers, inline text

elevation-low: 0 1px 2px -1px rgba(0,0,0,0.35), 0 1px 3px 0 rgba(0,0,0,0.25)
  Usage: Base cards, default resting state (1-3dp)
  Example: Dashboard stat cards, form inputs, default card state

elevation-mid: 0 2px 4px -1px rgba(0,0,0,0.4), 0 4px 6px -1px rgba(0,0,0,0.3)
  Usage: Elevated cards, hover states (4-6dp)
  Example: Chart cards, elevated panels, card hover states

elevation-high: 0 4px 8px -2px rgba(0,0,0,0.45), 0 8px 16px -4px rgba(0,0,0,0.35)
  Usage: Interactive cards on hover, dropdowns (8-16dp)
  Example: Calendar day cells on hover, dropdown menus

elevation-overlay: 0 8px 16px -4px rgba(0,0,0,0.5), 0 20px 40px -8px rgba(0,0,0,0.4)
  Usage: Modals, dialogs, top-level overlays (20-40dp)
  Example: Modals, tooltips, hover previews, mobile drawers
```

### Shadow Characteristics

- **Directional**: All shadows cast from top-left for consistency
- **Layered**: Each level combines ambient (soft) + key (sharp) shadows
- **Negative Spread**: Uses negative spread values for tighter, more confident shadows
- **Progressive Intensity**: Shadow opacity and blur increase with elevation

## Surface Tokens

The app uses 4 distinct surface layers:

```css
surface-background: #020617 (gray-950)
  Canvas/root background, lowest layer

surface-base: #0f172a (gray-900)
  Default cards, containers, primary content areas

surface-elevated: #1e293b (gray-800)
  Elevated elements, popovers, hover states

surface-overlay: rgba(15, 23, 42, 0.95) (gray-900/95)
  Modals, drawers, dialogs - highest layer
```

## Composition Guidelines

### Intentional Asymmetry

Each screen uses intentional asymmetry and contrast to prevent uniformity:

**Dashboard**
- Hero stats: 3-column grid with consistent gaps
- Charts: 2:1 ratio (GPA trend: stacked tasks/study)
- Lists: 2-column layout with spotlight content (tasks, at-risk courses)

**Chat**
- Two-column: Main chat (flex-1) + Context sidebar (320px fixed)
- Asymmetric bubble alignment (user right, AI left)
- Staggered message entrance animations

**Calendar**
- Grid: 7 equal columns with subtle gap spacing
- Visual hierarchy: Today > Selected > Has Events > Empty > Past
- Hover preview: Floating overlay with maximum elevation

**Profile**
- Stats grid: 3-column on desktop, single column on mobile
- Form: Clear sections with distinct spacing rhythms

### Spotlight Zones

Key content areas use subtle background tone variations:

- Primary content: `bg-slate-950/60` + `backdrop-blur-sm`
- Secondary content: `bg-slate-950/40` or `bg-surface-background`
- Interactive elements: `hover:bg-surface-elevated`

### Inner Borders & Highlights

Elevated cards use subtle inner rings for depth perception:

```css
ring-1 ring-inset ring-slate-950/40  /* Default cards */
ring-1 ring-inset ring-slate-950/30  /* Elevated cards */
ring-1 ring-primary-500/40           /* Today badge, special states */
```

## Component-Specific Elevation

### Dashboard
- Stat cards: `elevation-low`
- Chart cards: `elevation-mid`
- Task/course cards: `elevation-low`, hover `elevation-mid`
- Insight cards: `elevation-flat` with `bg-slate-950/60`

### Chat
- Message bubbles: `elevation-low` (AI), `elevation-mid` (user)
- Context sidebar: `elevation-mid`
- Input footer: `elevation-low` shadow
- Typing indicator: `elevation-low`
- Hover tooltips: `elevation-overlay`

### Calendar
- Day cells: `elevation-flat` default, `elevation-low` on hover
- Today cell: `elevation-low` always
- Event indicators: `elevation-flat`, `elevation-low` on hover
- Hover preview: `elevation-overlay`
- Month/week selector: `elevation-low`

### Profile
- Header card: `elevation-low`
- Stat cards: `elevation-low`
- Form card: `elevation-mid`
- Study style card: `elevation-low`

## Responsive Behavior

Elevation system remains consistent across all breakpoints:
- sm (640px): Same elevation tokens, adjusted spacing
- md (768px): Same elevation tokens, tighter spacing
- lg (1024px): Same elevation tokens, optimal spacing
- xl (1280px+): Same elevation tokens, maximum spacing

The elevation values do not change—only spacing, layout, and typography scale responsively.

## Implementation Notes

- All elevation tokens are defined in `tailwind.config.cjs` and `design-tokens.ts`
- Use `shadow-elevation-{level}` classes instead of arbitrary shadow values
- Pair shadows with appropriate surface tokens for best results
- Always use `backdrop-blur-sm` or `backdrop-blur-xl` with transparent backgrounds
- Apply transitions: `transition-all duration-quick ease-snappy` for hover states

## Accessibility

- Elevation changes are visual only—ensure interactive elements have:
  - Proper ARIA labels
  - Keyboard focus states (accent purple ring)
  - Touch targets ≥44px on mobile
  - Sufficient color contrast (WCAG AA minimum)

## Results

The elevation system creates:
- Clear visual hierarchy across all screens
- Confident, directional depth that feels intentional
- Consistent interaction feedback through shadow changes
- Professional, cohesive design language throughout the app

