/**
 * Calendar Utilities
 * 
 * Helpers for building calendar views, formatting dates/ranges,
 * and mapping event categories to design-system colors.
 */

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  addDays,
  subDays,
  isSameMonth,
  parseISO,
  isToday as dateFnsIsToday,
  isPast as dateFnsIsPast,
} from "date-fns";
import { CalendarEvent } from "../api/plannerApi";

// ============================================================================
// EVENT CATEGORIES & COLORS
// ============================================================================

export type EventCategory = "exam" | "assignment" | "study_session" | "class" | "other";

export interface CategoryStyle {
  bg: string;
  border: string;
  text: string;
  dot: string;
  label: string;
}

/**
 * Maps event types/categories to design-system colors
 */
export const categoryStyles: Record<EventCategory, CategoryStyle> = {
  exam: {
    bg: "bg-red-500/20",
    border: "border-red-500/40",
    text: "text-red-200",
    dot: "bg-red-500",
    label: "Exam",
  },
  assignment: {
    bg: "bg-primary-500/20",
    border: "border-primary-500/40",
    text: "text-primary-200",
    dot: "bg-primary-500",
    label: "Assignment",
  },
  study_session: {
    bg: "bg-accent-500/20",
    border: "border-accent-500/40",
    text: "text-accent-200",
    dot: "bg-accent-500",
    label: "Study Session",
  },
  class: {
    bg: "bg-secondary-500/20",
    border: "border-secondary-500/40",
    text: "text-secondary-200",
    dot: "bg-secondary-500",
    label: "Class",
  },
  other: {
    bg: "bg-slate-500/20",
    border: "border-slate-500/40",
    text: "text-slate-200",
    dot: "bg-slate-500",
    label: "Other",
  },
};

/**
 * Normalize event type string to a known category
 */
export function inferEventCategory(eventType: string): EventCategory {
  const normalized = eventType.toLowerCase().replace(/[_\s-]/g, "_");
  
  if (normalized.includes("exam") || normalized.includes("test") || normalized.includes("quiz")) {
    return "exam";
  }
  if (normalized.includes("assignment") || normalized.includes("homework") || normalized.includes("project")) {
    return "assignment";
  }
  if (normalized.includes("study") || normalized.includes("review")) {
    return "study_session";
  }
  if (normalized.includes("class") || normalized.includes("lecture") || normalized.includes("lab")) {
    return "class";
  }
  
  return "other";
}

/**
 * Get category colors for an event category
 */
export function getCategoryColors(category: EventCategory): CategoryStyle {
  return categoryStyles[category];
}

// ============================================================================
// CALENDAR DAY METADATA
// ============================================================================

export interface CalendarDay {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dateKey: string; // YYYY-MM-DD (alias for compatibility)
  dayNumber: number; // 1-31
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isWeekend: boolean;
  isSelected?: boolean;
}

/**
 * Build metadata for a single calendar day
 */
export function buildDayMetadata(date: Date, currentMonth: Date, selectedDate?: Date): CalendarDay {
  const now = new Date();
  const dateString = format(date, "yyyy-MM-dd");
  
  return {
    date,
    dateString,
    dateKey: dateString, // Alias for compatibility
    dayNumber: date.getDate(),
    isCurrentMonth: isSameMonth(date, currentMonth),
    isToday: dateFnsIsToday(date),
    isPast: isBefore(endOfDay(date), startOfDay(now)),
    isFuture: isAfter(startOfDay(date), endOfDay(now)),
    isWeekend: date.getDay() === 0 || date.getDay() === 6,
    isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
  };
}

// ============================================================================
// MONTH GRID BUILDER
// ============================================================================

export interface MonthGrid {
  days: CalendarDay[];
  weeks: CalendarDay[][];
  month: Date;
  monthLabel: string;
  yearLabel: string;
}

/**
 * Build a complete month grid with leading/trailing days
 * Returns a 2D array of weeks (always 6 weeks for consistency)
 */
export function buildMonthGrid(referenceDate: Date, selectedDate?: Date): CalendarDay[][] {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  
  // Get the calendar grid start (Sunday or Monday depending on locale)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 0 = Sunday
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  // Build all days in the grid
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const days = allDays.map(date => buildDayMetadata(date, referenceDate, selectedDate));
  
  // Chunk into weeks (7 days each)
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  
  // Ensure we always have 6 weeks for consistent height
  while (weeks.length < 6) {
    const lastDay = weeks[weeks.length - 1][6].date;
    const nextWeek = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(lastDay, i + 1);
      return buildDayMetadata(date, referenceDate, selectedDate);
    });
    weeks.push(nextWeek);
  }
  
  return weeks;
}

// ============================================================================
// WEEK VIEW BUILDER
// ============================================================================

/**
 * Build a week grid for a given date
 */
export function buildWeekView(referenceDate: Date, selectedDate?: Date): CalendarDay[] {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 0 });
  
  const allDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const days = allDays.map(date => buildDayMetadata(date, referenceDate, selectedDate));
  
  return days;
}

