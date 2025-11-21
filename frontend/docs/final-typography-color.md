# Final Typography & Color System

## Overview

This document describes the refined typography scale and semantic color system for the AI Academic Advisor. The system uses Sora for headings and Inter for body text, with a clear hierarchy and purposeful color application across all use cases.

## Typography Scale

### Font Families

```css
Display/Headings: Sora (600 semibold)
  H1-H4, page titles, section headers

Body/UI: Inter (400 regular, 500 medium, 600 semibold)
  Paragraphs, labels, buttons, form fields, UI text

Monospace: JetBrains Mono / Fira Code
  Code snippets, technical data (if needed)
```

### Responsive Type Scale

All headings and body text scale responsively across breakpoints:

**H1 (Page Titles)**
- Mobile: 2rem (32px) / 1.1 line-height / -0.02em letter-spacing
- Tablet: 2.5rem (40px) / 1.1 / -0.02em
- Desktop: 3rem (48px) / 1.1 / -0.02em
- Color: `text-slate-50` (full white for maximum contrast)

**H4 (Section Titles)**
- Mobile: 1.25rem (20px) / 1.3 / -0.005em
- Tablet: 1.375rem (22px) / 1.3 / -0.005em
- Desktop: 1.5rem (24px) / 1.3 / -0.005em
- Color: `text-slate-200` (clear hierarchy, not muted)

**Body Text**
- Mobile: 0.875rem (14px) / 1.6
- Desktop: 1rem (16px) / 1.6
- Color: `text-slate-300` (default), `text-slate-400` (muted)

**Microtext (Timestamps, Captions, Chart Labels)**
- Size: 0.6875rem (11px)
- Line height: 1.25 (leading-tight)
- Color: `text-slate-500` (very muted, non-intrusive)
- Use cases: timestamps, chart axes, metadata, captions

### Chart-Specific Typography

```css
Axis labels: text-[11px] leading-tight text-slate-400
  Font: Inter 400, color: #94a3b8
  
Data labels: text-xs font-medium text-slate-300
  Inline data values, bar labels
  
Tooltip labels: text-[11px] leading-tight text-slate-400
  Keys/descriptions in tooltips
  
Tooltip values: text-sm font-semibold leading-snug text-slate-100
  Numeric values, emphasis in tooltips
```

## Color System

### Brand Colors

```css
Primary: Sapphire Blue (#0d5eff at 500, #5b91fa at 400)
  Primary CTAs, links, data visualization (primary series)
  
Accent: Electric Purple (#a855f7 at 500, #c084fc at 400)
  Secondary CTAs, focus rings, highlights, AI elements
  
Secondary: Teal (#14b8a6 at 500, #2dd4bf at 400)
  Success states, completed tasks, tertiary data
```

### Semantic Color Usage

**Charts & Data Visualization**
```css
Primary data: primary[400] (#5b91fa)
  Main metrics, trend lines, primary chart series
  
Secondary data: accent[400] (#c084fc)
  Comparison data, alternate chart series
  
Tertiary data: secondary[400] (#2dd4bf)
  Additional context, status indicators
  
Grid lines: rgba(148, 163, 184, 0.12)
  Subtle, non-intrusive, lighter than before
  
Axis text: #94a3b8 (slate-400)
  Readable, muted, consistent across all charts
```

**Badges & Status**
```css
High priority: danger[500] (#ef4444)
  Urgent, critical, needs immediate attention
  
Medium priority: warning[500] (#f59e0b)
  Important, attention needed, at-risk
  
Low priority: gray[600] (#475569)
  Routine, low urgency, normal priority
  
Success: secondary[500] (#14b8a6)
  Completed, positive, on-track
  
Info: primary[500] (#0d5eff)
  Informational, neutral, default
```

**Calendar Events**
```css
Exam: danger[500] (#ef4444) - Red
  Critical deadlines, exams, high-stakes events
  
Assignment: primary[500] (#0d5eff) - Blue
  Homework, projects, standard work items
  
Study session: accent[500] (#a855f7) - Purple
  Study blocks, review sessions, prep time
  
Other: gray[500] (#64748b) - Neutral gray
  Misc events, placeholder, general items
```

**Interactive Elements**
```css
Links:
  Default: text-primary-400 (#5b91fa)
  Hover: text-primary-300 (#93bbfd)
  Underline: hover:underline decoration-primary-500/30
  
Hover states:
  Background: Use -100 lighter shade (e.g., slate-700 → slate-600)
  Border: Use -100 lighter shade (e.g., slate-800/70 → slate-700/80)
  
Active states:
  Background: Use +100 darker shade
  Scale: scale-[0.98] with duration-quick
  
Focus rings:
  Color: accent[500] (#a855f7)
  Style: 0 0 0 2px #a855f7, 0 0 0 7px rgba(168,85,247,0.25)
  Transition: duration-quick ease-enter
```

## Typography Usage Guidelines

### Page Titles (H1)
- Use once per page for main heading
- Responsive sizing: `text-h1-mobile md:text-h1-tablet lg:text-h1-desktop`
- Always `text-slate-50` for maximum contrast

### Section Titles (H4)
- Use for card headers, major sections
- Distinct from page titles—smaller, but still clear
- `text-slate-200` (not muted—establishes hierarchy)
- `font-semibold` with Sora font family

### Body Text
- Default content, paragraphs, descriptions
- Mobile: `text-sm`, Desktop: `text-base`
- `text-slate-300` (readable), `text-slate-400` (muted)
- `leading-relaxed` (1.6 line-height)

### Microtext
- Compact secondary information
- Always `text-[11px] leading-tight`
- Always `text-slate-500` (very muted)
- Use for: timestamps, chart labels, metadata, captions

## Color Contrast

All text colors meet WCAG AA standards:

```
text-slate-50 on bg-surface-base: 15.2:1 (AAA)
text-slate-200 on bg-surface-base: 11.8:1 (AAA)
text-slate-300 on bg-surface-base: 9.4:1 (AA)
text-slate-400 on bg-surface-base: 6.2:1 (AA)
text-slate-500 on bg-surface-base: 4.6:1 (AA for large text)
primary-400 on bg-surface-base: 5.8:1 (AA)
```

## Implementation Notes

- Typography tokens are defined in `tailwind.config.cjs` and `design-tokens.ts`
- Use semantic color mappings in `semanticUsage` object
- Always pair colors with appropriate weights/sizes
- Use `leading-tight` (1.25) for compact text, `leading-snug` (1.375) for balanced text, `leading-relaxed` (1.6) for paragraphs
- Letter spacing: -0.02em to -0.005em for headings, 0 for body, 0.05em for overline/uppercase

## Chart Styling

All Recharts charts use:
- Axis labels: `fontSize: "0.6875rem"`, `fontWeight: 400`, `fill: "#94a3b8"`
- Grid: `stroke: "rgba(148, 163, 184, 0.12)"`, `strokeDasharray: "2 6"`
- Tooltips: Custom styled with `bg-slate-950/95`, `shadow-elevation-overlay`, `backdrop-blur-xl`
- Data strokes: 2-2.5px for lines, brand colors from `primary[400]`, `accent[400]`, `secondary[400]`
- Bars: Rounded corners (6-10px radius), subtle gradient fills optional

## Results

The typography and color system provides:
- Clear hierarchy and readability across all screens
- Consistent semantic meaning for colors
- Data visualization that aligns with brand identity
- Accessible contrast ratios (WCAG AA minimum)
- Calm, confident typographic rhythm

