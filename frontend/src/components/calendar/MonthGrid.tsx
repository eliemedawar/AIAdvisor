/**
 * MonthGrid Component
 * 
 * Displays the calendar month grid with:
 * - Subtle grid lines
 * - Day header (Sun-Sat)
 * - 6-week consistent height
 * - Responsive gap spacing
 */

import { useState, useRef } from "react";
import { CalendarDay } from "../../utils/calendar";
import { CalendarEvent } from "../../api/plannerApi";
import { EventIndicator } from "./EventIndicator";
import { DayHoverPreview } from "./DayHoverPreview";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface MonthGridProps {
  weeks: CalendarDay[][];
  eventsByDate: Map<string, CalendarEvent[]>;
  onDayClick: (dateKey: string) => void;
  onAddEvent: (dateKey: string) => void;
}

const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const MonthGrid = ({
  weeks,
  eventsByDate,
  onDayClick,
  onAddEvent,
}: MonthGridProps) => {
  const [hoverState, setHoverState] = useState<{
    dateKey: string | null;
    events: CalendarEvent[];
    position: { x: number; y: number };
  }>({
    dateKey: null,
    events: [],
    position: { x: 0, y: 0 },
  });
  
  const handleDayHover = (dateKey: string, events: CalendarEvent[], event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoverState({
      dateKey,
      events,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top,
      },
    });
  };
  
  const handleDayHoverEnd = () => {
    setHoverState({ dateKey: null, events: [], position: { x: 0, y: 0 } });
  };

  return (
    <div>
      {/* Day headers */}
      <div className="mb-3 grid grid-cols-7 gap-2">
        {dayHeaders.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const events = eventsByDate.get(day.dateKey) ?? [];
            const globalIndex = weekIndex * 7 + dayIndex;
            const visibleEvents = events.slice(0, 2);
            const remainingCount = events.length - 2;
            
            return (
              <motion.button
                key={day.dateKey}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: globalIndex * 0.01, duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                onClick={() => onDayClick(day.dateKey)}
                onMouseEnter={(e) => events.length > 0 && handleDayHover(day.dateKey, events, e)}
                onMouseLeave={handleDayHoverEnd}
                className={clsx(
                  "group relative flex min-h-[96px] flex-col rounded-xl border px-3 py-2.5 text-left shadow-elevation-flat transition-all duration-quick ease-snappy hover:-translate-y-0.5 hover:shadow-elevation-low",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                  // Today styling
                  day.isToday &&
                    "border-primary-500/70 bg-gradient-to-br from-primary-500/12 via-primary-500/5 to-transparent ring-1 ring-primary-500/40 shadow-elevation-low",
                  // Selected styling
                  day.isSelected &&
                    !day.isToday &&
                    "border-accent-500/60 bg-gradient-to-br from-accent-500/8 to-transparent ring-1 ring-accent-500/30 shadow-elevation-low",
                  // Past day styling
                  day.isPast &&
                    !day.isToday &&
                    !day.isSelected &&
                    "border-slate-900/40 bg-surface-background opacity-60 hover:opacity-70",
                  // Future/default styling
                  !day.isToday &&
                    !day.isSelected &&
                    !day.isPast &&
                    "border-slate-900/60 bg-surface-background hover:border-slate-800/80 hover:bg-surface-base",
                  // Not current month
                  !day.isCurrentMonth && "opacity-40",
                  // Hover lift
                  "active:scale-[0.98]"
                )}
                aria-pressed={day.isSelected}
              >
                {/* Date number */}
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={clsx(
                      "text-sm font-semibold transition-all duration-quick ease-snappy",
                      day.isToday
                        ? "flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500 text-white shadow-elevation-mid ring-1 ring-primary-400"
                        : day.isSelected
                        ? "text-accent-300"
                        : day.isPast
                        ? "text-slate-500"
                        : "text-slate-200 group-hover:text-white"
                    )}
                  >
                    {day.dayNumber}
                  </span>
                  
                  {/* Event count badge */}
                  {remainingCount > 0 && (
                    <span className="rounded-full border border-primary-500/50 bg-primary-500/15 px-2 py-0.5 text-[10px] font-semibold leading-tight text-primary-300 shadow-elevation-flat">
                      +{remainingCount}
                    </span>
                  )}
                </div>

                {/* Event indicators */}
                <div className="flex-1 space-y-1.5">
                  {events.length > 0 ? (
                    visibleEvents.map((event, i) => (
                      <EventIndicator key={event.id} event={event} compact delay={i * 0.05} />
                    ))
                  ) : !day.isPast ? (
                    // Empty day affordance
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddEvent(day.dateKey);
                      }}
                      className={clsx(
                        "flex items-center justify-center gap-1 rounded-lg border border-dashed border-slate-800/60 bg-slate-950/20 py-2 text-[11px] leading-tight text-slate-500",
                        "opacity-0 transition-all duration-quick ease-snappy group-hover:opacity-100 hover:border-slate-700/80 hover:bg-slate-900/40 hover:text-slate-300"
                      )}
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add event</span>
                    </button>
                  ) : null}
                </div>

                {/* Category dots for overflow */}
                {events.length > 2 && (
                  <div className="mt-2 flex gap-1 border-t border-dashed border-slate-800/40 pt-1.5">
                    {events.slice(2, 5).map((event, i) => {
                      const category = event.type.toLowerCase().includes("exam") ? "exam" : 
                                      event.type.toLowerCase().includes("assignment") ? "assignment" :
                                      event.type.toLowerCase().includes("study") ? "study_session" : "other";
                      const dotColor = category === "exam" ? "bg-red-500" :
                                       category === "assignment" ? "bg-primary-500" :
                                       category === "study_session" ? "bg-accent-500" : "bg-slate-500";
                      return (
                        <div
                          key={i}
                          className={clsx("h-1.5 w-1.5 rounded-full", dotColor)}
                          title={event.title}
                        />
                      );
                    })}
                    {events.length > 5 && (
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                    )}
                  </div>
                )}
              </motion.button>
            );
          })
        )}
      </div>
      
      {/* Hover Preview */}
      <DayHoverPreview
        isVisible={hoverState.dateKey !== null && hoverState.events.length > 0}
        dateKey={hoverState.dateKey}
        events={hoverState.events}
        position={hoverState.position}
      />
    </div>
  );
};
