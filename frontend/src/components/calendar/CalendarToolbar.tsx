/**
 * CalendarToolbar Component
 * 
 * Navigation and view controls:
 * - Month/year navigation
 * - Today shortcut
 * - View switcher (month/week/agenda)
 * - Add event button
 */

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "../core/Button";
import clsx from "clsx";
import { format } from "date-fns";

export type CalendarView = "month" | "week" | "agenda";
export type ViewMode = CalendarView; // Alias for compatibility

interface CalendarToolbarProps {
  // Accept either formatted labels or a date
  currentDate: Date;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export const CalendarToolbar = ({
  currentDate,
  viewMode,
  onViewModeChange,
  onPrevious,
  onNext,
  onToday,
}: CalendarToolbarProps) => {
  const monthLabel = format(currentDate, "MMMM");
  const yearLabel = format(currentDate, "yyyy");

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-900/60 bg-slate-950/40 p-4 shadow-elevation-low sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Month navigation */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={onPrevious}
            className={clsx(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-900/70",
              "bg-slate-950/50 text-slate-400 transition-smooth",
              "hover:border-slate-800 hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            )}
            aria-label={viewMode === "week" ? "Previous week" : "Previous month"}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={onNext}
            className={clsx(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-900/70",
              "bg-slate-950/50 text-slate-400 transition-smooth",
              "hover:border-slate-800 hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            )}
            aria-label={viewMode === "week" ? "Next week" : "Next month"}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Current period</p>
          <h2 className="text-2xl font-semibold text-slate-100">
          {monthLabel} {yearLabel}
          </h2>
        </div>
        
        <Button variant="outline" size="sm" onClick={onToday} className="rounded-full border-slate-800/60 bg-slate-900/40 text-slate-200">
          Today
        </Button>
      </div>

      {/* Right: View switcher */}
      <div className="flex items-center gap-3">
        <div className="inline-flex rounded-full border border-slate-800/60 bg-slate-950/40 p-1">
          <button
            onClick={() => onViewModeChange("month")}
            className={clsx(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-smooth",
              viewMode === "month"
                ? "bg-primary-500/20 text-primary-100 shadow-elevation-low"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            )}
          >
            Month
          </button>
          <button
            onClick={() => onViewModeChange("week")}
            className={clsx(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-smooth",
              viewMode === "week"
                ? "bg-primary-500/20 text-primary-100 shadow-elevation-low"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            )}
          >
            Week
          </button>
          <button
            onClick={() => onViewModeChange("agenda")}
            className={clsx(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-smooth",
              viewMode === "agenda"
                ? "bg-primary-500/20 text-primary-100 shadow-elevation-low"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            )}
          >
            Agenda
          </button>
        </div>
      </div>
    </div>
  );
};
