import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, SectionHeader, Text, EmptyState, Button } from "../index";
import { GpaTrendPoint } from "../../api/dashboardApi";
import { primary, accent } from "../../styles/design-tokens";

const chartColors = {
  line: primary[400],
  dot: accent[400],
  grid: "rgba(148, 163, 184, 0.12)",
  axis: "#94a3b8",
};

const GpaTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const [point] = payload;
  return (
    <div className="min-w-[150px] rounded-xl border border-slate-800/70 bg-slate-950/95 p-3 shadow-elevation-overlay backdrop-blur-xl">
      <p className="text-[11px] font-medium leading-tight text-slate-400">{label}</p>
      <p className="mt-1.5 text-sm font-semibold leading-snug text-slate-100">
        GPA <span className="text-primary-300">{point.value?.toFixed(2)}</span>
      </p>
      {point?.payload?.trend && (
        <p className="mt-1 text-[11px] leading-tight text-slate-500">{point.payload.trend}</p>
      )}
    </div>
  );
};

interface GpaTrendChartProps {
  data: GpaTrendPoint[];
  currentGpa: number | null;
  className?: string;
}

/**
 * GpaTrendChart - Line chart showing GPA trend over time
 * 
 * Displays GPA progression with insights and trend analysis.
 * Uses dark theme-aligned Recharts styling.
 */
export const GpaTrendChart = ({ data, currentGpa, className }: GpaTrendChartProps) => {
  // Calculate insights
  const hasData = data && data.length > 0;
  
  if (!hasData) {
    return (
      <Card variant="elevated" padding="md" className={className}>
        <SectionHeader
          title="GPA Trend"
          subtitle="Track your academic performance over time"
          small
        />
        <div className="mt-4">
          <EmptyState
            icon={<TrendingUp className="h-8 w-8" />}
            title="No GPA data yet"
            description="Connect your courses and grades to start tracking your GPA trends."
            action={<Button size="sm" variant="primary">Add Courses</Button>}
          />
        </div>
      </Card>
    );
  }

  const firstGpa = data[0]?.gpa || 0;
  const lastGpa = data[data.length - 1]?.gpa || 0;
  const delta = lastGpa - firstGpa;
  const deltaAbs = Math.abs(delta);
  const deltaFormatted = delta >= 0 ? `+${deltaAbs.toFixed(2)}` : `-${deltaAbs.toFixed(2)}`;

  // Determine trend
  let trendIcon = <Minus className="h-4 w-4" />;
  let trendText = "stable";
  let trendColor = "text-slate-400";

  if (delta > 0.1) {
    trendIcon = <TrendingUp className="h-4 w-4" />;
    trendText = "up";
    trendColor = "text-success-400";
  } else if (delta < -0.1) {
    trendIcon = <TrendingDown className="h-4 w-4" />;
    trendText = "down";
    trendColor = "text-danger-400";
  }

  // Generate insight message
  const insightMessage = 
    delta > 0.1
      ? `Your GPA is ${trendText} ${deltaFormatted} over this period. Great progress!`
      : delta < -0.1
      ? `Your GPA has decreased by ${deltaAbs.toFixed(2)}. Consider reaching out for academic support.`
      : `Your GPA has been ${trendText} over the last ${data.length} weeks.`;

  // Calculate Y-axis domain with padding
  const minGpa = Math.min(...data.map(d => d.gpa));
  const maxGpa = Math.max(...data.map(d => d.gpa));
  const padding = 0.2;
  const yMin = Math.max(0, minGpa - padding);
  const yMax = Math.min(4.0, maxGpa + padding);

  const chartData = data.map((point, index) => {
    const prev = index === 0 ? point.gpa : data[index - 1].gpa;
    const deltaPoint = point.gpa - prev;
    const descriptor =
      deltaPoint > 0.05
        ? `↗︎ ${deltaPoint.toFixed(2)} vs prior`
        : deltaPoint < -0.05
        ? `↘︎ ${Math.abs(deltaPoint).toFixed(2)} vs prior`
        : "Flat vs prior";
    return { ...point, trend: descriptor };
  });

  return (
    <Card variant="elevated" padding="md" className={className}>
      <SectionHeader
        title="GPA Trend"
        subtitle={`Last ${data.length} weeks`}
        small
      />
      
      <div className="mt-6">
        <ResponsiveContainer width="100%" height={276}>
          <LineChart data={chartData} margin={{ top: 5, right: 12, left: -12, bottom: 5 }}>
            <defs>
              <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.line} stopOpacity={0.25} />
                <stop offset="95%" stopColor={chartColors.line} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 6" stroke={chartColors.grid} vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              stroke={chartColors.axis}
              style={{ fontSize: "0.6875rem", fontFamily: "Inter", fontWeight: 400 }}
              tick={{ fill: chartColors.axis }}
            />
            <YAxis
              domain={[yMin, yMax]}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              stroke={chartColors.axis}
              style={{ fontSize: "0.6875rem", fontFamily: "Inter", fontWeight: 400 }}
              tick={{ fill: chartColors.axis }}
              ticks={[0, 1.0, 2.0, 3.0, 4.0].filter(t => t >= yMin && t <= yMax)}
              width={32}
            />
            <Tooltip
              content={<GpaTooltip />}
              cursor={{ stroke: chartColors.line, strokeOpacity: 0.2, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="gpa"
              stroke={chartColors.line}
              strokeWidth={2.5}
              dot={{ fill: chartColors.dot, stroke: "#0f172a", strokeWidth: 2, r: 5 }}
              activeDot={{ r: 6, fill: chartColors.dot, stroke: "#0f172a", strokeWidth: 2 }}
              fill="url(#gpaGradient)"
              isAnimationActive
              animationDuration={640}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insight Text */}
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-slate-800/60 bg-slate-950/40 p-4">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${trendColor.replace('text-', 'bg-').replace('-400', '-500/10')}`}>
          <span className={trendColor}>
            {trendIcon}
          </span>
        </div>
        <div>
          <Text variant="small" className="text-slate-100 font-medium">
            {insightMessage}
          </Text>
          {currentGpa != null && (
            <Text variant="small" color="muted" className="mt-1">
              Current GPA: <span className="font-semibold text-slate-200">{currentGpa.toFixed(2)}</span>
            </Text>
          )}
        </div>
      </div>
    </Card>
  );
};

