import { ReactNode } from "react";
import {
  Calendar,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Target,
  Activity,
} from "lucide-react";
import clsx from "clsx";
import { Card } from "../core/Card";

/**
 * Mock data for context cards
 * In production, this would come from the dashboard API
 */

interface NextExamData {
  courseName: string;
  examTitle: string;
  date: string;
  daysUntil: number;
  type: string;
}

interface WeeklyTasksData {
  completed: number;
  total: number;
  percentage: number;
}

interface GpaTrendData {
  currentGpa: number;
  previousGpa: number;
  trend: "up" | "down" | "stable";
}

const mockNextExam: NextExamData = {
  courseName: "CS 301",
  examTitle: "Midterm Exam",
  date: "2024-11-28",
  daysUntil: 7,
  type: "Midterm",
};

const mockWeeklyTasks: WeeklyTasksData = {
  completed: 8,
  total: 12,
  percentage: 67,
};

const mockGpaTrend: GpaTrendData = {
  currentGpa: 3.72,
  previousGpa: 3.65,
  trend: "up",
};

type Accent = "primary" | "secondary" | "accent";

const accentTokens: Record<
  Accent,
  { icon: string; glow: string; bar: string }
> = {
  primary: {
    icon: "border-primary-500/30 bg-primary-500/10 text-primary-100",
    glow: "from-primary-500/25 via-transparent to-transparent",
    bar: "from-primary-500 via-accent-500 to-accent-400",
  },
  secondary: {
    icon: "border-secondary-500/30 bg-secondary-500/10 text-secondary-100",
    glow: "from-secondary-500/20 via-transparent to-transparent",
    bar: "from-secondary-400 via-secondary-500 to-secondary-300",
  },
  accent: {
    icon: "border-accent-500/30 bg-accent-500/10 text-accent-100",
    glow: "from-accent-500/25 via-transparent to-transparent",
    bar: "from-accent-400 via-accent-500 to-primary-400",
  },
};

interface ContextCardFrameProps {
  accent: Accent;
  children: ReactNode;
}

const ContextCardFrame = ({ accent, children }: ContextCardFrameProps) => (
  <Card
    variant="glass"
    padding="none"
    className={clsx(
      "group relative isolate overflow-hidden rounded-[22px] border border-slate-900/70 bg-slate-950/75 text-slate-100 shadow-elevation-high ring-1 ring-black/30 transition-all duration-quick ease-snappy hover:-translate-y-0.5 hover:ring-black/40 focus-within:-translate-y-0.5"
    )}
  >
    <div
      className={clsx(
        "pointer-events-none absolute inset-0 opacity-60 blur-3xl",
        "bg-gradient-to-br",
        accentTokens[accent].glow
      )}
      aria-hidden="true"
    />
    <div
      className="pointer-events-none absolute inset-[1px] rounded-[20px] border border-white/5"
      aria-hidden="true"
    />
    <div className="relative z-10 flex flex-col gap-5 p-5">{children}</div>
  </Card>
);

interface IconBadgeProps {
  accent: Accent;
  children: ReactNode;
}

const IconBadge = ({ accent, children }: IconBadgeProps) => (
  <div
    className={clsx(
      "flex h-10 w-10 items-center justify-center rounded-xl border text-sm shadow-elevation-low",
      accentTokens[accent].icon
    )}
  >
    {children}
  </div>
);

interface MetadataItem {
  label: string;
  icon?: ReactNode;
}

const MetadataRow = ({ items }: { items: MetadataItem[] }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item, index) => (
      <span
        key={`${item.label}-${index}`}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-900/60 bg-slate-900/60 px-3 py-1 text-[11px] font-medium text-slate-300"
      >
        {item.icon && (
          <span className="text-slate-400" aria-hidden="true">
            {item.icon}
          </span>
        )}
        {item.label}
      </span>
    ))}
  </div>
);

interface PrimaryMetricProps {
  value: string;
  suffix?: string;
  descriptor?: string;
}

const PrimaryMetric = ({ value, suffix, descriptor }: PrimaryMetricProps) => (
  <div className="space-y-1.5">
    <div className="flex items-baseline gap-2 text-4xl font-semibold tracking-tight text-white">
      <span>{value}</span>
      {suffix && (
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
          {suffix}
        </span>
      )}
    </div>
    {descriptor && <p className="text-sm text-slate-400">{descriptor}</p>}
  </div>
);

interface ProgressBarProps {
  value: number;
  accent: Accent;
  label: string;
  hint?: string;
}

const ProgressBar = ({ value, accent, label, hint }: ProgressBarProps) => {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-slate-500">
        <span>{label}</span>
        <span className="text-xs font-semibold text-slate-200">
          {hint ?? `${Math.round(safeValue)}%`}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-900/70">
        <div
          className={clsx(
            "h-full rounded-full bg-gradient-to-r",
            accentTokens[accent].bar
          )}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
};

const InsightLine = ({ children }: { children: ReactNode }) => (
  <p className="border-t border-slate-900/60 pt-3 text-xs text-slate-400">
    {children}
  </p>
);

interface ContextCardHeaderProps {
  title: string;
  subtitle: string;
  accent: Accent;
  icon: ReactNode;
}

