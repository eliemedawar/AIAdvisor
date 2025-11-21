# Final Motion & Interaction System

## Overview

This document describes the world-class motion system for the AI Academic Advisor. The system uses consistent durations, easing functions, and animation patterns to create smooth, purposeful interactions that respect user preferences.

## Motion Tokens

### Durations

```css
duration-quick: 120ms
  Micro-interactions, hover, focus, button press
  Most common—snappy, immediate feedback
  
duration-base: 160ms
  State changes, card animations, transitions
  Default for most component animations
  
duration-slow: 240ms
  Page transitions, overlays, complex animations
  Used sparingly for dramatic effect
  
duration-slower: 320ms
  Extended animations, large movements, page loads
  Rarely used—only for major transitions
```

### Easing Functions

```css
ease-snappy: cubic-bezier(0.25, 1, 0.5, 1)
  Hover states, button interactions
  Quick acceleration, strong deceleration—feels responsive
  
ease-smooth: cubic-bezier(0.4, 0, 0.2, 1)
  State transitions, color changes, standard animations
  Balanced, natural motion—default for most uses
  
ease-enter: cubic-bezier(0, 0, 0.2, 1)
  Element entrances, modal open, dropdown show
  Ease out—gentle arrival
  
ease-exit: cubic-bezier(0.4, 0, 1, 1)
  Element exits, modal close, dropdown hide
  Ease in—quick departure
```

## Animation Patterns

### Hover States

**Cards**
```css
.hover-lift {
  transition: transform 120ms cubic-bezier(0.25, 1, 0.5, 1),
              box-shadow 120ms cubic-bezier(0.25, 1, 0.5, 1);
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: [elevation-mid];
}
```

**Buttons**
```css
Primary button:
  hover: scale-[1.01] shadow-elevation-high (duration-quick ease-snappy)
  active: scale-[0.98] shadow-elevation-mid
  
Secondary/Ghost:
  hover: bg-surface-elevated (duration-quick ease-snappy)
  active: scale-[0.98]
```

### Press/Active States

```css
.active-press {
  transition: transform 160ms cubic-bezier(0.4, 0, 0.2, 1);
}
.active-press:active {
  transform: scale(0.98);
}
```

All interactive elements scale down to 98% on active state for tactile feedback.

### Focus States

```css
Focus ring animation:
  transition: box-shadow 120ms cubic-bezier(0, 0, 0.2, 1);
  
On focus-visible:
  box-shadow: 0 0 0 2px #a855f7, 0 0 0 7px rgba(168,85,247,0.25);
  
Ring appears smoothly, disappears instantly on blur
```

### Page Transitions

```javascript
// DashboardLayout page transitions
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
};

const pageTransition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2  // 200ms
};
```

## Component-Specific Motion

### Dashboard

**Stat Cards**
```javascript
Stagger: 50ms between cards (index * 0.05)
Animation: fadeInUp
Duration: 240ms
Easing: [0.4, 0, 0.2, 1]
```

**Task/Course Cards**
```javascript
Stagger: 50ms between items
Animation: fade-in + translateX(-10px → 0)
Duration: 160ms
Hover: translateY(-0.5px) shadow-elevation-mid
```

**Charts**
```javascript
Animation: Built-in Recharts animations
Duration: 520-640ms
Easing: ease-out
Entry: Smooth fade + scale
```

### Chat

**Messages**
```javascript
Entrance:
  initial: { opacity: 0, y: 14 }
  animate: { opacity: 1, y: 0 }
  duration: 180ms
  delay: index * 20ms (stagger)
  easing: [0.4, 0.1, 0.2, 1]
  
Exit:
  opacity: 0, y: -10, scale: 0.98
  duration: 180ms
  
respects prefers-reduced-motion
```

**Typing Indicator**
```javascript
Entrance:
  initial: { opacity: 0, y: 10 }
  animate: { opacity: 1, y: 0 }
  duration: 120ms
  easing: snappy
  
Dots animation:
  @keyframes pulse-dots: opacity 0.3→1→0.3, scale 0.9→1→0.9
  duration: 1.4s infinite
  stagger: 0.2s delay between dots
```

**Context Sidebar**
```javascript
Slide-in (desktop):
  initial: { x: 320, opacity: 0 }
  animate: { x: 0, opacity: 1 }
  exit: { x: 320, opacity: 0 }
  type: spring, stiffness: 260, damping: 28
  
Drawer (mobile):
  initial: { x: 360 }
  animate: { x: 0 }
  duration: 250ms
  easing: easeOut
```

