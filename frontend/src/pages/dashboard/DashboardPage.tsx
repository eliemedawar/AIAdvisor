import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  BookOpen,
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
  EmptyState,
  SkeletonCard,
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
  const { overview, loading, error } = useDashboard();

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

  // Calculate metrics for stat cards
  const currentGpa = overview?.current_gpa;
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

  // Identify at-risk courses (low study hours)
  const studyTimeByCourse = overview?.study_time_by_course || [];
  const atRiskCourses = studyTimeByCourse.filter(c => c.hours < 5);

  return (
    <PageShell>
      <motion.div
        variants={staggerChildren}
        initial="initial"
        animate="animate"
      >
        <PageSection className="space-y-8 lg:space-y-10">
          <header>
            <Heading level="h1">Dashboard</Heading>
            <Text variant="body" color="muted" className="mt-2">
              Analytics-driven insights into your academic performance and priorities.
            </Text>
          </header>

          {/* TOP ROW - Key Stats */}
          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
            variants={fadeInUp}
          >
            <StatCard
              label="Current GPA"
              value={currentGpa != null ? currentGpa.toFixed(2) : "—"}
              icon={gpaTrendDirection === "up" ? <TrendingUp className="h-4 w-4" /> : gpaTrendDirection === "down" ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
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

          {/* MIDDLE - Charts and Trends */}
          <section className="space-y-4">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <SectionHeader
                title="Performance pulse"
                subtitle="GPA and task velocity stay aligned for healthier pacing."
                small
              />
              <Text
                variant="small"
                className="rounded-xl border border-slate-800/60 bg-slate-950/60 px-4 py-2.5 text-slate-300 shadow-elevation-flat backdrop-blur-sm"
              >
                {buildAnalyticsInsight(gpaTrendDirection, gpaTrendValue, weeklyCompletionRate, totalPlanned)}
              </Text>
            </div>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              {/* Left - GPA Trend */}
              <motion.div variants={fadeInUp} className="h-full">
                <GpaTrendChart
                  data={gpaTrend}
                  currentGpa={currentGpa}
                  className="h-full"
                />
              </motion.div>

              {/* Right - Stacked Charts (1 column) */}
              <motion.div variants={fadeInUp} className="space-y-5">
                <WeeklyTasksChart data={weeklyTaskStats} className="min-h-[240px]" />
                <StudyTimeByCourseChart data={studyTimeByCourse} className="min-h-[260px]" />
              </motion.div>
            </div>
          </section>

          {/* BOTTOM - Actionable Lists */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
            {/* Next 3 Tasks */}
            <motion.div variants={fadeInUp} className="h-full">
              <Card variant="elevated" className="h-full">
                <SectionHeader
                  title="Next 3 Tasks"
                  subtitle="Your immediate priorities"
                  small
                />
                <div className="mt-4 space-y-3">
                  {next3Tasks.length > 0 ? (
                    next3Tasks.map((task, index) => (
                      <motion.div
                        key={`task-${task.id}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                        className="group flex items-center justify-between rounded-xl border border-slate-800/60 bg-surface-base px-4 py-3 shadow-elevation-low transition-all duration-quick ease-snappy hover:bg-surface-elevated hover:border-slate-700/80 hover:shadow-elevation-mid hover:-translate-y-0.5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10 text-primary-400 transition-colors group-hover:bg-primary-500/20">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-100">
                              {task.title}
                            </p>
                            <p className="text-xs text-slate-400">
                              Due{" "}
                              {new Date(task.due_at!).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          </div>
                        </div>
                        {"priority" in task && (
                          <Badge
                            variant={
                              task.priority === "high"
                                ? "danger"
                                : task.priority === "medium"
                                ? "warning"
                                : "default"
                            }
                            size="sm"
                          >
                            {task.priority}
                          </Badge>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <EmptyState
                      icon={<CheckCircle2 className="h-8 w-8" />}
                      title="No upcoming tasks"
                      description="You're all caught up. Plan your next focus items to stay proactive."
                      action={
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => navigate("/calendar")}
                        >
                          Plan tasks
                        </Button>
                      }
                    />
                  )}
                </div>
              </Card>
            </motion.div>

            {/* At-Risk Courses */}
            <motion.div variants={fadeInUp} className="h-full">
              <Card variant="elevated" className="h-full">
                <SectionHeader
                  title="At-Risk Courses"
                  subtitle="Courses needing more attention"
                  small
                />
                <div className="mt-4 space-y-3">
                  {atRiskCourses.length > 0 ? (
                    atRiskCourses.map((course, index) => (
                      <motion.div
                        key={`course-${index}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                        className="group flex items-center justify-between rounded-xl border border-warning-500/30 bg-warning-500/5 px-4 py-3 shadow-elevation-low transition-all duration-quick ease-snappy hover:bg-warning-500/10 hover:border-warning-500/50 hover:shadow-elevation-mid hover:-translate-y-0.5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-500/10 text-warning-400">
                            <AlertCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-100">
                              {course.courseName}
                            </p>
                            <p className="text-xs text-slate-400">
                              Only {course.hours}h study time this week
                            </p>
                          </div>
                        </div>
                        <Badge variant="warning" size="sm">
                          Plan study
                        </Badge>
                      </motion.div>
                    ))
                  ) : (
                    <EmptyState
                      icon={<BookOpen className="h-8 w-8" />}
                      title="All courses on track"
                      description="Your study time is well distributed across every course this week."
                      action={
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate("/calendar")}
                        >
                          Review schedule
                        </Button>
                      }
                    />
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Show subtle error banner if there was an error but we have mock data */}
          {error && overview && (
            <motion.div variants={fadeInUp}>
              <Card variant="default" padding="sm" className="border-warning-500/30 bg-warning-500/5 shadow-elevation-low">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-warning-400 shrink-0" />
                  <Text variant="small" className="text-warning-300">
                    Unable to connect to server. Showing sample data for demonstration.
                  </Text>
                </div>
              </Card>
            </motion.div>
          )}
        </PageSection>
      </motion.div>
    </PageShell>
  );
};


