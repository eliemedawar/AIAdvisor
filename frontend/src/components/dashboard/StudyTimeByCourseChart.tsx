import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { BookOpen, AlertCircle } from "lucide-react";
import { Card, SectionHeader, Text, EmptyState, Button, Badge } from "../index";
import { StudyTimeByCourse } from "../../api/dashboardApi";
import { primary, semantic } from "../../styles/design-tokens";

const chartColors = {
  primary: primary[400],
  warning: semantic.warning[500],
  grid: "rgba(148, 163, 184, 0.12)",
  axis: "#94a3b8",
};

const StudyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const [bar] = payload;
  return (
    <div className="rounded-xl border border-slate-800/70 bg-slate-950/95 p-3 text-xs text-slate-200 shadow-elevation-overlay backdrop-blur-xl">
      <p className="text-[11px] font-medium leading-tight text-slate-400">{label}</p>
      <p className="mt-1.5 text-sm font-semibold leading-snug text-slate-100">
        {bar.value}h logged
      </p>
    </div>
  );
};

interface StudyTimeByCourseChartProps {
  data: StudyTimeByCourse[];
  className?: string;
}

/**
 * StudyTimeByCourseChart - Horizontal bar chart showing study time distribution
 * 
 * Displays study hours per course with insights and at-risk identification.
 */
export const StudyTimeByCourseChart = ({ data, className }: StudyTimeByCourseChartProps) => {
  const hasData = data && data.length > 0;

  if (!hasData) {
    return (
      <Card variant="elevated" padding="md" className={className}>
        <SectionHeader
          title="Study Time by Course"
          subtitle="Track where your study time goes"
          small
        />
        <div className="mt-4">
          <EmptyState
            icon={<BookOpen className="h-8 w-8" />}
            title="No study time tracked"
            description="Log your study sessions to see time distribution across courses."
            action={<Button size="sm" variant="primary">Log Study Time</Button>}
          />
        </div>
      </Card>
    );
  }

  // Calculate insights
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0);
  const sortedData = [...data].sort((a, b) => b.hours - a.hours);
  const topCourse = sortedData[0];
  const topCoursePercent = totalHours > 0 ? (topCourse.hours / totalHours) * 100 : 0;
  
  // Identify at-risk courses (less than 5 hours)
  const atRiskThreshold = 5;
  const atRiskCourses = data.filter(d => d.hours < atRiskThreshold);
  
  // Generate colors based on hours (at-risk courses get warning color)
  const getBarColor = (hours: number) => {
    if (hours < atRiskThreshold) return chartColors.warning;
    return chartColors.primary;
  };

  // Generate insight message
  let insightMessage = "";
  if (atRiskCourses.length > 0) {
    if (atRiskCourses.length === 1) {
      insightMessage = `${atRiskCourses[0].courseName} needs more attention with only ${atRiskCourses[0].hours}h this week.`;
    } else {
      insightMessage = `${atRiskCourses.length} courses need more study time (under ${atRiskThreshold}h each).`;
    }
  } else {
    insightMessage = `Most of your study time goes to ${topCourse.courseName} (${topCoursePercent.toFixed(0)}%). Your time is well distributed.`;
  }

  return (
    <Card variant="elevated" padding="md" className={className}>
      <SectionHeader
        title="Study Time by Course"
        subtitle="This week's breakdown"
        small
      />
      
      <div className="mt-5">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 24, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="2 6" stroke={chartColors.grid} />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              stroke={chartColors.axis}
              style={{ fontSize: "0.6875rem", fontFamily: "Inter", fontWeight: 400 }}
              tick={{ fill: chartColors.axis }}
              label={{ value: "Hours", position: "insideBottom", offset: -5, fill: chartColors.axis, style: { fontSize: "0.6875rem" } }}
            />
            <YAxis
              type="category"
              dataKey="courseName"
              axisLine={false}
              tickLine={false}
              stroke={chartColors.axis}
              style={{ fontSize: "0.75rem", fontFamily: "Inter", fontWeight: 500 }}
              tick={{ fill: "#cbd5e1" }}
              width={140}
            />
            <Tooltip
              content={<StudyTooltip />}
              cursor={{ fill: "rgba(13, 94, 255, 0.08)" }}
            />
            <Bar
              dataKey="hours"
              radius={[0, 10, 10, 0]}
              barSize={16}
              isAnimationActive
              animationDuration={520}
              animationEasing="ease-out"
            >
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.hours)} />
              ))}
              <LabelList
                dataKey="hours"
                position="right"
                offset={8}
                style={{ fill: "#cbd5e1", fontSize: 11, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insight Text and At-Risk Courses */}
      <div className="mt-4 space-y-3">
        <div className="flex items-start gap-3 rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 shadow-elevation-flat backdrop-blur-sm">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${atRiskCourses.length > 0 ? 'bg-warning-500/10' : 'bg-primary-500/10'}`}>
            {atRiskCourses.length > 0 ? (
              <AlertCircle className="h-4 w-4 text-warning-400" />
            ) : (
              <BookOpen className="h-4 w-4 text-primary-400" />
            )}
          </div>
          <div className="flex-1">
            <Text variant="small" className="text-slate-100 font-medium leading-snug">
              {insightMessage}
            </Text>
            <Text variant="small" color="muted" className="mt-1 leading-snug">
              Total study time: <span className="font-semibold text-slate-200">{totalHours}h</span> this week
            </Text>
          </div>
        </div>

        {/* At-Risk Courses List */}
        {atRiskCourses.length > 0 && (
          <div className="rounded-xl border border-warning-500/30 bg-warning-500/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-warning-400" />
              <Text variant="small" className="text-warning-400 font-semibold">
                Courses needing attention
              </Text>
            </div>
            <div className="space-y-2">
              {atRiskCourses.map((course, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <Text variant="small" className="text-slate-200">
                    {course.courseName}
                  </Text>
                  <Badge variant="warning" size="sm">
                    {course.hours}h
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

