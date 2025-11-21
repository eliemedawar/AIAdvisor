# Calendar UX Documentation

## Overview

The AI Academic Advisor calendar is a rich, interactive academic planner designed for modern productivity. It provides three complementary views (Month, Week, Agenda) with seamless transitions, hover previews, and responsive layouts optimized for both desktop and mobile experiences.

---

## Views

### Month View

**Purpose:** High-level overview of events across an entire month.

**Layout:**
- 6-week grid (42 cells) for consistent height
- Days outside current month shown with reduced opacity
- Sunday-Saturday week starts
- Subtle grid lines and 8pt spacing rhythm

**Day Cell States:**
- **Today:** Primary blue border/background with glow, white number badge
- **Selected:** Accent purple border/background with ring
- **Past Days:** Reduced opacity (60%), muted colors
- **Future Days:** Default slate background, hover lift effect
- **Has Events:** Shows up to 2 event badges + overflow count
- **Empty Days:** Hover reveals "+ Add event" affordance (non-past days only)

**Interactions:**
- **Click:** Opens day details panel (desktop) or modal (mobile)
- **Hover:** Shows floating preview card with up to 3 events
- **Keyboard:** Focus ring on Tab, Enter/Space to activate

### Week View

**Purpose:** Focused view of a single week with expanded event details.

**Layout:**
- Vertical stacks of events per day (desktop: 7 columns, mobile: 1 column)
- Day header with weekday abbreviation and large date number
- Time-based event ordering
- Category-colored event cards

**Day Card States:**
- **Today:** Primary border with glow
- **Past Days:** Reduced opacity with hover fade-in
- **Future Days:** Default styling with hover shadow

**Interactions:**
- **Click:** Opens day details panel/modal
- **Auto-scroll:** Current day centered on load

### Agenda View

**Purpose:** Chronological list of upcoming events (mobile-optimized).

**Layout:**
- Scrollable list grouped by date
- Relative date labels (Today, Tomorrow, or formatted date)
- Event cards with full details: time, location, description
- Automatic filtering to show only current/future events

**Empty State:**
- Helpful message encouraging users to add events
- "Add Your First Event" CTA button
- Tips for keeping calendar updated

**Interactions:**
- **Scroll:** Smooth vertical scroll with snap points
- **Click Event:** View full event details (future enhancement)

---

## Component Architecture

### CalendarPage
**Location:** `src/pages/calendar/CalendarPage.tsx`

**Responsibilities:**
- View mode state management (month/week/agenda)
- Auto-switch to agenda on mobile breakpoint
- Date navigation (previous/next month or week)
- Event loading and grouping via `useCalendarEvents`
- Day selection and panel/modal orchestration

**State:**
- `currentDate`: Date - Current month/week being viewed
- `viewMode`: ViewMode - Active view (month/week/agenda)
- `selectedDate`: Date - Selected day for details panel
- `isPanelOpen`: boolean - Details panel visibility

### CalendarToolbar
**Location:** `src/components/calendar/CalendarToolbar.tsx`

**Features:**
- Month/year display with navigation arrows
- "Today" shortcut button
- View mode switcher (month/week/agenda)
- Responsive layout (vertical on mobile)

### MonthGrid
**Location:** `src/components/calendar/MonthGrid.tsx`

**Features:**
- Renders 6-week grid from `buildMonthGrid` utility
- Day cell animations with staggered delays
- Hover preview integration
- Event indicators with category colors
- Empty day "+ Add event" affordance
- Overflow dots for events beyond visible limit

### WeekView
**Location:** `src/components/calendar/WeekView.tsx`

**Features:**
- Responsive grid (7 cols desktop, 1 col mobile)
- Day cards with event stacks
- Category-colored event indicators
- Time range display

### AgendaView
**Location:** `src/components/calendar/AgendaView.tsx`

**Features:**
- Grouped by date with relative labels
- Filtered to show only upcoming events
- Empty state with guidance
- Helpful tip for sparse calendars

