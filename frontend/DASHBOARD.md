# Dashboard Documentation

Complete guide to the AI Academic Advisor analytics dashboard, including architecture, data contracts, chart components, and design patterns.

---

## Table of Contents

1. [Overview](#overview)
2. [Information Architecture](#information-architecture)
3. [Data Contracts](#data-contracts)
4. [Chart Components](#chart-components)
5. [Mock Data Strategy](#mock-data-strategy)
6. [Design Guidelines](#design-guidelines)
7. [Empty State Patterns](#empty-state-patterns)
8. [Responsive Behavior](#responsive-behavior)

---

## Overview

The dashboard provides students with an **analytics-driven, insight-rich view** of their academic performance. It transforms raw data into actionable insights through:

- **Key Performance Indicators (KPIs)**: GPA, deadlines, task completion
- **Trend Visualizations**: GPA progression, task completion patterns, study time distribution
- **Smart Insights**: Data-driven messages that highlight achievements and areas for improvement
- **Actionable Lists**: Next tasks and at-risk courses requiring immediate attention

The dashboard is built using:
- **Recharts** for data visualization
- **Framer Motion** for animations
- **Design System** tokens for consistent theming
- **Mock data fallback** for development and demo purposes

---

## Information Architecture

The dashboard follows a **three-tier hierarchy** optimized for scannability and action:

### Top Row: Key Stats
Three primary metrics displayed as `StatCard` components:

1. **Current GPA**
   - Displays current GPA value (e.g., `3.72`)
   - Shows trend indicator (up/down/neutral) with delta value
   - Icon changes based on trend direction
   - Falls back to `"—"` when data is unavailable

2. **Upcoming Deadlines**
   - Count of assignments due in the next 2-4 weeks
   - Filtered from `upcoming_deadlines` array
   - Calendar icon for quick recognition

3. **Weekly Tasks**
   - Displays completion ratio (e.g., `27/34`)
   - Derived from `weekly_task_stats` aggregation
   - CheckCircle icon for visual consistency

### Middle: Charts and Trends
Two-column layout (responsive: stacks on mobile):

**Left Column (2/3 width):**
- **GPA Trend Chart**: Line chart showing GPA progression over 8 weeks

**Right Column (1/3 width):**
- **Weekly Tasks Chart**: Grouped bar chart for completed vs. planned tasks
- **Study Time by Course Chart**: Horizontal bar chart for study hours distribution

All charts include:
- Dynamic insight text below the visualization
- Empty state handling with contextual CTAs
- Dark theme-aligned styling
- Responsive sizing

### Bottom: Actionable Lists
Two-column layout of prioritized items:

**Left Column:**
- **Next 3 Tasks**: Immediate priorities sorted by due date
- Combines tasks and assignment deadlines
- Shows due date, title, and priority badge

**Right Column:**
- **At-Risk Courses**: Courses with low study time (< 5 hours)
- Warning-styled cards with course name and study hours
- CTA badge encouraging action ("Plan study")
- Shows success state when all courses are on track

---

## Data Contracts

### DashboardOverview Interface

Located in `src/api/dashboardApi.ts`:

```typescript
export interface DashboardOverview {
  // Core metrics
  current_gpa: number | null;
  upcoming_deadlines: Assignment[];
  weekly_tasks: Task[];
  study_time_this_week_hours: number;
  next_events: CalendarEvent[];
  
  // Analytics data (new fields)
  gpa_trend: GpaTrendPoint[];
  weekly_task_stats: WeeklyTaskStat[];
  study_time_by_course: StudyTimeByCourse[];
}
```

### Supporting Interfaces

**GpaTrendPoint:**
```typescript
export interface GpaTrendPoint {
  label: string;      // e.g., "Week 1", "Term 1"
  gpa: number;        // GPA value (0.0 - 4.0)
}
```

**WeeklyTaskStat:**
```typescript
export interface WeeklyTaskStat {
  day: string;        // e.g., "Mon", "Tue"
  completed: number;  // Tasks completed
  planned: number;    // Tasks planned
}
```

**StudyTimeByCourse:**
```typescript
export interface StudyTimeByCourse {
  courseName: string; // e.g., "Algorithms"
  hours: number;      // Study hours (float)
}
```

### Expected Data Shapes

**GPA Trend:**
- Typically 8 data points (weeks)
- Minimum 2 points needed for trend calculation
- Values range from 0.0 to 4.0

**Weekly Task Stats:**
- 7 data points (Mon-Sun)
- Both `completed` and `planned` should be non-negative integers
- Used to calculate completion rate and identify productive days

**Study Time by Course:**
- Variable length (typically 4-6 courses)
- Hours can be decimal values
- Courses with < 5 hours flagged as "at-risk"

---

## Chart Components

All chart components are located in `src/components/dashboard/`.

### GpaTrendChart

**File:** `GpaTrendChart.tsx`

**Props:**
```typescript
interface GpaTrendChartProps {
  data: GpaTrendPoint[];
  currentGpa: number | null;
  className?: string;
}
```

**Features:**
- Line chart with gradient fill
- Dynamic Y-axis domain with padding
- Trend calculation (up/down/neutral)
- Insight message with delta value
- Empty state with CTA

**Recharts Components:**
- `LineChart`, `Line`
- `CartesianGrid`, `XAxis`, `YAxis`
- `Tooltip`, `ResponsiveContainer`

**Styling:**
- Primary color (`#0d5eff`) for line and dots
- Gradient fill for area under curve
- Dark background tooltip
- Grid opacity: 10%

---

### WeeklyTasksChart

**File:** `WeeklyTasksChart.tsx`

**Props:**
```typescript
interface WeeklyTasksChartProps {
  data: WeeklyTaskStat[];
  className?: string;
}
```

**Features:**
- Grouped bar chart (completed vs. planned)
- Completion rate calculation
- Best/worst day identification
- Dynamic insight messages based on performance
- Empty state with CTA

**Recharts Components:**
- `BarChart`, `Bar` (2 bars per day)
- `Legend`, `CartesianGrid`
- `XAxis`, `YAxis`, `Tooltip`
- `ResponsiveContainer`

**Color Scheme:**
- Completed: Teal (`#14b8a6`)
- Planned: Primary Blue (`#0d5eff`)
- Rounded bar tops (`radius={[8, 8, 0, 0]}`)

**Insights Logic:**
- ≥85% completion: "Excellent"
- ≥70% completion: "Good progress"
- ≥50% completion: "Consider planning fewer tasks"
- <50% completion: "Try reducing your weekly load"

---

### StudyTimeByCourseChart

**File:** `StudyTimeByCourseChart.tsx`

**Props:**
```typescript
interface StudyTimeByCourseChartProps {
  data: StudyTimeByCourse[];
  className?: string;
}
```

**Features:**
- Horizontal bar chart (vertical layout)
- Color-coded bars (at-risk courses use warning color)
- At-risk course identification (< 5 hours)
- Dedicated at-risk courses list below chart
- Percentage calculation for top course
- Empty state with CTA

**Recharts Components:**
- `BarChart` with `layout="vertical"`
- `Bar` with dynamic `Cell` colors
- `XAxis` (type="number"), `YAxis` (type="category")
- `CartesianGrid`, `Tooltip`, `ResponsiveContainer`

**Color Logic:**
```typescript
const getBarColor = (hours: number) => {
  if (hours < 5) return "#f59e0b"; // warning
  return "#0d5eff"; // primary
};
```

**At-Risk Threshold:** 5 hours per week

---

## Mock Data Strategy

### Purpose
Mock data ensures the dashboard remains functional and demonstrable even when:
- Backend is unavailable
- User has no real data yet
- Development/testing environment

### Implementation

Located in `src/hooks/useDashboard.ts`:

**Strategy:**
1. **Try real API first**: Always attempt to fetch from backend
2. **Enhance partial data**: If backend returns data but new fields are missing, fill them with mock data
3. **Full fallback**: On complete API error, use comprehensive mock data
4. **Surface errors**: Even with mock data, display a subtle warning banner

**Mock Data Generator:**
```typescript
const generateMockDashboardData = (): DashboardOverview => {
  // Returns realistic sample data including:
  // - 8 weeks of GPA trend (3.45 → 3.75)
  // - 7 days of task stats (varying completion rates)
  // - 5 courses with varying study hours
  // - 3 upcoming deadlines
  // - 3 weekly tasks
};
```

**Usage in Hook:**
```typescript
try {
  const data = await dashboardApi.getOverview();
  const enhancedData: DashboardOverview = {
    ...data,
    gpa_trend: data.gpa_trend?.length ? data.gpa_trend : generateMockDashboardData().gpa_trend,
    // ... similar for other fields
  };
  setOverview(enhancedData);
} catch (err) {
  setError(err.message);
  setOverview(generateMockDashboardData()); // Full fallback
}
```

### Mock Data Characteristics

**Realistic Trends:**
- GPA shows gradual improvement (not flat)
- Task completion varies by day (simulates real patterns)
- Study hours distributed unevenly (some courses get more attention)

**Edge Cases Represented:**
- At-risk courses (< 5 hours)
- High-priority tasks
- Approaching deadlines

---

## Design Guidelines

### Color Palette

**Primary Colors:**
- Primary: `#0d5eff` (Deep Sapphire Blue)
- Success/Teal: `#14b8a6`
- Warning: `#f59e0b`
- Danger: `#ef4444`

**Chart-Specific:**
- Grid lines: `rgba(148, 163, 184, 0.1)` (10% slate-400)
- Axis text: `#94a3b8` (slate-400)
- Tooltip background: `rgba(15, 23, 42, 0.95)` (slate-900/95)
- Tooltip border: `rgba(148, 163, 184, 0.2)` (20% slate-400)

### Typography

**Chart Text:**
- Font: `Inter` (body font from design system)
- Axis labels: `0.75rem` (12px)
- Tooltip labels: Default size with `fontWeight: 500`
- Insight text: `small` variant from `Text` component

**Consistency:**
All chart text uses the same font family and sizing for visual cohesion.

### Spacing

Following the **8-point grid system**:
- Chart container padding: `p-4` or `p-6` (via `Card` component)
- Chart height: `280px` (GPA), `240px` (others)
- Insight box padding: `p-4`
- Gap between charts: `gap-6` (24px)
- Gap between stat cards: `gap-4` sm:`gap-6`

### Border Radius

- Cards: `rounded-2xl` (24px)
- Insight boxes: `rounded-xl` (20px)
- Bar chart corners: `radius={[8, 8, 0, 0]}` (top corners only)
- Tooltip: `borderRadius: '0.75rem'` (12px)

### Shadows and Elevation

**Card Hover States:**
- Default: Subtle border glow
- Hover: Enhanced shadow with primary glow
- Transition: `150ms` ease-out

**Chart Interactions:**
- Line chart active dot: Increased radius with stroke
- Bar chart hover: Cursor with subtle fill
- Tooltip: Appears smoothly on data point hover

---

## Empty State Patterns

### Philosophy
Empty states should be **informative and actionable**, not just indicate absence of data.

### Pattern Structure

All empty states use the `EmptyState` component with:
1. **Icon**: Contextual icon related to missing data
2. **Title**: Clear description of what's missing
3. **Description**: Brief explanation or encouragement
4. **Action (optional)**: CTA button to resolve the empty state

### Examples

**GPA Trend (No Data):**
```tsx
<EmptyState
  icon={<TrendingUp className="h-8 w-8" />}
  title="No GPA data yet"
  description="Connect your courses and grades to start tracking your GPA trends."
  action={<Button size="sm" variant="primary">Add Courses</Button>}
/>
```

**Weekly Tasks (No Data):**
```tsx
<EmptyState
  icon={<CheckCircle2 className="h-8 w-8" />}
  title="No task data yet"
  description="Start planning your week to see task completion insights."
  action={<Button size="sm" variant="primary">Plan Your Week</Button>}
/>
```

**Study Time (No Data):**
```tsx
<EmptyState
  icon={<BookOpen className="h-8 w-8" />}
  title="No study time tracked"
  description="Log your study sessions to see time distribution across courses."
  action={<Button size="sm" variant="primary">Log Study Time</Button>}
/>
```

**At-Risk Courses (All On Track):**
```tsx
<EmptyState
  icon={<BookOpen className="h-8 w-8" />}
  title="All courses on track"
  description="Your study time is well distributed across all courses."
  // No action needed - this is a success state
/>
```

### Empty State vs. Zero Data

**Empty State (no data array):**
- Show `EmptyState` component
- Provide guidance and CTA

**Zero Data (array exists but empty):**
- Still show `EmptyState` with appropriate message
- Example: "No upcoming deadlines" when `upcoming_deadlines: []`

---

## Responsive Behavior

### Breakpoints

Following Tailwind defaults:
- Mobile: `< 640px`
- Tablet: `640px - 1024px`
- Desktop: `≥ 1024px`

### Layout Adaptations

**Stat Cards:**
- Mobile: Single column
- Tablet: 2 columns (`sm:grid-cols-2`)
- Desktop: 3 columns (`lg:grid-cols-3`)

**Chart Grid:**
- Mobile: Single column (stacked)
- Desktop: 3-column grid (`lg:grid-cols-3`)
  - GPA Trend: 2 columns (`lg:col-span-2`)
  - Weekly Tasks + Study Time: 1 column (stacked)

**Actionable Lists:**
- Mobile: Single column
- Desktop: 2 columns (`lg:grid-cols-2`)

### Chart Responsiveness

**ResponsiveContainer:**
All charts use `<ResponsiveContainer width="100%" height={...}>` to:
- Fill available horizontal space
- Maintain consistent height
- Adapt to parent container resizing

**Chart Margins:**
Adjusted for mobile to prevent axis label clipping:
```typescript
margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
```

**Y-Axis Width (Study Time Chart):**
```typescript
<YAxis width={120} />
```
Ensures course names don't get cut off on narrow screens.

---

## Performance Considerations

### Chart Rendering
- Charts only render when data is available (conditional rendering)
- `ResponsiveContainer` prevents unnecessary re-renders
- Framer Motion animations use optimized transforms

### Data Processing
- Calculations (totals, averages, trends) done once during render
- Sorted/filtered arrays created outside JSX map loops
- Memoization not required due to small data sizes

### Loading States
- Skeleton components shown during initial load
- Charts appear after data loads (no flash of empty state)
- Smooth transitions via Framer Motion

---

## Accessibility

### Keyboard Navigation
- All interactive elements (buttons, cards) are keyboard accessible
- Focus states visible via design system focus rings

### Screen Readers
- Chart containers have semantic HTML structure
- Empty states provide meaningful alternative text
- Icon components use appropriate ARIA labels where needed

### Color Contrast
- All text meets WCAG AA standards against dark background
- Chart colors chosen for differentiation and visibility
- Warning/danger states use both color and iconography

---

## Future Enhancements

### Potential Additions
1. **Date Range Selector**: Allow users to change GPA trend timeframe
2. **Export Charts**: Download charts as images or PDF
3. **Goal Setting**: Set GPA targets and track progress
4. **Predictive Insights**: ML-based predictions for final grades
5. **Comparative Analytics**: Compare performance to previous terms
6. **Custom Metrics**: User-defined KPIs and charts

### Backend Integration
When backend is ready, the following endpoints are expected:

```
GET /dashboard/overview/
Response: {
  current_gpa: number | null,
  upcoming_deadlines: Assignment[],
  weekly_tasks: Task[],
  study_time_this_week_hours: number,
  next_events: CalendarEvent[],
  gpa_trend: GpaTrendPoint[],
  weekly_task_stats: WeeklyTaskStat[],
  study_time_by_course: StudyTimeByCourse[]
}
```

The frontend is already prepared to:
- Consume this data structure
- Fall back to mock data on error
- Enhance partial responses

---

## Troubleshooting

### Charts Not Rendering
- **Check data format**: Ensure arrays match expected interface shapes
- **Verify Recharts import**: All components must be imported from `recharts`
- **Container height**: Charts need explicit height to render

### Empty States Always Showing
- **Data length check**: Verify `data?.length > 0` logic
- **API response**: Check if backend is returning empty arrays vs. null
- **Mock data**: Ensure mock data generator is working

### Styling Issues
- **Theme colors**: Verify design tokens are imported and used correctly
- **Tooltip styling**: Ensure `contentStyle` object has valid CSS properties
- **Responsive layout**: Test at multiple breakpoints

---

## Related Documentation

- **Design System**: `DESIGN_SYSTEM.md`
- **Component Library**: `COMPONENTS.md`
- **API Documentation**: `backend/README.md` (when available)
- **Recharts Docs**: https://recharts.org/

---

**Maintained by**: Frontend Team  
**Last Updated**: November 2024  
**Version**: 1.0.0