const ContextCardHeader = ({
  title,
  subtitle,
  accent,
  icon,
}: ContextCardHeaderProps) => (
  <div className="flex items-center gap-3">
    <IconBadge accent={accent}>{icon}</IconBadge>
    <div className="min-w-0">
      <p className="text-sm font-semibold leading-tight text-white">{title}</p>
      <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
  </div>
);

/**
 * NextExamCard - Shows upcoming exam with countdown
 */
export const NextExamCard = () => {
  const exam = mockNextExam;
  const examDate = new Date(exam.date);
  const formattedDate = examDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const prepCoverage = Math.min(92, Math.max(18, 100 - exam.daysUntil * 7));

  return (
    <ContextCardFrame accent="primary">
      <ContextCardHeader
        accent="primary"
        title="Next exam"
        subtitle={exam.courseName}
        icon={
          <Calendar className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
        }
      />
      <MetadataRow
        items={[
          {
            icon: (
              <Target
                className="h-3.5 w-3.5"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            ),
            label: exam.examTitle,
          },
          {
            icon: (
              <Calendar
                className="h-3.5 w-3.5"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            ),
            label: formattedDate,
          },
          {
            icon: (
              <Clock
                className="h-3.5 w-3.5"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            ),
            label: `${exam.daysUntil} days`,
          },
        ]}
      />
      <PrimaryMetric
        value={String(exam.daysUntil)}
        suffix="days left"
        descriptor="Schedule 3 focused blocks before Monday"
      />
      <ProgressBar
        accent="primary"
        label="Prep coverage"
        value={prepCoverage}
        hint={`${Math.round(prepCoverage)}% ready`}
      />
      <InsightLine>Best recall window: Thu 3-5p.</InsightLine>
    </ContextCardFrame>
  );
};

/**
 * WeeklyTasksCard - Shows task completion progress
 */
export const WeeklyTasksCard = () => {
  const tasks = mockWeeklyTasks;
  const remaining = Math.max(0, tasks.total - tasks.completed);

  return (
    <ContextCardFrame accent="secondary">
      <ContextCardHeader
        accent="secondary"
        title="Execution pulse"
        subtitle={`${tasks.total} tasks on deck`}
        icon={
          <CheckCircle2
            className="h-4 w-4"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        }
      />
      <MetadataRow
        items={[
          {
            icon: (
              <CheckCircle2
                className="h-3.5 w-3.5"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            ),
            label: `${tasks.completed} done`,
          },
          {
            icon: (
              <Activity
                className="h-3.5 w-3.5"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            ),
            label: `${remaining} remaining`,
          },
          {
            icon: (
              <Calendar
                className="h-3.5 w-3.5"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            ),
            label: "Next checkpoint Fri",
          },
        ]}
      />
      <PrimaryMetric
        value={String(tasks.percentage)}
        suffix="% focus"
        descriptor={`${tasks.completed}/${tasks.total} complete`}
      />
      <ProgressBar
        accent="secondary"
        label="Execution"
        value={tasks.percentage}
        hint={`${tasks.completed}/${tasks.total}`}
      />
      <InsightLine>Best focus: Thu afternoon.</InsightLine>
    </ContextCardFrame>
  );
};

/**
 * GpaTrendCard - Shows current GPA with trend indicator
 */
export const GpaTrendCard = () => {
  const gpa = mockGpaTrend;
  const targetGpa = 3.8;
  const delta = gpa.currentGpa - gpa.previousGpa;
  const trendLabel =
    gpa.trend === "stable"
      ? "stable"
      : `${delta > 0 ? "+" : ""}${Math.abs(delta).toFixed(2)}`;
  const progressToGoal = Math.min(
    100,
    Math.max(0, (gpa.currentGpa / 4) * 100)
  );

  const trendIcon = (() => {
    switch (gpa.trend) {
      case "up":
        return (
          <TrendingUp
            className="h-3.5 w-3.5 text-secondary-300"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        );
      case "down":
        return (
          <TrendingDown
            className="h-3.5 w-3.5 text-warning-400"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        );
      default:
        return (
          <Minus
            className="h-3.5 w-3.5 text-slate-400"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        );
    }
  })();

  return (
    <ContextCardFrame accent="accent">
      <ContextCardHeader
        accent="accent"
        title="Current GPA"
        subtitle="Rolling 6-week average"
        icon={
          <TrendingUp
            className="h-4 w-4"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        }
      />
      <MetadataRow
        items={[
          { icon: trendIcon, label: `${trendLabel} vs last term` },
          {
            icon: (
              <Target
                className="h-3.5 w-3.5"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            ),
            label: `Goal ${targetGpa.toFixed(2)}`,
          },
          {
            icon: (
              <Clock
                className="h-3.5 w-3.5"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            ),
            label: `Prev ${gpa.previousGpa.toFixed(2)}`,
          },
        ]}
      />
      <PrimaryMetric
        value={gpa.currentGpa.toFixed(2)}
        suffix="GPA"
        descriptor="Updated this week"
      />
      <ProgressBar
        accent="accent"
        label="Toward term goal"
        value={progressToGoal}
        hint={`${targetGpa.toFixed(2)} goal`}
      />
      <InsightLine>Keep labs above A- to secure the 3.8 target.</InsightLine>
    </ContextCardFrame>
  );
};

