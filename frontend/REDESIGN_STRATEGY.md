# AIAdvisor Frontend Redesign Strategy

## Design Philosophy: Modern, Professional, AI-Forward

The redesign embraces a **clean, minimalist aesthetic** inspired by contemporary SaaS platforms like Linear, Notion, and Vercel. The goal is to create an interface that feels premium, intentional, and deeply functional—where every visual element serves a purpose.

### Core Design Principles

1. **Clarity Over Decoration**: Remove visual noise. Use whitespace strategically to guide attention.
2. **Hierarchy Through Contrast**: Employ typography, color, and spacing to establish clear information hierarchy.
3. **Purposeful Motion**: Animations enhance usability, not distract. Transitions feel responsive and natural.
4. **Accessibility First**: Ensure WCAG AA compliance. All interactive elements have clear focus states and sufficient contrast.
5. **Consistency Across Contexts**: Maintain unified design language across auth, dashboard, chat, calendar, planner, and profile pages.

---

## Color System

### Primary Palette
- **Sapphire Blue** (`#0d5eff`): Primary brand color for CTAs, links, and key actions. Conveys trust and professionalism.
- **Electric Purple** (`#a855f7`): Accent for AI-related elements, highlights, and secondary CTAs. Signals innovation and intelligence.
- **Teal** (`#14b8a6`): Success states, progress indicators, and positive feedback.

### Semantic Colors
- **Success**: Teal (`#14b8a6`)
- **Warning**: Amber (`#f59e0b`)
- **Error**: Red (`#ef4444`)
- **Info**: Sapphire Blue (`#0d5eff`)

### Neutral Palette (Dark Theme)
- **Background**: `#020617` (near-black for depth)
- **Surface Base**: `#0f172a` (elevated surfaces)
- **Surface Elevated**: `#1e293b` (cards, popovers)
- **Text Primary**: `#f1f5f9` (high contrast)
- **Text Secondary**: `#cbd5e1` (muted, readable)
- **Border**: `rgba(51, 65, 85, 0.6)` (subtle separation)

---

## Typography System

### Font Pairing
- **Display**: Sora (headings, h1-h4) — Modern, geometric, distinctive
- **Body**: Inter (body text, UI labels) — Highly legible, neutral
- **Mono**: JetBrains Mono (code, technical content) — Professional monospace

### Type Scale (Responsive)
- **H1 (Page Title)**: 3rem (desktop) / 2rem (mobile) — Bold, commanding presence
- **H2 (Section Title)**: 2.25rem (desktop) / 1.75rem (mobile) — Clear section breaks
- **H3 (Subsection)**: 2rem (desktop) / 1.5rem (mobile) — Nested hierarchy
- **H4 (Card Header)**: 1.5rem (desktop) / 1.25rem (mobile) — Prominent card titles
- **Body**: 1rem (desktop) / 0.875rem (mobile) — Default reading text
- **Small**: 0.875rem (desktop) / 0.75rem (mobile) — Secondary information
- **Micro**: 0.75rem — Timestamps, labels, metadata

### Weight Distribution
- **Semibold (600)**: Headings, emphasis, important labels
- **Medium (500)**: Button text, form labels, secondary emphasis
- **Normal (400)**: Body text, descriptions, default UI text

---

## Component Design Patterns

### Buttons
- **Primary**: Sapphire blue background, white text, rounded corners (8px), elevation on hover
- **Secondary**: Transparent background, text color, border on hover
- **Tertiary**: Ghost button, minimal styling, text-only
- **States**: Hover (lighter shade), active (darker shade), disabled (muted), loading (spinner)

### Cards
- **Base Card**: `#0f172a` background, `rgba(51, 65, 85, 0.6)` border, 12px radius, elevation-low shadow
- **Elevated Card**: `#1e293b` background, used for hover states and popovers
- **Spacing**: 24px padding (desktop), 16px padding (mobile)

### Input Fields
- **Background**: `#1e293b` (elevated surface)
- **Border**: `rgba(51, 65, 85, 0.6)` (default), `#a855f7` (focus)
- **Focus Ring**: 2px purple outline + 7px glow (25% opacity)
- **Placeholder**: `#64748b` (slate-500)

### Chat Interface
- **User Message**: Sapphire blue background, right-aligned, rounded corners
- **AI Message**: Surface elevated background, left-aligned, rounded corners
- **Typing Indicator**: Three animated dots with subtle scale animation
- **Message Grouping**: Date separators with muted text

### Charts
- **Primary Line**: Sapphire blue (`#5b91fa`)
- **Secondary Line**: Electric purple (`#c084fc`)
- **Grid**: `rgba(148, 163, 184, 0.12)` (very subtle)
- **Axis Labels**: `#94a3b8` (slate-400)

---

## Layout & Spacing

### Spacing Scale (8pt system)
- **xs**: 4px — Tight spacing between elements
- **sm**: 8px — Compact component spacing
- **md**: 16px — Default spacing
- **lg**: 24px — Section spacing
- **xl**: 32px — Major section breaks
- **2xl**: 48px — Page-level spacing

### Responsive Breakpoints
- **Mobile**: < 640px (full-width, single column)
- **Tablet**: 640px - 1024px (2-column layouts)
- **Desktop**: 1024px+ (multi-column, sidebar visible)

### Page Shell
- **Mobile**: 16px horizontal padding
- **Tablet**: 24px horizontal padding
- **Desktop**: 32px horizontal padding, max-width 1280px

---

## Motion & Interactions

