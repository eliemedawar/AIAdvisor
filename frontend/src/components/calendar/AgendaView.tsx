import { motion } from "framer-motion";
import { CalendarEvent } from "../../api/plannerApi";
import { formatRelativeDate, formatDate, groupEventsByDate, sortEventsByTime } from "../../utils/calendar";
import { EventIndicator } from "./EventIndicator";
import { EmptyState } from "../core/EmptyState";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Button } from "../core/Button";
import { parseISO, isAfter, startOfDay } from "date-fns";

interface AgendaViewProps {
  events: CalendarEvent[];
  onAddEvent?: () => void;
}

/**
 * AgendaView - Scrollable list grouped by date (mobile-optimized)
 */
export const AgendaView = ({ events, onAddEvent }: AgendaViewProps) => {
  // Filter future events and today
  const now = startOfDay(new Date());
  const upcomingEvents = events.filter((event) => {
    const eventDate = startOfDay(parseISO(event.start_at));
    return isAfter(eventDate, now) || eventDate.getTime() === now.getTime();
  });

  const eventsByDate = groupEventsByDate(upcomingEvents);
  const sortedDates = Array.from(eventsByDate.keys()).sort();

  if (upcomingEvents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <EmptyState
          icon={<CalendarIcon className="h-8 w-8" />}
          title="No upcoming events"
          description="Start planning your academic schedule by adding events and deadlines."
          action={
            onAddEvent ? (
              <Button icon={<Plus className="h-4 w-4" />} onClick={onAddEvent}>
                Add Your First Event
              </Button>
            ) : undefined
          }
        />
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedDates.map((dateKey, idx) => {
        const dateEvents = sortEventsByTime(eventsByDate.get(dateKey) || []);
        const date = parseISO(dateKey);

        return (
          <motion.div
            key={dateKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="rounded-2xl border border-slate-900/60 bg-slate-950/40 p-4 shadow-elevation-flat"
          >
            {/* Date Header */}
            <div className="flex items-baseline justify-between border-b border-slate-900/50 pb-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  {formatRelativeDate(date)}
                </p>
                <h3 className="text-lg font-semibold text-slate-100">
                  {formatDate(date, "EEEE, MMM d")}
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                {dateEvents.length} item{dateEvents.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Events for this date */}
            <div className="mt-3 space-y-2">
              {dateEvents.map((event, eventIdx) => (
                <EventIndicator
                  key={event.id}
                  event={event}
                  showTime
                  showLocation
                  delay={eventIdx * 0.03}
                />
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* Helpful tip at the end */}
      {upcomingEvents.length < 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-dashed border-slate-800/50 bg-slate-950/20 p-4 text-center"
        >
          <p className="text-xs text-slate-400">
            Keep your calendar updated to stay on top of deadlines and exams.
          </p>
        </motion.div>
      )}
    </div>
  );
};