### DayDetailsPanel
**Location:** `src/components/calendar/DayDetailsPanel.tsx`

**Features:**
- Slide-in animation from right (desktop)
- Event list with quick actions (View, Complete)
- "Add Event" CTA in header
- Empty state when no events scheduled
- Backdrop blur and click-outside-to-close

### DayHoverPreview
**Location:** `src/components/calendar/DayHoverPreview.tsx`

**Features:**
- Floating card above hovered day
- Shows up to 3 events with time ranges
- Overflow count indicator
- Respects reduced motion preferences
- Auto-positioned relative to day cell

### EventIndicator
**Location:** `src/components/calendar/EventIndicator.tsx`

**Features:**
- Compact and full display modes
- Category color system (dot, border, background)
- Time range display
- Optional location display
- Truncated title with tooltip

---

## Event Categories & Colors

Events are automatically categorized based on their `type` field:

| Category       | Trigger Keywords           | Color    | Hex       |
|----------------|----------------------------|----------|-----------|
| **Exam**       | exam, test, quiz           | Red      | #ef4444   |
| **Assignment** | assignment, homework, project | Primary Blue | #0d5eff |
| **Study Session** | study, review           | Accent Purple | #a855f7 |
| **Class**      | class, lecture, lab        | Teal     | #14b8a6   |
| **Other**      | (default)                  | Slate    | #64748b   |

**Visual Application:**
- **Dot:** Solid category color (used in compact indicators)
- **Background:** 20% opacity category color
- **Border:** 40% opacity category color
- **Text:** 200-shade of category color

---

## Responsive Behavior

### Breakpoints
- **Mobile:** < 768px (md)
- **Tablet:** 768px - 1024px (md to lg)
- **Desktop:** ≥ 1024px (lg+)

### Adaptive Layouts

**Mobile (< 768px):**
- **Auto View:** Agenda view (overridable)
- **Day Details:** Modal overlay
- **Week View:** Single column vertical stack
- **Toolbar:** Vertical layout with stacked controls

**Tablet (768px - 1024px):**
- **Default View:** User's last selection
- **Day Details:** Modal overlay
- **Week View:** 7-column grid

**Desktop (≥ 1024px):**
- **Default View:** Month view
- **Day Details:** Slide-in panel (right side)
- **Hover Previews:** Enabled (disabled on touch devices)
- **Week View:** 7-column grid with expanded spacing

---

## Interactions & States

### Hover Interactions

**Month View Day Cells:**
1. **Hover** → Border brightens, shadow increases
2. **With Events** → Floating preview appears (200ms delay)
3. **Empty + Future** → "+ Add event" affordance fades in

**Week View Day Cards:**
1. **Hover** → Shadow elevation, opacity increase (past days)

**Buttons & Controls:**
1. **Hover** → Background tint, icon/text color brightens
2. **Active Press** → Scale down to 98%

### Click Interactions

**Day Cell Click:**
1. Day selection state applied
2. Day details panel/modal opens
3. Event list loaded for selected date
4. Panel animates in (slide or fade)

**Navigation Arrows:**
- **Month View:** Previous/next month
- **Week View:** Previous/next week
- **Smooth** date transition, grid re-renders with animation

**"Today" Button:**
- Jumps to current date
- Selects today's date
- Scroll/focus on current day cell

**View Mode Switcher:**
- Instant view mode change
- Crossfade transition (200ms)
- Preserve date context

**"Add Event" Button:**
- Opens event creation form (placeholder)
- Pre-fills with selected date (if any)

### Keyboard Navigation

**Tab Navigation:**
- Sequential focus through interactive elements
- Day cells focusable in grid order
- Visible focus ring (accent purple)

**Arrow Keys (Future Enhancement):**
- Navigate between day cells in month grid
- Move between days in week view

**Enter/Space:**
- Activate focused day cell
- Trigger focused button/control