### Animation Durations
- **Quick**: 120ms (micro-interactions, hover effects)
- **Base**: 160ms (standard transitions, state changes)
- **Slow**: 240ms (complex animations, page transitions)
- **Slower**: 320ms (extended animations, large movements)

### Easing Functions
- **Snappy**: `cubic-bezier(0.25, 1, 0.5, 1)` — Hover states, quick feedback
- **Smooth**: `cubic-bezier(0.4, 0, 0.2, 1)` — Balanced transitions
- **Enter**: `cubic-bezier(0, 0, 0.2, 1)` — Entrance animations
- **Exit**: `cubic-bezier(0.4, 0, 1, 1)` — Exit animations

### Common Animations
- **Fade In**: Opacity 0 → 1 over 240ms
- **Slide In**: Transform translateY/X with opacity over 240ms
- **Scale**: Scale 0.95 → 1 with opacity over 160ms
- **Pulse**: Subtle scale pulse for loading states

---

## Page-Specific Design Directions

### Auth Pages (Sign In / Sign Up)
- **Hero Background**: Animated gradient with floating orbs (primary + accent colors)
- **Card**: Centered, max-width 420px, elevated shadow, subtle border
- **Form Fields**: Stacked vertically, clear labels, inline validation
- **CTA**: Full-width primary button with loading state
- **Micro-copy**: Supportive, friendly tone ("Smart planning. Better semesters.")

### Dashboard
- **Header**: Page title + quick stats (GPA, upcoming deadlines)
- **Grid Layout**: 2-column on desktop, 1-column on mobile
- **Cards**: GPA trend chart, weekly tasks, study time by course
- **Insights**: Color-coded badges (high/medium/low priority)
- **Empty States**: Encouraging copy + action button

### Chat (AI Advisor)
- **Header**: "AI Advisor" title + clear/view-context buttons
- **Message Thread**: Scrollable, date-grouped, auto-scroll to bottom
- **Message Bubbles**: User (right, blue) vs AI (left, elevated surface)
- **Input Bar**: Sticky at bottom, text area with send button + attach context
- **Context Sidebar**: Desktop-only, shows attached context cards
- **Typing Indicator**: Three dots with staggered animation

### Calendar
- **Toolbar**: Month/week/agenda view switcher
- **Month View**: Grid layout with event indicators
- **Week View**: Time-based columns with event blocks
- **Agenda View**: List of upcoming events, mobile-optimized
- **Day Panel**: Detailed view of selected day's events
- **Event Colors**: Exam (red), assignment (blue), study session (purple), other (gray)

### Planner
- **Sections**: Courses, assignments, tasks
- **Course Cards**: Major, year, target GPA, edit action
- **Assignment List**: Toggleable done/pending, animated rows
- **Task List**: Checkbox, priority indicator, edit/delete actions
- **Empty State**: Encouraging message + add button

### Profile
- **Header**: Avatar, name, email, status badge
- **Stats Grid**: Current GPA, major, year
- **Edit Form**: Academic information (major, year, target GPA)
- **Study Style**: Read-only info box

---

## Accessibility & Responsive Design

### Focus Management
- **Focus Ring**: 2px purple outline + 7px glow (25% opacity)
- **Keyboard Navigation**: Tab order follows visual hierarchy
- **Skip Links**: "Skip to content" link for keyboard users
- **ARIA Labels**: All interactive elements have descriptive labels

### Responsive Behavior
- **Mobile First**: Design starts at 320px, scales up
- **Sidebar**: Hidden on mobile, collapsible on tablet, expanded on desktop
- **Navigation**: Mobile drawer overlay, desktop fixed sidebar
- **Charts**: Responsive font sizes, simplified on mobile
- **Forms**: Full-width on mobile, constrained on desktop

### Motion Preferences
- **Reduced Motion**: Respect `prefers-reduced-motion` media query
- **Instant Transitions**: 0ms duration for users who prefer reduced motion
- **Fallback States**: All animations have non-animated alternatives

---

## Implementation Notes

### Preserved Elements
- All API contracts and backend integration remain unchanged
- Routing structure (`/auth/sign-in`, `/dashboard`, `/chat`, etc.) stays intact
- Auth context and JWT token handling unchanged
- All hooks (`useAdvisorChat`, `useDashboard`, `useCalendarEvents`, etc.) remain functional
- Existing component props and interfaces preserved where possible

### New/Modified Components
- **Sidebar**: Redesigned with modern styling, collapse animation
- **TopBar**: Refined header with deadline reminders, profile menu
- **Chat Interface**: Modern message bubbles, improved input bar, context sidebar
- **Dashboard Cards**: Enhanced chart styling, better data visualization
- **Calendar Views**: Cleaner event layout, better mobile experience
- **Forms**: Improved validation feedback, better error states

### Color Token Usage
- Tailwind config already includes all custom colors (primary, accent, secondary, semantic)
- Design tokens in `design-tokens.ts` provide semantic meaning
- Use semantic colors (success, warning, error, info) for consistency
- Avoid hardcoding hex values; always use Tailwind classes

---

## Success Metrics

1. **Visual Consistency**: All pages follow the same design language
2. **Performance**: No regressions in page load or interaction responsiveness
3. **API Integrity**: All backend calls work identically to original
4. **Accessibility**: WCAG AA compliance maintained
5. **Responsiveness**: Seamless experience across mobile, tablet, desktop
6. **User Experience**: Smooth animations, clear feedback, intuitive navigation

