import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle2 } from "lucide-react";
import { Card, SectionHeader, Text, EmptyState, Button } from "../index";
import { WeeklyTaskStat } from "../../api/dashboardApi";
import { primary, secondary } from "../../styles/design-tokens";

const chartColors = {
  completed: primary[400],
  planned: "rgba(148, 163, 184, 0.5)",
  grid: "rgba(148, 163, 184, 0.12)",
  axis: "#94a3b8",
};

const TasksTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const completed = payload.find((p: any) => p.dataKey === "completed");
  const planned = payload.find((p: any) => p.dataKey === "planned");
  const completionPct =
    planned?.value > 0 ? Math.round((completed?.value / planned.value) * 100) : 0;

  return (
    <div className="min-w-[160px] rounded-xl border border-slate-800/70 bg-slate-950/95 p-3 text-xs text-slate-200 shadow-elevation-overlay backdrop-blur-xl">
      <p className="text-[11px] font-medium leading-tight text-slate-400">{label}</p>
      <div className="mt-2 space-y-1">
        <p className="flex items-center justify-between">
          <span className="text-slate-400">Completed</span>
          <span className="font-semibold text-primary-300">{completed?.value ?? 0}</span>
        </p>
        <p className="flex items-center justify-between">
          <span className="text-slate-400">Planned</span>
          <span className="font-semibold text-slate-300">{planned?.value ?? 0}</span>
        </p>
        <p className="pt-1 text-[11px] leading-tight text-slate-500">
          {completionPct}% completion
        </p>
      </div>
    </div>
  );
};

interface WeeklyTasksChartProps {
  data: WeeklyTaskStat[];
  className?: string;
}

/**
 * WeeklyTasksChart - Grouped bar chart showing completed vs planned tasks
 * 
 * Displays daily task completion rates with insights.
 */
export const WeeklyTasksChart = ({ data, className }: WeeklyTasksChartProps) => {
  const hasData = data && data.length > 0;

  if (!hasData) {
    return (
      <Card variant="elevated" padding="md" className={className}>
        <SectionHeader
          title="Weekly Tasks"
          subtitle="Track your daily task completion"
          small
        />
        <div className="mt-4">
          <EmptyState
            icon={<CheckCircle2 className="h-8 w-8" />}
            title="No task data yet"
            description="Start planning your week to see task completion insights."
            action={<Button size="sm" variant="primary">Plan Your Week</Button>}
          />
        </div>
      </Card>
    );
  }

  // Calculate insights
  const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0);
  const totalPlanned = data.reduce((sum, d) => sum + d.planned, 0);
  const completionRate = totalPlanned > 0 ? (totalCompleted / totalPlanned) * 100 : 0;
  
  // Find best and worst days
  const daysWithRates = data.map(d => ({
    day: d.day,
    rate: d.planned > 0 ? (d.completed / d.planned) * 100 : 0,
    completed: d.completed,
    planned: d.planned,
  }));
  
  const bestDay = daysWithRates.reduce((max, d) => d.rate > max.rate ? d : max, daysWithRates[0]);
  const worstDay = daysWithRates.reduce((min, d) => d.rate < min.rate && d.planned > 0 ? d : min, daysWithRates[0]);
  
  // Generate insight message
  let insightMessage = "";
  if (completionRate >= 85) {
    insightMessage = `Excellent! You're completing ${completionRate.toFixed(0)}% of your planned tasks. ${bestDay.day} is your most productive day.`;
  } else if (completionRate >= 70) {
    insightMessage = `Good progress! You complete ${completionRate.toFixed(0)}% of planned tasks. Focus on improving ${worstDay.day}.`;
  } else if (completionRate >= 50) {
    insightMessage = `You're completing ${completionRate.toFixed(0)}% of tasks. Consider planning fewer tasks or breaking them into smaller pieces.`;
  } else {
    insightMessage = `Only ${completionRate.toFixed(0)}% of tasks are completed. Try reducing your weekly load or reassessing priorities.`;
  }

  return (
    <Card variant="elevated" padding="md" className={className}>
      <SectionHeader
        title="Weekly Tasks"
        subtitle="Completed vs. Planned by day"
        small
      />
      
      <div className="mt-5">
        <ResponsiveContainer width="100%" height={238}>
          <BarChart data={data} margin={{ top: 5, right: 12, left: -12, bottom: 0 }} barGap={6}>
            <CartesianGrid strokeDasharray="2 6" stroke={chartColors.grid} vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              stroke={chartColors.axis}
              style={{ fontSize: "0.6875rem", fontFamily: "Inter", fontWeight: 400 }}
              tick={{ fill: chartColors.axis }}
            />
            <YAxis
              stroke={chartColors.axis}
              style={{ fontSize: "0.6875rem", fontFamily: "Inter", fontWeight: 400 }}
              tick={{ fill: chartColors.axis }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              tickMargin={8}
            />
            <Tooltip
              content={<TasksTooltip />}
              cursor={{ fill: "rgba(13, 94, 255, 0.08)" }}
            />
            <Bar
              dataKey="completed"
              fill={chartColors.completed}
              radius={[6, 6, 0, 0]}
              barSize={18}
              name="Completed"
              isAnimationActive
              animationDuration={520}
              animationEasing="ease-out"
            />
            <Bar
              dataKey="planned"
              fill={chartColors.planned}
              radius={[6, 6, 0, 0]}
              barSize={18}
              name="Planned"
              isAnimationActive
              animationDuration={520}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insight Text */}
      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 shadow-elevation-flat backdrop-blur-sm sm:flex-row sm:items-start">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary-500/10">
          <CheckCircle2 className="h-4 w-4 text-secondary-400" />
        </div>
        <div className="space-y-1">
          <Text variant="small" className="font-medium text-slate-100 leading-snug">
            {insightMessage}
          </Text>
          <Text variant="small" color="muted" className="leading-snug">
            Total: <span className="font-semibold text-slate-200">{totalCompleted}/{totalPlanned}</span> tasks this week — best momentum on <span className="text-slate-100">{bestDay.day}</span>, improve <span className="text-slate-100">{worstDay.day}</span>.
          </Text>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[11px] leading-tight text-slate-400">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800/60 bg-slate-950/40 px-3 py-1">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chartColors.completed }} />
          Completed
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800/60 bg-slate-950/40 px-3 py-1">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chartColors.planned }} />
          Planned
        </div>
      </div>
    </Card>
  );
};

