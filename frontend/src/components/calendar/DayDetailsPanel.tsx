import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Check, Eye } from "lucide-react";
import { CalendarEvent } from "../../api/plannerApi";
import { formatRelativeDate, formatDate, sortEventsByTime } from "../../utils/calendar";
import { EventIndicator } from "./EventIndicator";
import { EmptyState } from "../core/EmptyState";
import { Button } from "../core/Button";
import { parseISO } from "date-fns";

interface DayDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  dateKey: string | null;
  events: CalendarEvent[];
  onAddEvent?: () => void;
}

/**
 * DayDetailsPanel - Side panel showing events for a selected day (desktop)
 * On mobile, use Modal instead
 */
export const DayDetailsPanel = ({
  isOpen,
  onClose,
  dateKey,
  events,
  onAddEvent,
}: DayDetailsPanelProps) => {
  if (!dateKey) return null;

  const date = parseISO(dateKey);
  const sortedEvents = sortEventsByTime(events);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="fixed right-0 top-0 z-50 h-full w-full overflow-y-auto border-l border-slate-900/60 bg-slate-950/90 shadow-[0_20px_60px_rgba(2,6,23,0.95)] backdrop-blur-2xl sm:w-96"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-slate-900/60 bg-slate-950/90 px-6 py-4 backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    {formatRelativeDate(date)}
                  </p>
                  <h2 className="text-lg font-semibold text-slate-50">
                    {formatDate(date, "EEEE, MMMM d, yyyy")}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-900/50 text-slate-400 transition-smooth hover:border-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Add Event Button */}
              {onAddEvent && (
                <Button
                  size="sm"
                  icon={<Plus className="h-4 w-4" />}
                  onClick={onAddEvent}
                  className="mt-4 w-full rounded-full border-slate-800/60 bg-slate-900/60"
                >
                  Add Event
                </Button>
              )}
            </div>

            {/* Content */}
            <div className="space-y-4 p-6">
              {sortedEvents.length > 0 ? (
                <div className="space-y-3">
                  {sortedEvents.map((event, idx) => (
                    <div key={event.id} className="group rounded-2xl border border-slate-900/60 bg-slate-950/40 p-3 shadow-elevation-flat transition-colors hover:border-slate-800/70">
                      <EventIndicator event={event} showTime showLocation delay={idx * 0.04} />

                      {/* Quick Actions (placeholder for future) */}
                      <div className="mt-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-900/60 px-3 py-1.5 text-xs text-slate-400 transition-smooth hover:border-slate-800 hover:text-slate-100"
                          aria-label="View details"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </button>
                        <button
                          className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-900/60 px-3 py-1.5 text-xs text-slate-400 transition-smooth hover:border-slate-800 hover:text-slate-100"
                          aria-label="Mark complete"
                        >
                          <Check className="h-3 w-3" />
                          <span>Complete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Plus className="h-6 w-6" />}
                  title="No events scheduled"
                  description={`Add an event to ${formatRelativeDate(date).toLowerCase()} to keep your schedule organized.`}
                  action={
                    onAddEvent ? (
                      <Button size="sm" onClick={onAddEvent}>
                        Add Event
                      </Button>
                    ) : undefined
                  }
                />
              )}
            </div>

            {/* Footer Tip */}
            {sortedEvents.length > 0 && (
              <div className="border-t border-slate-900/60 bg-slate-950/80 p-4">
                <p className="text-xs text-slate-500">
                  Click an event to view full details and related assignments.
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

