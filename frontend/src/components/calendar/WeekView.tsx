import { motion } from "framer-motion";
import { CalendarDay } from "../../utils/calendar";
import { CalendarEvent } from "../../api/plannerApi";
import { EventIndicator } from "./EventIndicator";
import { format } from "date-fns";
import clsx from "clsx";

interface WeekViewProps {
  days: CalendarDay[];
  eventsByDate: Map<string, CalendarEvent[]>;
  onDayClick: (dateKey: string) => void;
}

/**
 * WeekView - Vertical week layout with time blocks
 */
export const WeekView = ({ days, eventsByDate, onDayClick }: WeekViewProps) => {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
      {days.map((day, idx) => {
        const events = eventsByDate.get(day.dateKey) || [];

        return (
          <motion.button
            key={day.dateKey}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            onClick={() => onDayClick(day.dateKey)}
            className={clsx(
              "flex h-full flex-col rounded-2xl border px-4 py-4 text-left shadow-elevation-flat transition-transform duration-200 ease-snappy hover:-translate-y-0.5 hover:shadow-elevation-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
              day.isToday
                ? "border-primary-500/60 bg-gradient-to-br from-primary-500/10 via-transparent to-transparent"
                : day.isPast
                ? "border-slate-900/50 bg-slate-950/20 opacity-70 hover:opacity-90"
                : "border-slate-900/60 bg-slate-950/40 hover:border-slate-800/80"
            )}
          >
            {/* Day Header */}
            <div className="mb-3 border-b border-slate-900/50 pb-3">
              <div
                className={clsx(
                  "text-xs font-semibold uppercase tracking-wide",
                  day.isToday ? "text-primary-300" : "text-slate-500"
                )}
              >
                {format(day.date, "EEE")}
              </div>
              <div
                className={clsx(
                  "mt-1 text-3xl font-bold",
                  day.isToday
                    ? "text-primary-200"
                    : day.isPast
                    ? "text-slate-500"
                    : "text-slate-100"
                )}
              >
                {day.dayNumber}
              </div>
            </div>

            {/* Events */}
            <div className="flex-1 space-y-2">
              {events.length > 0 ? (
                events.map((event, eventIdx) => (
                  <EventIndicator
                    key={event.id}
                    event={event}
                    showTime
                    delay={eventIdx * 0.05}
                  />
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-800/60 px-3 py-2 text-center text-xs text-slate-500">
                  No events yet
                </div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

