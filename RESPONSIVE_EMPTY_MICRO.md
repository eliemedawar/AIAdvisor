# Responsive · Empty States · Micro Polish

## Breakpoints & Layout Primitives
- Introduced token-driven `useBreakpoint` helpers (sm/md/lg/xl/2xl) plus derived flags for narrow/desktop contexts (`src/hooks/useBreakpoint.ts`).
- Updated `PageShell`, `PageSection`, and global typography/scrollbar rules to use consistent padding ramps through 2xl (`src/components/layout/PageShell.tsx`, `src/styles/globals.css`).
- Sidebar/TopBar shell now auto-collapses between `lg`/`xl`, exposes proper focus-visible toggles, and the dashboard main pane gains a subtle border seam (`src/components/navigation/Sidebar.tsx`, `src/components/navigation/TopBar.tsx`, `src/layouts/DashboardLayout.tsx`).

## Page-Level Reflows
- Dashboard stat/cards/charts receive responsive grids (`grid-cols-[2fr_1fr]` on `lg+`), height constraints, and adaptive gaps so charts, task lists, and KPIs breathe on tablet/mobile (`src/pages/dashboard/DashboardPage.tsx`).
- Calendar swaps to agenda view on sm/md via the new breakpoint helpers while keeping the slide-over day panel for wider screens (`src/pages/calendar/CalendarPage.tsx`).
- Chat layout keeps the context cards accessible: `lg+` shows the inline sidebar, smaller breakpoints get a keyboard-friendly overlay drawer with skip buttons and body-scroll locking (`src/pages/chat/ChatPage.tsx`, `src/components/chat/ContextSidebar.tsx`).

## Empty States & Micro Details
- Centralized EmptyState styling (monochrome 48–64px line icons, clamped copy, optional actions) and wired contextual actions for dashboard lists, calendar panels, agenda, chat first-run, and chart widgets (`src/components/core/EmptyState.tsx` and callers).
- Added CTA buttons for “Next 3 tasks”, “At-risk courses”, agenda/day panels, and chat prompts to guide users toward planning flows.
- Normalized inner borders/radii across cards/stat cards, polished scrollbars, and aligned icon sizing (`src/components/core/Card.tsx`, `src/components/core/StatCard.tsx`, `src/styles/globals.css`).
- Sidebar separators and context drawers share consistent dividers via the new `ContextSidebarContent` stack (`src/components/chat/ContextSidebar.tsx`).

## Verification
- `npm run lint` → echoes “no lint configured”.
- `npm run build`

