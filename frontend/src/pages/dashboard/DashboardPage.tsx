import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  PageShell,
  PageSection,
  Heading,
  Text,
  Card,
  SectionHeader,
  StatCard,
  Badge,
  SkeletonList,
  Button,
} from "../../components";
import { SkeletonStatCard } from "../../components/core/Skeleton";
import { useDashboard } from "../../hooks/useDashboard";
import { GpaTrendChart, WeeklyTasksChart, StudyTimeByCourseChart } from "../../components/dashboard";
import { useNavigate } from "react-router-dom";

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02
    }
  }
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.24,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const buildAnalyticsInsight = (
  gpaTrendDirection: "up" | "down" | "neutral",
  gpaTrendValue: string,
  weeklyCompletionRate: number,
  totalPlanned: number
) => {
  const trendCopy =
    gpaTrendDirection === "up" && gpaTrendValue
      ? `GPA is up ${gpaTrendValue}`
      : gpaTrendDirection === "down" && gpaTrendValue
      ? `GPA dipped ${gpaTrendValue}`
      : "GPA is holding steady";

  const weeklyCopy =
    totalPlanned > 0
      ? `you’re completing ${Math.round(weeklyCompletionRate)}% of planned work`
      : "log a few tasks to get completion analytics";

  return `${trendCopy}, and ${weeklyCopy}.`;
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { overview, loading, error, refresh } = useDashboard();

  if (loading) {
    return (
      <PageShell>
        <PageSection>
          <header>
            <Heading level="h1">Dashboard</Heading>
            <Text variant="body" color="muted" className="mt-2">
              Overview of your GPA, upcoming deadlines, and focus for the week.
            </Text>
          </header>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
          <SkeletonList count={3} />
        </PageSection>
      </PageShell>
    );
  }

  if (error && !overview) {
    return (
      <PageShell>
        <PageSection>
          <header>
            <Heading level="h1">Dashboard</Heading>
            <Text variant="body" color="muted" className="mt-2">
              Overview of your GPA, upcoming deadlines, and focus for the week.
            </Text>
          </header>
          <Card variant="default" padding="md" className="border-error-500/30 bg-error-500/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-error-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-error-200">Failed to load dashboard</p>
                  <p className="mt-1 text-xs text-slate-400">{error}</p>
                </div>
              </div>
              <Button size="sm" variant="primary" onClick={() => refresh()}>
                Try again
              </Button>
            </div>
          </Card>
        </PageSection>
      </PageShell>
    );
  }

  // Calculate metrics for stat cards
  const currentGpa = overview?.current_gpa;
  const targetGpa = overview?.target_gpa ?? null;
  const gpaTrend = overview?.gpa_trend || [];
  const hasGpaTrend = gpaTrend.length >= 2;
  
  // Calculate GPA trend for stat card
  let gpaTrendDirection: "up" | "down" | "neutral" = "neutral";
  let gpaTrendValue = "";
  
  if (hasGpaTrend) {
    const firstGpa = gpaTrend[0].gpa;
    const lastGpa = gpaTrend[gpaTrend.length - 1].gpa;
    const delta = lastGpa - firstGpa;
    
    if (delta > 0.05) {
      gpaTrendDirection = "up";
      gpaTrendValue = `+${delta.toFixed(2)}`;
    } else if (delta < -0.05) {
      gpaTrendDirection = "down";
      gpaTrendValue = `${delta.toFixed(2)}`;
    }
  }

  // Filter upcoming deadlines for next 2-4 weeks
  const now = new Date();
  const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const fourWeeksFromNow = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000);
  const upcomingDeadlines = overview?.upcoming_deadlines?.filter(d => {
    const dueDate = new Date(d.due_at);
    return dueDate >= now && dueDate <= fourWeeksFromNow;
  }) || [];

  // Calculate weekly task completion stats
  const weeklyTaskStats = overview?.weekly_task_stats || [];
  const totalCompleted = weeklyTaskStats.reduce((sum, d) => sum + d.completed, 0);
  const totalPlanned = weeklyTaskStats.reduce((sum, d) => sum + d.planned, 0);
  const weeklyTasksDisplay = totalPlanned > 0 ? `${totalCompleted}/${totalPlanned}` : totalCompleted;
  const weeklyCompletionRate = totalPlanned > 0 ? (totalCompleted / totalPlanned) * 100 : 0;

  // Get next 3 tasks sorted by due date
  const allTasks = [...(overview?.weekly_tasks || []), ...(overview?.upcoming_deadlines || [])];
  const next3Tasks = allTasks
    .filter(task => task.due_at)
    .sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime())
    .slice(0, 3);

  const studyTimeByCourse = overview?.study_time_by_course || [];

  return (
    <PageShell>
      <motion.div
        variants={staggerChildren}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* Header */}
        <motion.header variants={fadeInUp}>
          <Heading level="h1">Dashboard</Heading>
          <Text variant="body" color="muted" className="mt-1">
            Academic performance overview for this semester.
          </Text>
        </motion.header>

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          variants={fadeInUp}
        >
          <StatCard
            label="Current GPA"
            value={currentGpa != null ? currentGpa.toFixed(2) : "—"}
            icon={gpaTrendDirection === "down" ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
            trend={gpaTrendDirection}
            trendValue={gpaTrendValue || undefined}
          />
          <StatCard
            label="Upcoming Deadlines"
            value={upcomingDeadlines.length}
            icon={<Calendar className="h-4 w-4" />}
          />
          <StatCard
            label="Weekly Tasks"
            value={weeklyTasksDisplay}
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
        </motion.div>

        {/* Insight bar */}
        <motion.div variants={fadeInUp}>
          <div className="flex items-center gap-3 rounded-xl border border-slate-800/60 bg-slate-950/60 px-4 py-3 text-xs backdrop-blur-sm">
            <span className="shrink-0 font-semibold uppercase tracking-widest text-slate-500">This week</span>
            <span className="h-3 w-px shrink-0 bg-slate-700/80" />
            <span className="text-slate-300">
              {buildAnalyticsInsight(gpaTrendDirection, gpaTrendValue, weeklyCompletionRate, totalPlanned)}
            </span>
          </div>
        </motion.div>

        {/* Main analytics grid: left wider, right narrower */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
        >
          {/* LEFT column: GPA trend + upcoming tasks */}
          <div className="space-y-5">
            <GpaTrendChart data={gpaTrend} currentGpa={currentGpa} targetGpa={targetGpa} />

            {/* Next 3 Tasks */}
            <Card variant="elevated" padding="md">
              <SectionHeader title="Upcoming Tasks" subtitle="Your next 3 priorities" small />
              <div className="mt-3 space-y-2">
                {next3Tasks.length > 0 ? (
                  next3Tasks.map((task, index) => (
                    <motion.div
                      key={`task-${task.id}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                      className="group flex items-center gap-3 rounded-xl border border-slate-800/60 bg-surface-base px-3 py-2.5 shadow-elevation-low transition-all duration-quick ease-snappy hover:border-slate-700/80 hover:bg-surface-elevated hover:-translate-y-0.5"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-400 transition-colors group-hover:bg-primary-500/20">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-100">{task.title}</p>
                        <p className="text-xs text-slate-400">
                          Due{" "}
                          {new Date(task.due_at!).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {"priority" in task && (
                        <Badge
                          variant={task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "default"}
                          size="sm"
                        >
                          {task.priority}
                        </Badge>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-slate-800/50 bg-slate-950/30 px-3 py-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-300">All caught up!</p>
                      <p className="text-xs text-slate-500">No upcoming tasks right now.</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate("/calendar")}>
                      Plan tasks
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT column: weekly tasks chart + study time chart */}
          <div className="space-y-5">
            <WeeklyTasksChart data={weeklyTaskStats} />
            <StudyTimeByCourseChart data={studyTimeByCourse} />
          </div>
        </motion.div>
      </motion.div>
    </PageShell>
  );
};


