import { motion } from "framer-motion";
import { CalendarEvent } from "../../api/plannerApi";
import { 
  inferEventCategory, 
  getCategoryColors, 
  formatEventTimeRange, 
  isAllDayEvent 
} from "../../utils/calendar";
import { Clock, MapPin } from "lucide-react";

interface EventIndicatorProps {
  event: CalendarEvent;
  compact?: boolean;
  showTime?: boolean;
  showLocation?: boolean;
  delay?: number;
}

/**
 * EventIndicator - Display event with category colors and metadata
 */
export const EventIndicator = ({
  event,
  compact = false,
  showTime = false,
  showLocation = false,
  delay = 0,
}: EventIndicatorProps) => {
  const category = inferEventCategory(event.type);
  const colors = getCategoryColors(category);
  const allDay = isAllDayEvent(event.start_at, event.end_at);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
        className={`truncate rounded-lg border px-2 py-1 text-[10px] font-medium leading-tight shadow-elevation-flat transition-all duration-quick ease-snappy hover:shadow-elevation-low ${colors.bg} ${colors.border} ${colors.text}`}
        title={`${event.title}${!allDay ? ` • ${formatEventTimeRange(event.start_at, event.end_at)}` : ""}`}
      >
        <div className="flex items-center gap-1.5">
          <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${colors.dot}`} />
          <span className="truncate">{event.title}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
      className={`rounded-xl border p-3 shadow-elevation-low backdrop-blur-sm ${colors.bg} ${colors.border}`}
    >
      <div className="flex items-start gap-2">
        <div className={`mt-1 h-2 w-2 shrink-0 rounded-full shadow-sm ${colors.dot}`} />
        <div className="flex-1 space-y-1.5">
          <h4 className={`text-sm font-semibold leading-snug ${colors.text}`}>{event.title}</h4>
          
          {event.description && (
            <p className="text-xs leading-relaxed text-slate-400 line-clamp-2">{event.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-[11px] leading-tight text-slate-400">
            {(showTime || !allDay) && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {allDay ? "All day" : formatEventTimeRange(event.start_at, event.end_at)}
                </span>
              </div>
            )}

            {showLocation && event.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