// ============================================================================
// EVENT MAPPING & GROUPING
// ============================================================================

export interface EnrichedEvent extends CalendarEvent {
  category: EventCategory;
  categoryStyle: CategoryStyle;
  dateString: string; // YYYY-MM-DD of start_at
  timeRange: string; // "9:00 AM - 10:30 AM" or "All day"
  isAllDay: boolean;
  isPast: boolean;
  startDate: Date;
  endDate: Date;
}

/**
 * Enrich a calendar event with derived fields
 */
export function enrichEvent(event: CalendarEvent): EnrichedEvent {
  const startDate = parseISO(event.start_at);
  const endDate = parseISO(event.end_at);
  const category = inferEventCategory(event.type);
  const dateString = format(startDate, "yyyy-MM-dd");
  
  const isAllDay = isAllDayEvent(event.start_at, event.end_at);
  const timeRange = isAllDay ? "All day" : formatEventTimeRange(event.start_at, event.end_at);
  
  return {
    ...event,
    category,
    categoryStyle: categoryStyles[category],
    dateString,
    timeRange,
    isAllDay,
    isPast: dateFnsIsPast(endDate),
    startDate,
    endDate,
  };
}

/**
 * Build a map of events keyed by YYYY-MM-DD date string
 */
export function groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  
  events.forEach(event => {
    const startDate = parseISO(event.start_at);
    const endDate = parseISO(event.end_at);
    
    // Handle multi-day events by adding to each day
    const days = eachDayOfInterval({ start: startOfDay(startDate), end: startOfDay(endDate) });
    
    days.forEach(day => {
      const dateString = format(day, "yyyy-MM-dd");
      const existing = map.get(dateString) ?? [];
      map.set(dateString, [...existing, event]);
    });
  });
  
  // Sort events within each day by start time
  map.forEach((eventsOnDay, key) => {
    map.set(
      key,
      eventsOnDay.sort((a, b) => {
        const dateA = parseISO(a.start_at);
        const dateB = parseISO(b.start_at);
        return dateA.getTime() - dateB.getTime();
      })
    );
  });
  
  return map;
}

/**
 * Get events for a specific date string
 */
export function getEventsForDate(
  dateString: string,
  eventMap: Map<string, CalendarEvent[]>
): CalendarEvent[] {
  return eventMap.get(dateString) ?? [];
}

/**
 * Check if a date has any events
 */
export function hasEvents(dateString: string, eventMap: Map<string, CalendarEvent[]>): boolean {
  const events = eventMap.get(dateString);
  return events !== undefined && events.length > 0;
}

// ============================================================================
// DATE FORMATTING HELPERS
// ============================================================================

/**
 * Format a date for display in headers
 */
export function formatDateHeader(date: Date): string {
  return format(date, "EEEE, MMMM d, yyyy");
}

/**
 * Format a date for display in compact form
 */
export function formatDateCompact(date: Date): string {
  return format(date, "MMM d");
}

/**
 * Format a date for display in agenda lists
 */
export function formatDateAgenda(date: Date): string {
  if (dateFnsIsToday(date)) return "Today";
  return format(date, "EEE, MMM d");
}

/**
 * Format time range between two dates
 */
export function formatTimeRange(start: Date, end: Date): string {
  return `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
}

/**
 * Get relative date label (Today, Tomorrow, Yesterday, etc.)
 */
export function getRelativeDateLabel(date: Date): string | null {
  const now = new Date();
  
  if (dateFnsIsToday(date)) return "Today";
  if (isSameDay(date, addDays(now, 1))) return "Tomorrow";
  if (isSameDay(date, subDays(now, 1))) return "Yesterday";
  
  return null;
}

/**
 * Format relative date (Today, Tomorrow, or formatted date)
 */
export function formatRelativeDate(date: Date): string {
  const relative = getRelativeDateLabel(date);
  if (relative) return relative;
  return format(date, "EEEE, MMMM d");
}

/**
 * Format date with custom format string
 */
export function formatDate(date: Date, formatString: string): string {
  return format(date, formatString);
}

/**
 * Sort events by start time
 */
export function sortEventsByTime(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const dateA = parseISO(a.start_at);
    const dateB = parseISO(b.start_at);
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Format time range for an event (from ISO strings)
 */
export function formatEventTimeRange(startAt: string, endAt: string): string {
  const start = parseISO(startAt);
  const end = parseISO(endAt);
  return `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
}

/**
 * Check if event is all-day
 */
export function isAllDayEvent(startAt: string, endAt: string): boolean {
  const start = parseISO(startAt);
  const end = parseISO(endAt);
  
  // Check if all-day (midnight to midnight or 24-hour span)
  return (
    (start.getHours() === 0 &&
      start.getMinutes() === 0 &&
      end.getHours() === 23 &&
      end.getMinutes() === 59) ||
    (start.getHours() === 0 && end.getHours() === 0 && start.getDate() !== end.getDate())
  );
}
