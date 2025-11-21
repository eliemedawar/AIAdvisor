# Component Library Documentation

Complete reference for the AI Academic Advisor reusable component library.

All components follow the **8-point spacing grid** and **design system tokens** defined in `DESIGN_SYSTEM.md`.

---

## Table of Contents

1. [Layout Components](#layout-components)
2. [Typography](#typography)
3. [Form Components](#form-components)
4. [Structural Components](#structural-components)
5. [Navigation](#navigation)
6. [Overlays](#overlays)
7. [Feedback Components](#feedback-components)

---

## Layout Components

### PageShell

Consistent page layout wrapper enforcing responsive padding and max-width.

**Props:**
- `children: ReactNode` - Page content
- `narrow?: boolean` - Apply tighter max-width (3xl vs 7xl)
- `className?: string` - Additional classes

**Usage:**
```tsx
import { PageShell } from "../../components";

<PageShell>
  <PageSection>
    {/* Your content */}
  </PageSection>
</PageShell>
```

**Spacing:**
- Padding: `px-4 py-6` (mobile) → `px-6` (tablet) → `px-8 py-8` (desktop)
- Max-width: `max-w-7xl` (default) or `max-w-3xl` (narrow)

---

### PageSection

Vertical rhythm container with consistent spacing between sections.

**Props:**
- `children: ReactNode` - Section content
- `className?: string` - Additional classes

**Usage:**
```tsx
<PageSection>
  <Heading level="h1">Dashboard</Heading>
  <Card>...</Card>
</PageSection>
```

**Spacing:**
- Vertical gap: `space-y-6` (mobile) → `space-y-8` (desktop)

---

## Typography

### Heading

Semantic heading component with responsive typography following design system.

**Props:**
- `level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"` - Semantic level (default: `h2`)
- `styleAs?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"` - Visual style override
- `children: ReactNode` - Content
- `className?: string` - Additional classes

**Usage:**
```tsx
import { Heading } from "../../components";

<Heading level="h1">Dashboard</Heading>
<Heading level="h2" styleAs="h3">Smaller H2</Heading>
```

**Typography:**
- Automatically applies **Sora** font, semibold weight, tight tracking
- Responsive sizing per design system (mobile → tablet → desktop)

---

### Text

Body text component with consistent sizing and color variants.

**Props:**
- `variant?: "body" | "small" | "subtitle" | "caption"` - Size variant
- `color?: "primary" | "secondary" | "muted" | "disabled"` - Color variant
- `as?: "p" | "span" | "div" | "label"` - Render element
- `children: ReactNode` - Content
- `className?: string` - Additional classes

**Usage:**
```tsx
<Text>Default body text</Text>
<Text variant="small" color="muted">Helper text</Text>
<Text variant="subtitle">Large subtitle</Text>
```

---

### Overline

Small uppercase label text for categories/sections.

**Props:**
- `children: ReactNode` - Content
- `className?: string` - Additional classes

**Usage:**
```tsx
<Overline>Statistics</Overline>
```

---

## Form Components

All form components use shared `FormFieldWrapper` for consistent label, helper, and error display with **8pt spacing**.

### Input

Text input with label, helper text, error states, and optional icon.

**Props:**
- `label?: string` - Field label
- `helperText?: ReactNode` - Helper/description text
- `error?: string` - Error message
- `icon?: ReactNode` - Left icon
- `required?: boolean` - Required field indicator
- ...`InputHTMLAttributes<HTMLInputElement>`

**Usage:**
```tsx
import { Input } from "../../components";

<Input 
  label="Email" 
  type="email"
  error={errors.email}
  helperText="Your university email"
  icon={<Mail className="h-4 w-4" />}
  required
/>
```

**Spacing:**
- Wrapper: `space-y-2`
- Padding: `px-4 py-2.5`

---

### Select

Dropdown select with consistent styling.

**Props:**
- `label?: string` - Field label
- `helperText?: ReactNode` - Helper text
- `error?: string` - Error message
- `required?: boolean` - Required field indicator
- `children: ReactNode` - `<option>` elements
- ...`SelectHTMLAttributes<HTMLSelectElement>`

**Usage:**
```tsx
<Select label="Major" error={errors.major}>
  <option value="">Select...</option>
  <option value="cs">Computer Science</option>
</Select>
```

---

### Textarea

Multi-line text input.

**Props:**
- `label?: string` - Field label
- `helperText?: ReactNode` - Helper text
- `error?: string` - Error message
- `required?: boolean` - Required field indicator
- `rows?: number` - Row count (default: 4)
- ...`TextareaHTMLAttributes<HTMLTextAreaElement>`

**Usage:**
```tsx
<Textarea 
  label="Notes" 
  rows={4}
  placeholder="Enter your notes..."
/>
```

**Spacing:**
- Min height: `min-h-[5rem]` (80px)
- Padding: `px-4 py-2.5`

---

### Button

Primary interactive component with variants and sizes.

**Props:**
- `variant?: "primary" | "secondary" | "ghost" | "outline" | "danger"` - Visual style
- `size?: "sm" | "md" | "lg"` - Size variant
- `loading?: boolean` - Show loading spinner
- `icon?: ReactNode` - Icon element
- `children: ReactNode` - Button text
- ...`ButtonHTMLAttributes<HTMLButtonElement>`

**Usage:**
```tsx
<Button variant="primary" size="md" icon={<Plus />}>
  Add Item
</Button>
<Button loading={isSubmitting}>Save</Button>
```

**Sizes (8pt spacing):**
- `sm`: `px-3 py-2 text-xs gap-2`
- `md`: `px-4 py-2.5 text-sm gap-2`
- `lg`: `px-6 py-3 text-base gap-2.5`

---

## Structural Components

### Card

Container component with multiple variants and padding options.

**Props:**
- `variant?: "default" | "elevated" | "inset" | "interactive" | "glass"` - Visual style
- `padding?: "none" | "sm" | "md" | "lg"` - Padding size
- `children: ReactNode` - Content
- ...`HTMLAttributes<HTMLDivElement>`

**Usage:**
```tsx
<Card variant="elevated" padding="md">
  Content
</Card>
<Card variant="interactive" onClick={handleClick}>
  Clickable card
</Card>
```

**Padding (8pt scale):**
- `none`: `p-0`
- `sm`: `p-4` (16px)
- `md`: `p-6` (24px)
- `lg`: `p-8` (32px)

---

### SectionHeader

Consistent section heading with optional action button.

**Props:**
- `title: string` - Section title
- `subtitle?: string` - Description text
- `action?: ReactNode` - Action button/element
- `small?: boolean` - Use h3 instead of h2
- `className?: string` - Additional classes

**Usage:**
```tsx
<SectionHeader 
  title="Upcoming Deadlines"
  subtitle="Next 7 days"
  action={<Button size="sm">View All</Button>}
/>
```

---

### StatCard

Dashboard KPI display card.

**Props:**
- `label: string` - Stat label
- `value: string | number` - Stat value
- `icon?: ReactNode` - Icon element
- `trend?: "up" | "down" | "neutral"` - Trend indicator
- `trendValue?: string` - Trend value text
- `className?: string` - Additional classes

**Usage:**
```tsx
<StatCard 
  label="Current GPA"
  value="3.85"
  icon={<TrendingUp className="h-4 w-4" />}
  trend="up"
  trendValue="+0.15"
/>
```

**Spacing:**
- Padding: `p-4`
- Internal gap: `gap-3`

---

### Avatar

User profile image or initial display.

**Props:**
- `text?: string` - Display text (initials)
- `src?: string` - Image URL
- `alt?: string` - Image alt text
- `size?: "xs" | "sm" | "md" | "lg" | "xl"` - Size variant
- `children?: ReactNode` - Custom content
- `className?: string` - Additional classes

**Usage:**
```tsx
<Avatar text="JD" size="md" />
<Avatar src="/profile.jpg" alt="John Doe" />
```

**Sizes:**
- `xs`: `h-6 w-6`
- `sm`: `h-8 w-8`
- `md`: `h-10 w-10`
- `lg`: `h-12 w-12`
- `xl`: `h-16 w-16`

---

### Badge & Chip

Status indicators and removable tags.

**Badge Props:**
- `variant?: "default" | "primary" | "success" | "warning" | "danger" | "accent" | "info"`
- `size?: "sm" | "md"`
- `pill?: boolean` - Fully rounded
- `children: ReactNode`

**Chip Props:**
- `onRemove?: () => void` - Remove handler
- `children: ReactNode`
- `className?: string`

**Usage:**
```tsx
<Badge variant="success">Completed</Badge>
<Badge variant="warning" pill>Pending</Badge>
<Chip onRemove={() => removeTag('react')}>React</Chip>
```

---

## Navigation

### SidebarNavItem

Navigation link for sidebar with active state.

**Props:**
- `to: string` - Route path
- `label: string` - Link text
- `icon: ReactNode` - Icon element
- `onClick?: () => void` - Click handler

**Usage:**
```tsx
<SidebarNavItem 
  to="/dashboard"
  label="Dashboard"
  icon={<LayoutDashboard className="h-5 w-5" />}
/>
```

**Spacing:**
- Padding: `px-3 py-2.5`
- Gap: `gap-3`

---

## Overlays

### Modal

Overlay dialog component with backdrop.

**Props:**
- `isOpen: boolean` - Visibility state
- `onClose: () => void` - Close handler
- `title?: string` - Modal title
- `children: ReactNode` - Modal content
- `footer?: ReactNode` - Footer actions
- `size?: "sm" | "md" | "lg" | "xl"` - Size variant
- `disableBackdropClose?: boolean` - Disable backdrop click close
- `className?: string` - Additional classes

**Usage:**
```tsx
<Modal 
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit Profile"
  footer={<Button onClick={save}>Save</Button>}
>
  <form>...</form>
</Modal>
```

**Features:**
- ESC key closes modal
- Prevents body scroll when open
- Portal-rendered to `document.body`

---

### Toast

Temporary notification component.

**Props:**
- `isOpen: boolean` - Visibility state
- `onClose: () => void` - Close handler
- `message: string` - Toast message
- `description?: string` - Additional description
- `variant?: "success" | "error" | "warning" | "info"` - Visual variant
- `duration?: number` - Auto-dismiss duration (ms, 0 to disable)

**Usage:**
```tsx
<Toast 
  isOpen={showToast}
  onClose={() => setShowToast(false)}
  message="Profile updated"
  variant="success"
  duration={5000}
/>
```

**Features:**
- Auto-dismisses after duration
- Portal-rendered to `document.body`
- Positioned top-right on desktop, bottom-center on mobile

---

## Feedback Components

### EmptyState

Display for empty data states.

**Props:**
- `icon?: ReactNode` - Icon element
- `title: string` - Empty state title
- `description?: string` - Description text
- `action?: ReactNode` - Action button
- `className?: string` - Additional classes

**Usage:**
```tsx
<EmptyState
  icon={<Calendar className="h-8 w-8" />}
  title="No events scheduled"
  description="Add your first event to get started."
  action={<Button>Add Event</Button>}
/>
```

**Spacing:**
- Padding: `py-16`
- Icon margin: `mb-4`
- Action margin: `mt-6`

---

### Skeleton Components

Loading placeholder components.

**Available:**
- `Skeleton` - Generic skeleton with custom sizing
- `SkeletonText` - Text line skeleton
- `SkeletonCard` - Full card skeleton
- `SkeletonList` - List of items skeleton
- `SkeletonAvatar` - Avatar circle skeleton

**Usage:**
```tsx
<Skeleton className="h-4 w-32" />
<SkeletonCard />
<SkeletonList count={5} />
```

---

## Import Patterns

All components are exported from the centralized index:

```tsx
// Single import for multiple components
import {
  PageShell,
  PageSection,
  Heading,
  Text,
  Card,
  Button,
  Input,
  SectionHeader,
  StatCard,
  Badge,
  Avatar,
  Modal,
  Toast,
  EmptyState,
  Skeleton,
} from "../../components";
```

---

## Design Tokens Reference

All components use tokens from `src/styles/design-tokens.ts`:

- **Spacing**: 8pt grid (4px base unit)
- **Typography**: Sora (headings) + Inter (body)
- **Colors**: Deep Sapphire Blue (primary), Electric Purple (accent), Teal (secondary)
- **Border Radius**: `rounded-xl` (20px) for buttons, `rounded-2xl` (24px) for cards
- **Shadows**: Layered system with glow effects

See `DESIGN_SYSTEM.md` for complete specifications.

---

## Best Practices

1. **Always use PageShell** for page layouts to ensure consistent spacing
2. **Prefer Typography components** over raw HTML elements (`<Heading>` vs `<h1>`)
3. **Use 8pt spacing** - only use values from the scale (0, 1, 2, 3, 4, 6, 8, 10, 12, 16, 20)
4. **Leverage form components** for consistent error/helper text display
5. **Use StatCard** for dashboard metrics instead of custom markup
6. **Apply semantic variants** - use `danger` for destructive actions, `success` for positive feedback
7. **Keep padding consistent** - use Card `padding` prop rather than custom classes

---

**Maintained by**: Frontend Team  
**Last Updated**: November 2024  
**Related**: `DESIGN_SYSTEM.md`, `src/styles/design-tokens.ts`