**Escape:**
- Close day details panel/modal
- Clear selection

---

## Empty States

### No Events Overall

**Location:** CalendarPage (when `events.length === 0`)

**Display:**
- Calendar icon
- Title: "No events scheduled"
- Description: "Start planning your academic schedule by adding events and deadlines."
- CTA: "Add Your First Event" button

### No Events on Selected Day

**Location:** DayDetailsPanel / Mobile Modal

**Display:**
- Plus icon
- Title: "No events scheduled"
- Description: "Add an event to [relative date] to keep your schedule organized."
- CTA: "Add Event" button

### No Upcoming Events (Agenda)

**Location:** AgendaView

**Display:**
- Calendar icon
- Title: "No upcoming events"
- Description: "Start planning your academic schedule by adding events and deadlines."
- CTA: "Add Your First Event" button

### Sparse Calendar Tip (Agenda)

**Location:** AgendaView (when `events.length < 3`)

**Display:**
- Subtle info box at end of list
- Text: "Keep your calendar updated to stay on top of deadlines and exams."

---

## Animation & Motion

### Animation Principles
- **Duration:** 150-200ms for standard transitions
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` for balanced motion
- **Stagger:** 8ms delay between day cells (month grid)
- **Reduced Motion:** Respect `prefers-reduced-motion` media query

### Key Animations

**Month Grid Load:**
- Day cells: Fade + scale up (0.95 → 1)
- Staggered delay based on index (0-336ms total)

**View Transitions:**
- Crossfade: Outgoing view fades + slides up (-10px)
- Incoming view fades + slides from below (+10px)
- Duration: 200ms

**Day Details Panel:**
- Slide in from right (100% → 0)
- Spring physics: `damping: 25, stiffness: 300`
- Backdrop fade (0 → 1)

**Hover Preview:**
- Fade + slight lift (-5px)
- Scale up (0.96 → 1)
- Duration: 150ms

**Event Indicators:**
- Fade + slide from left (-5px → 0)
- Individual delays for smooth cascade effect

---

## Accessibility

### WCAG Compliance
- **Color Contrast:** AA-rated text/background ratios
- **Focus Indicators:** 2px accent purple ring + 6-8px glow
- **Keyboard Navigation:** All interactive elements reachable
- **Screen Readers:** Semantic HTML, ARIA labels where needed

### Focus Management
- Trap focus in modal/panel when open
- Restore focus to triggering element on close
- Skip links for quick navigation (future enhancement)

### Motion Preferences
- All animations disabled when `prefers-reduced-motion: reduce`
- Crossfades become instant opacity transitions
- No scale, translate, or spring animations

### Touch Targets
- Minimum 44×44px touch areas
- Adequate spacing between interactive elements
- No hover-only affordances on touch devices

---

## Data Flow

### Event Loading
1. `useCalendarEvents` hook fetches from API on mount
2. Events grouped by date (`yyyy-MM-dd`) into Map
3. Map passed to view components via props
4. Components retrieve events for each day as needed

### Date Utilities
**Location:** `src/utils/calendar.ts`

**Key Functions:**
- `buildMonthGrid(date, selectedDate)` → CalendarDay[][]
- `buildWeekView(date, selectedDate)` → CalendarDay[]
- `groupEventsByDate(events)` → Map<string, CalendarEvent[]>
- `inferEventCategory(type)` → EventCategory
- `formatRelativeDate(date)` → "Today" | "Tomorrow" | formatted
- `formatTimeRange(start, end)` → "9:00 AM - 10:30 AM"

### State Management
- Local component state for UI (hover, selection)
- Shared state via context (future enhancement)
- API state via custom hooks (`useCalendarEvents`)

---

## Future Enhancements

### Planned Features
- **Event Creation:** Full CRUD for calendar events
- **Drag & Drop:** Move events between days
- **Multi-Day Events:** Spanning cells in month view
- **Recurring Events:** Weekly classes, etc.
- **Reminders:** Push notifications before events
- **Search & Filter:** Find events by keyword, category
- **Export:** iCal, Google Calendar sync
- **Color Customization:** User-defined category colors
- **Dark/Light Mode:** Theme switcher (currently dark-first)

### Known Limitations
- No backend API for event creation (placeholder handlers)
- No event editing from details panel
- No conflict detection for overlapping events
- Limited to 42-day month grids (trailing/leading days)

---

## Testing Guidelines

### Manual Testing Checklist
- [ ] Month view loads with current month
- [ ] Day cells show correct state indicators
- [ ] Hover preview appears on event days
- [ ] Click day opens details panel/modal
- [ ] Week view shows correct week
- [ ] Agenda view filters upcoming events
- [ ] View transitions are smooth
- [ ] Responsive layouts adapt correctly
- [ ] Empty states display properly
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Reduced motion respected

### Edge Cases
- **No Events:** Empty state guidance
- **Single Event:** No overflow indicators
- **Many Events:** Overflow dots and preview truncation
- **Past-Heavy Calendar:** Agenda view may be empty
- **Month Boundaries:** Leading/trailing days render correctly
- **Leap Years:** February displays 29 days

---

## Design Tokens Reference

### Spacing
- **Gap between cells:** 8px (`gap-2`)
- **Cell padding:** 12px (`p-3`)
- **Component margin:** 24px (`mb-6`)

### Border Radius
- **Day cells:** 12px (`rounded-xl`)
- **Event badges:** 8px (`rounded-lg`)
- **Buttons:** 8px (`rounded-lg`)

### Typography
- **Day numbers:** 14px semibold
- **Month/year:** 20px semibold
- **Event titles:** 10px medium (compact), 14px semibold (full)
- **Descriptions:** 12px regular

### Shadows
- **Day cell hover:** `shadow-md`
- **Details panel:** `shadow-2xl`
- **Hover preview:** `shadow-2xl`
- **Today glow:** `shadow-glow` (custom primary)

---

## Maintenance Notes

### Adding New Event Categories
1. Update `EventCategory` type in `calendar.ts`
2. Add color mapping to `categoryStyles` object
3. Update category detection logic in `inferEventCategory`
4. Document in this file's category table

### Modifying View Layouts
- Month grid: Edit `MonthGrid.tsx`, adjust `gap-` classes
- Week columns: Edit `WeekView.tsx` responsive classes
- Agenda grouping: Modify `AgendaView.tsx` date formatting

### Changing Animations
- Durations defined in component transition props
- Easing functions in inline `transition` objects
- Reduced motion checks in each animated component

### Updating Breakpoints
- Modify `useBreakpoint.ts` thresholds
- Update responsive class utilities in components
- Adjust Tailwind config if needed

---

## Support & Troubleshooting

### Common Issues

**Issue:** Hover preview doesn't appear
- **Check:** Events exist for that day
- **Check:** Not on touch device (preview disabled on mobile)
- **Check:** Mouse hovering over day cell, not event badge

**Issue:** View transition stutters
- **Check:** Browser performance (hardware acceleration)
- **Check:** Reduced motion preference not set
- **Check:** No layout thrashing (large DOMs)

**Issue:** Details panel doesn't open
- **Check:** Day click handler firing (console log)
- **Check:** `isPanelOpen` state updating
- **Check:** Modal/Panel component rendering

**Issue:** Wrong events displayed
- **Check:** Event grouping by date in hook
- **Check:** Date key formatting (must match `yyyy-MM-dd`)
- **Check:** Timezone handling in date parsing

---

## Version History

### v1.0.0 (Current)
- Initial release with month/week/agenda views
- Hover previews and day details panel
- Responsive layouts and empty states
- Full keyboard navigation and accessibility
- Event category color system

---

**Last Updated:** November 2024  
**Maintained By:** AI Academic Advisor Team  
**Questions?** Refer to component JSDoc or open an issue.

