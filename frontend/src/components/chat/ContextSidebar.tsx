import { useState, useEffect, ReactNode, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import {
  NextExamCard,
  WeeklyTasksCard,
  GpaTrendCard,
  type NextExamData,
  type WeeklyTasksData,
  type GpaTrendData,
} from "./ContextCards";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useDashboard } from "../../hooks/useDashboard";

interface ContextSidebarProps {
  className?: string;
}

const SIDEBAR_STORAGE_KEY = "ai-advisor-sidebar-visible";
const SIDEBAR_WIDTH = 320;

interface ContextSectionProps {
  label: string;
  caption: string;
  children: ReactNode;
}

const ContextDivider = () => (
  <div
    className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
    aria-hidden="true"
  />
);

const ContextSection = ({ label, caption, children }: ContextSectionProps) => (
  <section className="space-y-3">
    <div className="flex items-baseline justify-between">
      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
        {label}
      </p>
      <span className="text-[11px] text-slate-500/80">{caption}</span>
    </div>
    {children}
  </section>
);

function deriveNextExam(overview: { upcoming_deadlines?: Array<{ course_name?: string; title: string; due_at: string; type: string }> }): NextExamData | null {
  const list = overview?.upcoming_deadlines;
  if (!list?.length) return null;
  const a = list[0];
  const due = new Date(a.due_at);
  const now = new Date();
  const daysUntil = Math.max(0, Math.ceil((due.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
  return {
    courseName: a.course_name ?? "—",
    examTitle: a.title,
    date: a.due_at,
    daysUntil,
    type: a.type,
  };
}

function deriveWeeklyTasks(overview: { weekly_task_stats?: Array<{ completed: number; planned: number }> }): WeeklyTasksData | null {
  const stats = overview?.weekly_task_stats;
  if (!stats?.length) return null;
  const completed = stats.reduce((s, d) => s + d.completed, 0);
  const total = stats.reduce((s, d) => s + d.planned, 0);
  if (total === 0 && completed === 0) return null;
  return { completed, total, percentage: total ? Math.round((completed / total) * 100) : 0 };
}

function deriveGpaTrend(overview: { current_gpa?: number | null; gpa_trend?: Array<{ gpa: number }> }): GpaTrendData | null {
  const current = overview?.current_gpa;
  if (current == null) return null;
  const trend = overview?.gpa_trend ?? [];
  const previous = trend.length >= 2 ? trend[trend.length - 2].gpa : current;
  const trendDir: "up" | "down" | "stable" =
    current > previous ? "up" : current < previous ? "down" : "stable";
  return { currentGpa: current, previousGpa: previous, trend: trendDir };
}

const ContextStack = () => {
  const { overview } = useDashboard();
  const nextExam = useMemo(() => (overview ? deriveNextExam(overview) : null), [overview]);
  const weeklyTasks = useMemo(() => (overview ? deriveWeeklyTasks(overview) : null), [overview]);
  const gpaTrend = useMemo(() => (overview ? deriveGpaTrend(overview) : null), [overview]);
  return (
    <div className="flex flex-col gap-6">
      <ContextSection label="Next exam" caption="Countdown & prep">
        <NextExamCard nextExam={nextExam} />
      </ContextSection>
      <ContextDivider />
      <ContextSection label="This week's focus" caption="Tasks & energy">
        <WeeklyTasksCard weeklyTasks={weeklyTasks} />
      </ContextSection>
      <ContextDivider />
      <ContextSection label="Current GPA" caption="Rolling trend">
        <GpaTrendCard gpaTrend={gpaTrend} />
      </ContextSection>
    </div>
  );
};

export const ContextSidebarContent = ContextStack;

export const ContextSidebar = ({ className = "" }: ContextSidebarProps) => {
  const { isDesktop } = useBreakpoint();
  const [isVisible, setIsVisible] = useState(() => {
    // Load visibility state from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return stored !== null ? stored === 'true' : true; // Default to visible
    }
    return true;
  });

  // Save visibility state to localStorage
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isVisible));
  }, [isVisible]);

  // Don't render on mobile/tablet
  if (!isDesktop) {
    return null;
  }

  return (
    <div className="relative h-full">
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsVisible(!isVisible)}
        className="absolute right-0 top-1/2 z-20 flex h-16 w-10 -translate-y-1/2 items-center justify-center rounded-l-2xl border border-r-0 border-slate-900/70 bg-slate-950/90 text-slate-400 shadow-elevation-mid backdrop-blur-2xl transition-all duration-quick ease-snappy hover:bg-slate-900/70 hover:text-white focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#a855f7,0_0_0_7px_rgba(168,85,247,0.25)]"
        style={{ right: isVisible ? `${SIDEBAR_WIDTH}px` : "0" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-pressed={isVisible}
        aria-label={isVisible ? "Hide sidebar" : "Show sidebar"}
      >
        {isVisible ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.aside
            initial={{ x: SIDEBAR_WIDTH, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: SIDEBAR_WIDTH, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 28,
            }}
            className={`flex h-full w-80 shrink-0 flex-col overflow-hidden border-l border-slate-900/70 bg-slate-950/85 text-slate-100 shadow-elevation-mid ring-1 ring-black/60 backdrop-blur-2xl ${className}`}
          >
            {/* Header */}
            <div className="border-b border-slate-900/70 bg-slate-950/60 px-5 py-4 shadow-[inset_0_-1px_0_rgba(15,23,42,0.45)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">
                Live context
              </p>
              <h3 className="mt-2 text-lg font-semibold leading-tight text-white">
                Your academic overview
              </h3>
            </div>

            {/* Context Cards */}
            <div className="scrollable flex-1 overflow-y-auto px-5 py-5">
              <ContextStack />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

