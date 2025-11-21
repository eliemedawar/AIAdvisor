/**
 * DayCell Component
 * 
 * Individual day cell in the calendar grid with:
 * - State indicators (today, past, selected, has events)
 * - Hover preview trigger
 * - Event badges with category colors
 * - Empty day add-event affordance
 */

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import clsx from "clsx";
import { CalendarDay, EnrichedEvent } from "../../utils/calendar";

interface DayCellProps {
  day: CalendarDay;
  events: EnrichedEvent[];
  isSelected: boolean;
  onClick: () => void;
  onHover?: (day: CalendarDay, events: EnrichedEvent[]) => void;
  onHoverEnd?: () => void;
  index: number;
}

export const DayCell = ({
  day,
  events,
  isSelected,
  onClick,
  onHover,
  onHoverEnd,
  index,
}: DayCellProps) => {
  const hasEvents = events.length > 0;
  const visibleEvents = events.slice(0, 2);
  const remainingCount = events.length - 2;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.008, duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
      onClick={onClick}
      onMouseEnter={() => onHover?.(day, events)}
      onMouseLeave={onHoverEnd}
      className={clsx(
        "group relative flex min-h-[100px] flex-col rounded-xl border p-3 transition-all duration-quick ease-snappy text-left",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
        // Today styling
        day.isToday &&
          "border-primary-500/60 bg-primary-500/10 shadow-elevation-mid ring-1 ring-primary-500/20",
        // Selected styling
        isSelected &&
          !day.isToday &&
          "border-accent-500/60 bg-accent-500/10 shadow-elevation-low ring-1 ring-accent-500/20",
        // Past day styling
        day.isPast &&
          !day.isToday &&
          !isSelected &&
          "border-slate-800/40 bg-surface-background opacity-60",
        // Future/default styling
        !day.isToday &&
          !isSelected &&
          !day.isPast &&
          "border-slate-800/60 bg-surface-background shadow-elevation-flat hover:bg-surface-base hover:border-slate-700/80 hover:shadow-elevation-low",
        // Not current month
        !day.isCurrentMonth && "opacity-40",
        // Hover lift
        "active:scale-[0.98]"
      )}
    >
      {/* Date number */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={clsx(
            "text-sm font-semibold transition-colors",
            day.isToday
              ? "flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500 text-white shadow-sm"
              : isSelected
              ? "text-accent-300"
              : day.isPast
              ? "text-slate-500"
              : "text-slate-300 group-hover:text-slate-100"
          )}
        >
          {day.dayNumber}
        </span>
        
        {/* Event count badge */}
        {remainingCount > 0 && (
          <span className="rounded-full bg-primary-500/30 px-2 py-0.5 text-[10px] font-medium text-primary-200 border border-primary-500/40">
            +{remainingCount}
          </span>
        )}
      </div>

      {/* Event indicators */}
      <div className="flex-1 space-y-1">
        {hasEvents ? (
          visibleEvents.map((event, i) => (
            <div
              key={event.id}
              className={clsx(
                "truncate rounded-lg px-2 py-1 text-[10px] font-medium border",
                event.categoryStyle.bg,
                event.categoryStyle.border,
                event.categoryStyle.text,
                "transition-all duration-quick ease-snappy group-hover:shadow-elevation-low"
              )}
              title={`${event.title} (${event.timeRange})`}
            >
              <div className="flex items-center gap-1">
                <span
                  className={clsx(
                    "h-1.5 w-1.5 rounded-full flex-shrink-0",
                    event.categoryStyle.dot
                  )}
                />
                <span className="truncate">{event.title}</span>
              </div>
            </div>
          ))
        ) : !day.isPast ? (
          // Empty day affordance - only show for non-past days
          <div
            className={clsx(
              "flex items-center justify-center gap-1 rounded-lg border border-dashed border-slate-700/40 py-2 text-[10px] text-slate-500",
              "opacity-0 transition-opacity group-hover:opacity-100"
            )}
          >
            <Plus className="h-3 w-3" />
            <span>Add event</span>
          </div>
        ) : null}
      </div>

      {/* Category dots for overflow - shown at bottom */}
      {events.length > 2 && (
        <div className="flex gap-1 mt-1 pt-1 border-t border-slate-800/40">
          {events.slice(2, 5).map((event, i) => (
            <div
              key={i}
              className={clsx("h-1.5 w-1.5 rounded-full", event.categoryStyle.dot)}
              title={event.title}
            />
          ))}
          {events.length > 5 && (
            <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
          )}
        </div>
      )}
    </motion.button>
  );
};
