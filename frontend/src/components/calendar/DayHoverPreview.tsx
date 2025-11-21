/**
 * DayHoverPreview Component
 * 
 * Floating preview card shown on hover over a day cell.
 * Displays up to 3 events with time ranges and categories.
 */

import { motion, AnimatePresence } from "framer-motion";
import { CalendarEvent } from "../../api/plannerApi";
import { EventIndicator } from "./EventIndicator";
import { formatRelativeDate, formatDate } from "../../utils/calendar";
import { parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

interface DayHoverPreviewProps {
  isVisible: boolean;
  dateKey: string | null;
  events: CalendarEvent[];
  position: { x: number; y: number };
}

/**
 * Check if user prefers reduced motion
 */
const prefersReducedMotion = () => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return false;
};

export const DayHoverPreview = ({
  isVisible,
  dateKey,
  events,
  position,
}: DayHoverPreviewProps) => {
  if (!dateKey) return null;

  const date = parseISO(dateKey);
  const visibleEvents = events.slice(0, 3);
  const remainingCount = events.length - 3;
  const reducedMotion = prefersReducedMotion();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.96 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.96 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.24, ease: [0.4, 0, 0.2, 1] }}
          className="pointer-events-none fixed z-50 w-80 max-w-sm rounded-xl border border-slate-800/70 bg-slate-950/95 p-4 shadow-elevation-overlay backdrop-blur-2xl"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: "translate(-50%, -100%) translateY(-12px)",
          }}
        >
          {/* Header */}
          <div className="mb-3 border-b border-slate-900/60 pb-2.5">
            <p className="text-[11px] font-medium uppercase leading-tight tracking-wide text-slate-500">
              {formatRelativeDate(date)}
            </p>
            <p className="mt-0.5 text-sm font-semibold leading-snug text-slate-100">{formatDate(date, "EEEE, MMM d")}</p>
          </div>

          {/* Events */}
          {events.length > 0 ? (
            <div className="space-y-2.5 max-h-64 overflow-y-auto scrollable pr-1">
              {visibleEvents.map((event, idx) => (
                <EventIndicator key={event.id} event={event} showTime showLocation delay={idx * 0.04} />
              ))}
              
              {remainingCount > 0 && (
                <p className="pt-1 text-xs leading-tight text-slate-500">
                  +{remainingCount} more event{remainingCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-800/60 bg-slate-950/40 px-3 py-2.5 text-slate-500">
              <CalendarIcon className="h-4 w-4" />
              <p className="text-xs leading-snug">No events scheduled</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

