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

/** Data for context cards (from dashboard API) */

export interface NextExamData {
  courseName: string;
  examTitle: string;
  date: string;
  daysUntil: number;
  type: string;
}

export interface WeeklyTasksData {
  completed: number;
  total: number;
  percentage: number;
}

export interface GpaTrendData {
  currentGpa: number;
  previousGpa: number;
  trend: "up" | "down" | "stable";
}

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

const EmptyCardMessage = ({ children }: { children: ReactNode }) => (
  <p className="text-xs text-slate-500 italic">{children}</p>
);

/**
 * NextExamCard - Shows upcoming exam with countdown (from dashboard data)
 */
export const NextExamCard = ({ nextExam }: { nextExam?: NextExamData | null }) => {
  if (!nextExam) {
    return (
      <ContextCardFrame accent="primary">
        <ContextCardHeader
          accent="primary"
          title="Next exam"
          subtitle="Upcoming"
          icon={<Calendar className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />}
        />
        <EmptyCardMessage>Add courses and assignments to see your next exam.</EmptyCardMessage>
      </ContextCardFrame>
    );
  }
  const examDate = new Date(nextExam.date);
  const formattedDate = examDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const prepCoverage = Math.min(92, Math.max(18, 100 - nextExam.daysUntil * 7));

  return (
    <ContextCardFrame accent="primary">
      <ContextCardHeader
        accent="primary"
        title="Next exam"
        subtitle={nextExam.courseName}
        icon={<Calendar className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />}
      />
      <MetadataRow
        items={[
          { icon: <Target className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />, label: nextExam.examTitle },
          { icon: <Calendar className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />, label: formattedDate },
          { icon: <Clock className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />, label: `${nextExam.daysUntil} days` },
        ]}
      />
      <PrimaryMetric value={String(nextExam.daysUntil)} suffix="days left" descriptor={`${nextExam.type} · ${nextExam.examTitle}`} />
      <ProgressBar accent="primary" label="Prep coverage" value={prepCoverage} hint={`${Math.round(prepCoverage)}% ready`} />
      <InsightLine>Schedule focused study blocks before the exam.</InsightLine>
    </ContextCardFrame>
  );
};

/**
 * WeeklyTasksCard - Shows task completion progress (from dashboard data)
 */
export const WeeklyTasksCard = ({ weeklyTasks }: { weeklyTasks?: WeeklyTasksData | null }) => {
  if (!weeklyTasks || (weeklyTasks.total === 0 && weeklyTasks.completed === 0)) {
    return (
      <ContextCardFrame accent="secondary">
        <ContextCardHeader
          accent="secondary"
          title="Execution pulse"
          subtitle="This week"
          icon={<CheckCircle2 className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />}
        />
        <EmptyCardMessage>Add tasks to track your weekly progress.</EmptyCardMessage>
      </ContextCardFrame>
    );
  }
  const remaining = Math.max(0, weeklyTasks.total - weeklyTasks.completed);
  return (
    <ContextCardFrame accent="secondary">
      <ContextCardHeader
        accent="secondary"
        title="Execution pulse"
        subtitle={`${weeklyTasks.total} tasks on deck`}
        icon={<CheckCircle2 className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />}
      />
      <MetadataRow
        items={[
          { icon: <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />, label: `${weeklyTasks.completed} done` },
          { icon: <Activity className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />, label: `${remaining} remaining` },
        ]}
      />
      <PrimaryMetric value={String(weeklyTasks.percentage)} suffix="% focus" descriptor={`${weeklyTasks.completed}/${weeklyTasks.total} complete`} />
      <ProgressBar accent="secondary" label="Execution" value={weeklyTasks.percentage} hint={`${weeklyTasks.completed}/${weeklyTasks.total}`} />
      <InsightLine>Keep completing tasks to build momentum.</InsightLine>
    </ContextCardFrame>
  );
};

/**
 * GpaTrendCard - Shows current GPA with trend indicator (from dashboard data)
 */
export const GpaTrendCard = ({ gpaTrend, targetGpa }: { gpaTrend?: GpaTrendData | null; targetGpa?: number | null }) => {
  if (!gpaTrend) {
    return (
      <ContextCardFrame accent="accent">
        <ContextCardHeader
          accent="accent"
          title="Current GPA"
          subtitle="Profile"
          icon={<TrendingUp className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />}
        />
        <EmptyCardMessage>Set your GPA in Profile to see trends.</EmptyCardMessage>
      </ContextCardFrame>
    );
  }
  const goal = targetGpa ?? 3.8;
  const delta = gpaTrend.currentGpa - gpaTrend.previousGpa;
  const trendLabel = gpaTrend.trend === "stable" ? "stable" : `${delta > 0 ? "+" : ""}${Math.abs(delta).toFixed(2)}`;
  const progressToGoal = Math.min(100, Math.max(0, (gpaTrend.currentGpa / 4) * 100));

  const trendIcon =
    gpaTrend.trend === "up" ? (
      <TrendingUp className="h-3.5 w-3.5 text-secondary-300" strokeWidth={1.8} aria-hidden="true" />
    ) : gpaTrend.trend === "down" ? (
      <TrendingDown className="h-3.5 w-3.5 text-warning-400" strokeWidth={1.8} aria-hidden="true" />
    ) : (
      <Minus className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.8} aria-hidden="true" />
    );

  return (
    <ContextCardFrame accent="accent">
      <ContextCardHeader
        accent="accent"
        title="Current GPA"
        subtitle="Rolling average"
        icon={<TrendingUp className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />}
      />
      <MetadataRow
        items={[
          { icon: trendIcon, label: `${trendLabel} vs previous` },
          { icon: <Target className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />, label: `Goal ${goal.toFixed(2)}` },
          { icon: <Clock className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />, label: `Prev ${gpaTrend.previousGpa.toFixed(2)}` },
        ]}
      />
      <PrimaryMetric value={gpaTrend.currentGpa.toFixed(2)} suffix="GPA" descriptor="From profile" />
      <ProgressBar accent="accent" label="Toward term goal" value={progressToGoal} hint={`${goal.toFixed(2)} goal`} />
      <InsightLine>Update your GPA in Profile to keep trends accurate.</InsightLine>
    </ContextCardFrame>
  );
};