**Quick Actions**
```javascript
Chips entrance:
  initial: { opacity: 0, y: 8 }
  animate: { opacity: 1, y: 0 }
  duration: 160ms
  delay: index * 40ms
  
Hover: translateY(-2px)
Tap: scale(0.98)
```

### Calendar

**Day Cells**
```javascript
Grid entrance:
  initial: { opacity: 0, scale: 0.95 }
  animate: { opacity: 1, scale: 1 }
  duration: 200ms
  delay: globalIndex * 10ms (stagger across entire grid)
  
Hover: translateY(-0.5px) shadow-elevation-low
Active: scale(0.98)
```

**Event Indicators**
```javascript
Compact (in grid):
  initial: { opacity: 0, x: -5 }
  animate: { opacity: 1, x: 0 }
  duration: 160ms
  delay: index * 50ms
  
Hover: shadow-elevation-low (subtle lift)
```

**Hover Preview**
```javascript
Floating card:
  initial: { opacity: 0, y: -6, scale: 0.96 }
  animate: { opacity: 1, y: 0, scale: 1 }
  duration: 240ms
  easing: [0.4, 0, 0.2, 1]
  elevation: overlay (maximum shadow)
```

**Month/Week Transitions**
```javascript
AnimatePresence mode="wait":
  exit: { opacity: 0, y: -10 }
  enter: { opacity: 0, y: 10 } → { opacity: 1, y: 0 }
  duration: 160ms
  easing: smooth
```

### Profile

**Form Fields**
```javascript
Focus:
  transition: border-color, box-shadow
  duration: 120ms
  easing: enter
  
Validation error:
  animation: slide-in-from-top + fade-in
  duration: 150ms
```

## Loading States

### Skeleton Loaders

```css
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(30, 41, 59, 0.5),
    rgba(51, 65, 85, 0.6),
    rgba(30, 41, 59, 0.5)
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Dashboard**
- Stat cards: SkeletonStatCard (3 cards, instant render)
- Charts: SkeletonCard (large rectangles with shimmer)
- Lists: SkeletonList (3-5 rows)

**Chat**
- Messages: SkeletonChatMessage (alternating user/AI)
- Typing: Pulse-dots animation (ongoing)

**Calendar**
- SkeletonCard (full calendar area)

## Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  All transitions and animations:
    duration: 0.01ms !important
    iteration-count: 1 !important
}
```

JavaScript hooks:
```javascript
import { useReducedMotion } from "framer-motion";

const prefersReducedMotion = useReducedMotion();

const animation = prefersReducedMotion
  ? { duration: 0.01 }
  : { duration: 0.24, ease: [0.4, 0, 0.2, 1] };
```

## Interaction Guidelines

### Button Feedback
1. Hover: Scale (1.01 for primary) + elevation increase + color lighten
2. Active: Scale (0.98) + elevation decrease
3. Duration: quick (120ms) for immediate response
4. Loading: Spinner replaces icon, button disabled

### Card Interactions
1. Default: elevation-low, no transform
2. Hover: translateY(-2px) + elevation-mid
3. Active: scale(0.98) + revert to elevation-low
4. Duration: quick (120ms) with snappy easing

### Input Focus
1. Border color change: slate-700/60 → primary-500/50
2. Focus ring appears: accent purple with glow
3. Duration: quick (120ms) with enter easing
4. Ring persists until blur

### Modal/Overlay
1. Open: Backdrop fade (base, 160ms) + Modal scale + slide (slow, 240ms)
2. Close: Reverse, exit easing
3. Background scroll lock during open
4. Trap focus within modal

## Performance Considerations

- Use `transform` and `opacity` only (GPU-accelerated)
- Avoid animating `height`, `width`, `top`, `left` (triggers layout)
- Use `will-change: transform` sparingly (only on active interactions)
- Prefer CSS transitions over JS animations for simple state changes
- Use Framer Motion for complex sequences and gesture handling

## Accessibility

- All animations respect `prefers-reduced-motion`
- Focus rings are always visible on keyboard navigation
- Touch targets are ≥44px on mobile
- Hover states do not hide critical information
- Loading states announced to screen readers (`role="status" aria-live="polite"`)

## Results

The motion system creates:
- Snappy, responsive interactions that feel immediate
- Smooth, purposeful animations that guide attention
- Consistent timing and easing across all components
- Accessible experience that respects user preferences
- Professional, polished feel that elevates the overall UX

