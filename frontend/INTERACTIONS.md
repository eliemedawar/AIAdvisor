# Interaction Design System

> **World-class interaction patterns, microinteractions, and motion design for the AI Academic Advisor**

This document defines the interaction design tokens, patterns, and guidelines that create polished, accessible user experiences across the application.

---

## Table of Contents

1. [Interaction Tokens](#interaction-tokens)
2. [Focus-Visible Specification](#focus-visible-specification)
3. [Interactive States](#interactive-states)
4. [Loading & Skeleton Patterns](#loading--skeleton-patterns)
5. [Form Validation & Feedback](#form-validation--feedback)
6. [Microinteractions](#microinteractions)
7. [Toast Notifications](#toast-notifications)
8. [Motion & Accessibility](#motion--accessibility)
9. [Code Examples](#code-examples)

---

## Interaction Tokens

All interaction tokens are centralized in `src/styles/design-tokens.ts`. Import and use them consistently across components.

### Duration Tokens

```typescript
import { duration } from '../styles/design-tokens';

// Available durations:
duration.xs   // 50ms  - Ultra-fast micro-interactions
duration.sm   // 100ms - Quick transitions
duration.md   // 150ms - Standard interactions (hover, focus) ⭐ Default
duration.lg   // 200ms - State changes, animations
duration.xl   // 300ms - Complex transitions
duration['2xl'] // 500ms - Extended animations
```

**Guidelines:**
- Use `150ms` (md) for most hover and focus states
- Use `200ms` (lg) for state transitions (open/close, expand/collapse)
- Use `100ms` (sm) for micro-movements (scale, translate)
- Always respect `prefers-reduced-motion`

### Easing Functions

```typescript
import { easing } from '../styles/design-tokens';

// Available easings:
easing.easeOutQuart  // cubic-bezier(0.25, 1, 0.5, 1)     - Hover states (snappy)
easing.easeInOut     // cubic-bezier(0.4, 0, 0.2, 1)      - State transitions (balanced)
easing.easeOutCubic  // cubic-bezier(0.33, 1, 0.68, 1)    - Micro-movements (subtle)
easing.easeOut       // cubic-bezier(0, 0, 0.2, 1)        - Entrances (smooth in)
easing.easeIn        // cubic-bezier(0.4, 0, 1, 1)        - Exits (quick out)
```

**Guidelines:**
- **Hover effects**: Use `easeOutQuart` for snappy, responsive feel
- **State changes**: Use `easeInOut` for modal open/close, sidebar collapse
- **Micro-movements**: Use `easeOutCubic` for scale/translate on press
- **Entrances**: Use `easeOut` for elements appearing
- **Exits**: Use `easeIn` for elements disappearing

### Focus Ring Tokens

```typescript
import { focusRing } from '../styles/design-tokens';

// Available focus tokens:
focusRing.color       // #a855f7 (Electric Purple - accent[500])
focusRing.colorRGB    // '168, 85, 247' (for rgba usage)
focusRing.width       // '2px'
focusRing.glowSize    // '0 0 0 7px' (6-8px glow)
focusRing.glowOpacity // '0.25' (25% opacity)
focusRing.radiusOffset // '4px' (component radius + 4px)

// Prebuilt ring styles:
focusRing.default  // Standard focus ring (most common)
focusRing.onDark   // Adjusted for dark backgrounds
focusRing.onLight  // Adjusted for light backgrounds
```

### Interactive Shadow Tokens

```typescript
import { interactiveShadows } from '../styles/design-tokens';

// Button states:
interactiveShadows.buttonHover   // Elevated with primary glow
interactiveShadows.buttonActive  // Pressed/compressed shadow

// Card states:
interactiveShadows.cardHover     // Subtle lift with glow
interactiveShadows.cardActive    // Settled pressed state

// Input states:
interactiveShadows.inputFocus    // Primary glow on focus
interactiveShadows.inputError    // Danger glow for errors
```

---

## Focus-Visible Specification

All interactive elements **must** implement the following focus-visible spec for WCAG AA compliance and world-class keyboard navigation.

### Specification

- **Outline Width**: 2px solid
- **Outline Color**: Electric Purple (`#a855f7` / `accent[500]`)
- **Outer Glow**: 6–8px blur with 20–30% opacity
- **Radius**: Component border-radius + 4px
- **Trigger**: Keyboard interaction only (`:focus-visible`)
- **Contrast**: Must pass WCAG AA on all backgrounds

### Implementation

**Tailwind Utility Classes:**

```tsx
// Standard focus-visible (most common)
className="focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#a855f7,0_0_0_7px_rgba(168,85,247,0.25)]"

// With rounded corners (adjust per component)
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
```

**Using Design Tokens:**

```tsx
import { focusRing } from '../styles/design-tokens';

// In component styles
const buttonStyles = {
  // ... other styles
  '&:focus-visible': {
    outline: 'none',
    boxShadow: focusRing.default
  }
};
```

**Global CSS (already implemented in `globals.css`):**

```css
/* Applied to all interactive elements by default */
button:focus-visible,
a:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible,
[role="button"]:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #a855f7, 0 0 0 7px rgba(168, 85, 247, 0.25);
}
```

### Examples

**Button with Focus Ring:**

```tsx
<button
  className={clsx(
    "rounded-xl px-4 py-2.5 bg-primary-500 text-white",
    "transition-all duration-150 ease-out",
    "hover:bg-primary-400 hover:scale-[1.02]",
    "active:scale-[0.98]",
    "focus-visible:outline-none",
    "focus-visible:shadow-[0_0_0_2px_#a855f7,0_0_0_7px_rgba(168,85,247,0.25)]",
    "disabled:opacity-50 disabled:pointer-events-none"
  )}
>
  Save Changes
</button>
```

**Link with Focus Ring:**

```tsx
<Link
  to="/profile"
  className="text-primary-300 hover:text-primary-200 transition-colors duration-150 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#a855f7,0_0_0_7px_rgba(168,85,247,0.25)] rounded-sm"
>
  Edit Profile
</Link>
```

---

## Interactive States

All interactive elements must support the following states with smooth transitions.

### Button States

**1. Default** → Resting state with subtle shadow

**2. Hover**
- Background color lightens
- Shadow increases (elevation)
- Subtle scale increase (`scale-[1.02]`)
- Duration: `150ms` with `easeOutQuart`

**3. Active/Pressed**
- Background color darkens slightly
- Scale decreases (`scale-[0.98]`)
- Shadow reduces (pressed effect)
- Duration: `100ms` with `easeOutCubic`

**4. Focus-Visible**
- Electric Purple ring with glow (see spec above)
- Maintains hover state if applicable
- Keyboard-only (no ring on mouse click)

**5. Disabled**
- Opacity: 50%
- Pointer events: none
- Cursor: not-allowed
- No hover or active states

**Example Implementation:**

```tsx
<Button
  variant="primary"
  size="md"
  disabled={loading}
  className="hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
>
  Submit
</Button>
```

### Card States

**1. Default** → Static card with border and backdrop blur

**2. Hover (for interactive cards)**
- Background lightens
- Border color increases opacity
- Shadow increases (lift effect)
- Subtle translate up (`-translate-y-0.5`)
- Duration: `150ms` with `easeOutQuart`

**3. Active/Pressed**
- Returns to default position
- Shadow reduces to default
- Duration: `100ms`

**4. Focus-Visible (for clickable cards)**
- Electric Purple ring
- Radius = card radius + 4px

**Example:**

```tsx
<Card
  variant="interactive"
  className="hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
>
  {/* Card content */}
</Card>
```

### Input States

**1. Default** → Border and subtle shadow

**2. Hover**
- Border color increases opacity
- Duration: `150ms`

**3. Focus**
- Border color: Primary or accent
- Shadow: Input focus glow
- Electric Purple focus ring (from global styles)

**4. Error**
- Border: Danger color
- Shadow: Danger glow
- Error icon and message below

**5. Disabled**
- Opacity: 50%
- Background: Darker variant
- Cursor: not-allowed

**Example:**

```tsx
<Input
  label="Email"
  type="email"
  error={errors.email}
  className="transition-all duration-150"
/>
```

### Sidebar Navigation Item States

**1. Default** → Neutral text and transparent background

**2. Hover**
- Background: Slate overlay
- Subtle translate right (`translate-x-0.5`)
- Icon color transitions to primary

**3. Active (current route)**
- Gradient background (primary/accent)
- Primary text color
- Border with glow
- Icon in primary color

**4. Focus-Visible**
- Electric Purple ring

**Example:**

```tsx
<SidebarNavItem
  to="/dashboard"
  label="Dashboard"
  icon={<LayoutDashboard className="h-5 w-5" />}
/>
```

---

## Loading & Skeleton Patterns

Use skeleton loaders for perceived performance and to prevent layout shift during data fetching.

### Skeleton Components

Available in `src/components/core/Skeleton.tsx`:

- `<Skeleton />` - Basic rectangular skeleton
- `<SkeletonText />` - Text line skeleton
- `<SkeletonCard />` - Card with multiple text lines
- `<SkeletonList />` - List of items
- `<SkeletonAvatar />` - Circular avatar skeleton
- `<SkeletonChatMessage />` - Chat bubble skeleton
- `<SkeletonStatCard />` - Stat card skeleton

### Shimmer Animation

All skeletons use a consistent shimmer effect:

```css
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(30, 41, 59, 0.5) 0%,
    rgba(51, 65, 85, 0.6) 50%,
    rgba(30, 41, 59, 0.5) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Usage Patterns

**Dashboard Loading State:**

```tsx
if (loading) {
  return (
    <PageShell>
      <PageSection>
        <header>
          <Heading level="h1">Dashboard</Heading>
          <Text variant="body" color="muted" className="mt-2">
            Overview of your academic performance.
          </Text>
        </header>
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>
        <SkeletonList count={3} />
      </PageSection>
    </PageShell>
  );
}
```

**Chat Loading State:**

```tsx
{loading && !messages.length ? (
  <div className="space-y-4">
    <SkeletonChatMessage isUser={false} />
    <SkeletonChatMessage isUser={true} />
    <SkeletonChatMessage isUser={false} />
  </div>
) : (
  // Render messages
)}
```

**Profile Loading State:**

```tsx
if (loading && !profile) {
  return (
    <PageShell>
      <PageSection>
        <header>
          <Heading level="h1">Profile</Heading>
          <Text variant="body" color="muted" className="mt-2">
            Basic information that powers your insights.
          </Text>
        </header>
        <SkeletonCard />
      </PageSection>
    </PageShell>
  );
}
```

### Guidelines

- Show skeletons immediately when loading starts
- Match skeleton shape to actual content layout
- Use consistent shimmer timing (1.8s)
- Respect `prefers-reduced-motion` (disable shimmer)
- Don't show skeletons for < 300ms loads (flicker prevention)

---

## Form Validation & Feedback

Implement inline validation with clear visual feedback and accessible error messaging.

### Validation States

**1. Pristine** → Field has not been touched

**2. Touched** → User has focused and blurred the field

**3. Valid** → Value passes validation (optional success indicator)

**4. Invalid** → Value fails validation with error message

### Error Display Pattern

```tsx
const [errors, setErrors] = useState({ email: "" });
const [touched, setTouched] = useState({ email: false });

const validateEmail = (value: string): string => {
  if (!value) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return "Please enter a valid email";
  return "";
};

<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    if (touched.email) {
      setErrors({ ...errors, email: validateEmail(e.target.value) });
    }
  }}
  onBlur={() => {
    setTouched({ ...touched, email: true });
    setErrors({ ...errors, email: validateEmail(email) });
  }}
  error={touched.email ? errors.email : ""}
/>
```

### Error Styling

The `FormField` component automatically handles error display:

```tsx
{error && (
  <p className="flex items-center gap-1.5 text-xs text-danger-400 animate-in fade-in slide-in-from-top-1 duration-150">
    <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
    <span>{error}</span>
  </p>
)}
```

### Success Feedback (Toast)

After successful form submission:

```tsx
import { useToast } from '../../context/ToastContext';

const { showSuccess, showError } = useToast();

try {
  await saveProfile({ major, year, target_gpa });
  showSuccess("Profile updated successfully", "Your dashboard will reflect these changes.");
} catch (err) {
  showError("Failed to save changes", "Please try again.");
}
```

### Validation Guidelines

- **Validate on blur** for first-time errors
- **Validate on change** after field is touched
- **Show errors immediately** on submit attempt
- **Use semantic colors** (danger for errors, success for confirmation)
- **Include helper text** for complex validation rules
- **Provide clear error messages** (actionable, not technical)
- **Use ARIA attributes** (`aria-invalid`, `aria-describedby`)

---

## Microinteractions

Subtle animations that provide feedback and enhance the user experience.

### Button Press Effect

```tsx
<Button className="active:scale-[0.98] transition-transform duration-100">
  Click Me
</Button>
```

### Card Hover Lift

```tsx
<Card className="transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg">
  {/* Content */}
</Card>
```

### Sidebar Collapse/Expand

The sidebar smoothly transitions between collapsed and expanded states:

```tsx
const [isCollapsed, setIsCollapsed] = useState(false);

<aside className={clsx(
  "transition-all duration-200 ease-in-out",
  isCollapsed ? "lg:w-20" : "lg:w-64"
)}>
  {/* Sidebar content with conditional label display */}
</aside>
```

**Guidelines:**
- Width transition: `200ms` with `easeInOut`
- Label fade: Transition opacity with same timing
- Icon remains visible when collapsed
- Tooltip appears on hover when collapsed

### Modal Enter/Exit

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
      transition={{ 
        duration: prefersReducedMotion ? 0.01 : 0.2,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      {/* Modal content */}
    </motion.div>
  )}
</AnimatePresence>
```

**Guidelines:**
- Backdrop: Fade in/out (`150ms`)
- Dialog: Fade + scale + slight Y translate (`200ms`)
- Use `easeInOut` for balanced entrance/exit
- Respect `prefers-reduced-motion` (opacity only)

### Staggered List Animations

```tsx
const staggerChildren = {
  animate: {
    transition: { staggerChildren: 0.05 }
  }
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

<motion.div variants={staggerChildren} initial="initial" animate="animate">
  {items.map((item) => (
    <motion.div key={item.id} variants={fadeInUp}>
      {/* Item content */}
    </motion.div>
  ))}
</motion.div>
```

### Loading Spinner

```tsx
<span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
```

**Duration:** Continuous rotation at ~1s per revolution

---

## Toast Notifications

Global notification system for success, error, warning, and info messages.

### Toast Context Setup

Already implemented in `src/context/ToastContext.tsx`. Wrap your app:

```tsx
import { ToastProvider } from './context/ToastContext';

<ToastProvider>
  <App />
</ToastProvider>
```

### Using Toasts

```tsx
import { useToast } from '../../context/ToastContext';

const { showSuccess, showError, showWarning, showInfo } = useToast();

// Success (4s duration)
showSuccess("Profile updated successfully", "Your changes have been saved.");

// Error (6s duration)
showError("Failed to save changes", "Please try again or contact support.");

// Warning (5s duration)
showWarning("Session expiring soon", "You'll be logged out in 5 minutes.");

// Info (5s duration)
showInfo("New feature available", "Check out the updated dashboard.");
```

### Toast Variants

| Variant   | Icon             | Color Scheme       | Duration | Use Case                     |
|-----------|------------------|--------------------|----------|------------------------------|
| `success` | CheckCircle2     | Teal (success)     | 4s       | Successful actions           |
| `error`   | AlertCircle      | Red (danger)       | 6s       | Failed actions, errors       |
| `warning` | AlertTriangle    | Amber (warning)    | 5s       | Warnings, cautionary info    |
| `info`    | Info             | Blue (info)        | 5s       | General information          |

### Toast Animations

```tsx
<motion.div
  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.95 }}
  transition={{ 
    duration: prefersReducedMotion ? 0.01 : 0.2,
    ease: [0.25, 1, 0.5, 1]
  }}
>
  {/* Toast content */}
</motion.div>
```

**Guidelines:**
- Entrance: Slide up with fade (`200ms`)
- Exit: Slide down slightly with fade (`200ms`)
- Auto-dismiss based on variant duration
- Manual close button always available
- Respect `prefers-reduced-motion` (opacity only)
- Position: Top-right on desktop, bottom-center on mobile
- ARIA live region for screen readers

---

## Motion & Accessibility

All animations must respect user preferences and maintain accessibility.

### Prefers-Reduced-Motion

Always check for reduced motion preference:

```tsx
const prefersReducedMotion = typeof window !== 'undefined' 
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
  : false;
```

**Implementation Example:**

```tsx
<motion.div
  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
  transition={{ duration: prefersReducedMotion ? 0.01 : 0.2 }}
>
  {/* Content */}
</motion.div>
```

**CSS Approach (in `globals.css`):**

```css
@media (prefers-reduced-motion: reduce) {
  .transition-smooth,
  .transition-smooth-long,
  .transition-micro,
  .animate-pulse,
  .animate-spin {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Motion Guidelines

**✅ DO:**
- Use subtle, fast animations (150–200ms)
- Fade-in content on load
- Provide visual feedback for interactions
- Respect `prefers-reduced-motion`
- Use consistent easing functions
- Animate meaningful state changes

**❌ DON'T:**
- Create continuous looping animations (except loading spinners)
- Use long animation durations (> 500ms)
- Animate purely for decoration
- Create jarring, large-scale motion
- Block user interaction during animations
- Ignore reduced motion preferences

### Accessibility Checklist

- [ ] All interactive elements have focus-visible styles
- [ ] Focus order is logical and follows visual layout
- [ ] Keyboard navigation works for all interactive elements
- [ ] ARIA attributes used correctly (roles, labels, live regions)
- [ ] Color is not the only indicator of state
- [ ] Text meets WCAG contrast requirements (4.5:1 for body, 3:1 for large)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Loading states don't cause layout shift
- [ ] Error messages are associated with form fields (`aria-describedby`)
- [ ] Success/error feedback is announced to screen readers

---

## Code Examples

### Complete Button Component

```tsx
import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import clsx from "clsx";
import { duration, easing, focusRing } from "../styles/design-tokens";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, icon, children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          // Base styles
          "inline-flex items-center justify-center rounded-xl font-medium",
          "transition-all ease-out",
          "focus-visible:outline-none active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          
          // Duration from tokens
          "duration-150", // duration.md
          
          // Variant styles
          variant === "primary" && [
            "bg-primary-500 text-white hover:bg-primary-400 active:bg-primary-600",
            "shadow-lg shadow-primary-500/30",
            "hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_20px_rgba(13,94,255,0.3)]",
          ],
          
          // Focus ring
          "focus-visible:shadow-[0_0_0_2px_#a855f7,0_0_0_7px_rgba(168,85,247,0.25)]",
          
          // Size
          size === "md" && "px-4 py-2.5 text-sm gap-2",
          
          className
        )}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : icon ? (
          <span className="inline-flex">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);
```

### Complete Form with Validation

```tsx
import { FormEvent, useState } from "react";
import { Input, Button } from "../../components";
import { useToast } from "../../context/ToastContext";

export const ProfileForm = () => {
  const { showSuccess, showError } = useToast();
  const [major, setMajor] = useState("");
  const [errors, setErrors] = useState({ major: "" });
  const [touched, setTouched] = useState({ major: false });
  const [saving, setSaving] = useState(false);

  const validateMajor = (value: string): string => {
    if (!value.trim()) return "Major is required";
    if (value.length < 2) return "Major must be at least 2 characters";
    return "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const majorError = validateMajor(major);
    setErrors({ major: majorError });
    setTouched({ major: true });
    
    if (majorError) return;

    setSaving(true);
    try {
      await saveProfile({ major });
      showSuccess("Profile updated successfully", "Your dashboard will reflect these changes.");
    } catch (err) {
      showError("Failed to save changes", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Major"
        value={major}
        onChange={(e) => {
          setMajor(e.target.value);
          if (touched.major) {
            setErrors({ major: validateMajor(e.target.value) });
          }
        }}
        onBlur={() => {
          setTouched({ major: true });
          setErrors({ major: validateMajor(major) });
        }}
        error={touched.major ? errors.major : ""}
        placeholder="e.g. Computer Science"
      />
      
      <Button type="submit" loading={saving} className="w-full">
        Save Changes
      </Button>
    </form>
  );
};
```

### Complete Modal with Animations

```tsx
import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import clsx from "clsx";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "md" | "lg";
}

export const Modal = ({ isOpen, onClose, title, children, size = "md" }: ModalProps) => {
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.15 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
            transition={{ 
              duration: prefersReducedMotion ? 0.01 : 0.2,
              ease: [0.4, 0, 0.2, 1]
            }}
            className={clsx(
              "relative z-10 w-full rounded-2xl border border-slate-800/80",
              "bg-slate-900/95 shadow-xl backdrop-blur-xl",
              size === "md" && "max-w-lg",
              size === "lg" && "max-w-2xl"
            )}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-slate-800/60 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-slate-800/60 hover:text-slate-200 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#a855f7,0_0_0_7px_rgba(168,85,247,0.25)]"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="px-6 py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
```

---

## Quick Reference

### Most Common Patterns

**Standard Transition:**
```tsx
className="transition-all duration-150 ease-out"
```

**Hover Lift:**
```tsx
className="transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg"
```

**Active Press:**
```tsx
className="active:scale-[0.98] transition-transform duration-100"
```

**Focus Ring:**
```tsx
className="focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#a855f7,0_0_0_7px_rgba(168,85,247,0.25)]"
```

**Skeleton Loader:**
```tsx
<SkeletonCard />
```

**Toast Notification:**
```tsx
const { showSuccess } = useToast();
showSuccess("Operation successful", "Details here");
```

---

## Design Principles

1. **Subtlety**: Microinteractions should enhance, not distract
2. **Speed**: Most transitions should be 150–200ms
3. **Consistency**: Use tokens and shared patterns everywhere
4. **Accessibility**: Always respect `prefers-reduced-motion` and keyboard navigation
5. **Feedback**: Every interaction should provide clear visual feedback
6. **Performance**: Animate transform and opacity (GPU-accelerated), avoid animating layout properties

---

**Last Updated:** 2025-11-21  
**Version:** 1.0  
**Maintained By:** Frontend Team
