# Migration Guide - Old Components to New Design System

This guide helps you migrate from the old component patterns to the new premium design system.

---

## Import Changes

### Before:
```tsx
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
```

### After (using index exports):
```tsx
import { Card, Button, Input } from "../../components/ui";
```

---

## Component Updates

### Card

#### Before:
```tsx
<Card className="p-6">
  <h3 className="text-sm font-medium text-slate-200">Title</h3>
  <p className="text-slate-400">Content</p>
</Card>
```

#### After:
```tsx
<Card variant="elevated" className="p-6">
  <SectionTitle title="Title" />
  <p className="text-slate-400">Content</p>
</Card>
```

**Variants available:**
- `default`: Standard card
- `elevated`: More prominent
- `interactive`: Hover effects for clickable items
- `glass`: Translucent effect

---

### Button

#### Before:
```tsx
<button
  type="button"
  className="inline-flex items-center rounded-full bg-primary-500 px-4 py-2 text-sm text-white"
>
  Click me
</button>
```

#### After:
```tsx
<Button variant="primary" size="md">
  Click me
</Button>
```

**With icon:**
```tsx
<Button variant="primary" icon={<Plus className="h-4 w-4" />}>
  Add Item
</Button>
```

**Loading state:**
```tsx
<Button variant="primary" loading={isSubmitting}>
  Save
</Button>
```

---

### Page Headers

#### Before:
```tsx
<header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
  <div>
    <h2 className="text-2xl font-semibold tracking-tight text-slate-50">
      Dashboard
    </h2>
    <p className="mt-1 text-sm text-slate-400">
      Overview of your data
    </p>
  </div>
</header>
```

#### After:
```tsx
<PageHeader
  title="Dashboard"
  subtitle="Overview of your data"
  action={<Button>Action</Button>}
/>
```

---

### Section Titles

#### Before:
```tsx
<div>
  <h3 className="text-sm font-medium text-slate-200">
    Section Title
  </h3>
  <p className="mt-1 text-xs text-slate-400">
    Description
  </p>
</div>
```

#### After:
```tsx
<SectionTitle
  title="Section Title"
  subtitle="Description"
  action={<Button size="sm">Action</Button>}
/>
```

---

### Badges

#### Before:
```tsx
<span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase text-slate-300">
  Status
</span>
```

#### After:
```tsx
<Badge variant="default" size="sm">
  Status
</Badge>
```

**Semantic variants:**
```tsx
<Badge variant="success">Completed</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Overdue</Badge>
<Badge variant="primary">Active</Badge>
```

---

### Stat Display

#### Before:
```tsx
<Card className="p-4">
  <p className="text-xs text-slate-400">Current GPA</p>
  <p className="mt-2 text-3xl font-semibold text-slate-50">3.85</p>
</Card>
```

#### After:
```tsx
<StatBadge
  label="Current GPA"
  value="3.85"
  icon={<TrendingUp className="h-4 w-4" />}
  trend="up"
  trendValue="+0.15"
/>
```

---

### Loading States

#### Before:
```tsx
{loading && <p className="text-sm text-slate-400">Loading…</p>}
```

#### After:
```tsx
{loading ? <SkeletonCard /> : <Card>...</Card>}
```

**For lists:**
```tsx
{loading ? <SkeletonList count={5} /> : items.map(...)}
```

---

### Empty States

#### Before:
```tsx
{!items.length && (
  <p className="text-xs text-slate-500">
    No items yet. Add your first item to get started.
  </p>
)}
```

#### After:
```tsx
{!items.length && (
  <EmptyState
    icon={<Calendar className="h-8 w-8" />}
    title="No items yet"
    description="Add your first item to get started."
    action={<Button icon={<Plus />}>Add Item</Button>}
  />
)}
```

---

### Animations with Framer Motion

#### List Items:
```tsx
import { motion } from "framer-motion";

{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <Card>...</Card>
  </motion.div>
))}
```

#### Page-level animations:
```tsx
<motion.div
  className="space-y-6"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  {/* Page content */}
</motion.div>
```

---

## Color Token Updates

### Before:
```tsx
className="bg-slate-900/70 border-slate-800/80"
```

### After (using semantic tokens):
```tsx
className="card"  // or card-elevated, glass-strong
```

### Text colors:
- Error text: `text-red-400` → `text-danger-400`
- Success text: `text-emerald-400` → `text-success-400`
- Warning text: `text-yellow-400` → `text-warning-400`

---

## Layout Updates

### Responsive Grid

#### Before:
```tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
```

#### After (same, but consistent):
```tsx
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
```

**Use standard breakpoints:**
- Mobile: default
- Tablet: `sm:` and `md:`
- Desktop: `lg:` and `xl:`

---

## Input Fields

#### Before:
```tsx
<input
  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2"
  placeholder="Enter text"
/>
```

#### After:
```tsx
<Input
  label="Label"
  placeholder="Enter text"
  helperText="Optional helper text"
  icon={<Search className="h-4 w-4" />}
/>
```

**With validation:**
```tsx
<Input
  label="Email"
  type="email"
  error={errors.email}
/>
```

---

## Common Patterns

### Card with Section Title

```tsx
<Card variant="elevated">
  <SectionTitle
    title="Section Name"
    subtitle="Description"
    className="mb-4"
  />
  {/* Content */}
</Card>
```

### Interactive List Item

```tsx
<motion.div
  initial={{ opacity: 0, x: -10 }}
  animate={{ opacity: 1, x: 0 }}
  className="group flex items-center gap-3 rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 transition-smooth hover:bg-slate-900/60 hover:border-slate-700/80"
>
  <Icon className="h-5 w-5 text-slate-400 group-hover:text-primary-400" />
  <div className="flex-1">
    <p className="text-sm font-medium text-slate-100">{title}</p>
    <p className="text-xs text-slate-400">{subtitle}</p>
  </div>
  <Badge>{status}</Badge>
</motion.div>
```

### Stats Row

```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <StatBadge label="Metric 1" value="42" icon={<Icon1 />} />
  <StatBadge label="Metric 2" value="3.8" icon={<Icon2 />} />
  <StatBadge label="Metric 3" value="15" icon={<Icon3 />} />
</div>
```

---

## Tips

1. **Always use semantic components** instead of raw HTML + Tailwind classes
2. **Prefer primitives from `components/ui`** for consistency
3. **Use Framer Motion** for list and page animations
4. **Add empty states** to every data display
5. **Use skeleton loaders** for better perceived performance
6. **Maintain consistent spacing**: `space-y-6` for major sections, `space-y-4` within cards
7. **Test responsive behavior** at all breakpoints

---

## Checklist for New Pages

- [ ] Use `PageHeader` for page title
- [ ] Use `Card` variants for content sections
- [ ] Add `SectionTitle` for major sections within cards
- [ ] Implement loading states with skeletons
- [ ] Implement empty states with icons and actions
- [ ] Add Framer Motion animations for list items
- [ ] Use semantic color tokens (danger, success, warning)
- [ ] Test mobile, tablet, and desktop layouts
- [ ] Verify keyboard navigation and focus states
- [ ] Check color contrast for accessibility

