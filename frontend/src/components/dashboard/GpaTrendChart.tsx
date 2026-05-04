import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";
import { Card, SectionHeader, Text, EmptyState, Button } from "../index";
import { GpaTrendPoint } from "../../api/dashboardApi";
import { primary, accent } from "../../styles/design-tokens";

const chartColors = {
  line: primary[400],
  dot: accent[400],
  target: "#f59e0b",
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
  targetGpa?: number | null;
  className?: string;
}

export const GpaTrendChart = ({ data, currentGpa, targetGpa, className }: GpaTrendChartProps) => {
  const hasData = data && data.length > 0;

  if (!hasData) {
    return (
      <Card variant="elevated" padding="md" className={className}>
        <SectionHeader title="GPA Trend" subtitle="Track your academic performance over time" small />
        <div className="mt-3">
          <EmptyState
            compact
            icon={<TrendingUp className="h-8 w-8" />}
            title="No GPA data yet"
            description="Save your GPA on the Profile page to start tracking your trend."
            action={<Button size="sm" variant="primary" onClick={() => window.location.href = "/profile"}>Go to Profile</Button>}
          />
        </div>
      </Card>
    );
  }

  const firstGpa = data[0]?.gpa || 0;
  const lastGpa = data[data.length - 1]?.gpa || 0;
  const delta = lastGpa - firstGpa;
  const deltaAbs = Math.abs(delta);

  // Trend direction
  let trendIcon = <Minus className="h-4 w-4" />;
  let trendColor = "text-slate-400";
  let insightMessage: string;

  if (data.length === 1) {
    insightMessage = `Your GPA is ${lastGpa.toFixed(2)}.${targetGpa != null ? ` Target: ${targetGpa.toFixed(2)}.` : ""}`;
  } else if (delta > 0.1) {
    trendIcon = <TrendingUp className="h-4 w-4" />;
    trendColor = "text-success-400";
    insightMessage = `GPA up +${deltaAbs.toFixed(2)} over the last ${data.length} saves. Keep it up!`;
  } else if (delta < -0.1) {
    trendIcon = <TrendingDown className="h-4 w-4" />;
    trendColor = "text-danger-400";
    insightMessage = `GPA down ${deltaAbs.toFixed(2)}. Consider reaching out for support.`;
  } else {
    insightMessage = `GPA has been stable over the last ${data.length} saves.`;
  }

  // Gap to target
  const gapToTarget = targetGpa != null ? targetGpa - lastGpa : null;

  // Y-axis domain: include target GPA if set
  const gpas = data.map((d) => d.gpa);
  if (targetGpa != null) gpas.push(targetGpa);
  const padding = 0.25;
  const yMin = Math.max(0, Math.min(...gpas) - padding);
  const yMax = Math.min(4.0, Math.max(...gpas) + padding);

  const chartData = data.map((point, index) => {
    const prev = index === 0 ? point.gpa : data[index - 1].gpa;
    const d = point.gpa - prev;
    const trend =
      d > 0.05 ? `↗︎ +${d.toFixed(2)} vs prior` : d < -0.05 ? `↘︎ ${d.toFixed(2)} vs prior` : "Flat vs prior";
    return { ...point, trend };
  });

  const subtitle = data.length === 1 ? "1 data point" : `Last ${data.length} saves`;

  return (
    <Card variant="elevated" padding="md" className={className}>
      <div className="flex items-start justify-between gap-2">
        <SectionHeader title="GPA Trend" subtitle={subtitle} small />
        {targetGpa != null && (
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 shrink-0">
            <Target className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-300">Target {targetGpa.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 5 }}>
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
              ticks={[0, 1.0, 2.0, 3.0, 4.0].filter((t) => t >= yMin && t <= yMax)}
              width={32}
            />
            <Tooltip
              content={<GpaTooltip />}
              cursor={{ stroke: chartColors.line, strokeOpacity: 0.2, strokeWidth: 2 }}
            />
            {targetGpa != null && (
              <ReferenceLine
                y={targetGpa}
                stroke={chartColors.target}
                strokeDasharray="5 4"
                strokeWidth={1.5}
                label={{
                  value: `Target ${targetGpa.toFixed(2)}`,
                  position: "insideTopRight",
                  fill: chartColors.target,
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
            )}
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

      {/* Insight + gap-to-target */}
      <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-slate-800/60 bg-slate-950/40 px-3 py-2.5">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${trendColor
            .replace("text-", "bg-")
            .replace("-400", "-500/10")}`}
        >
          <span className={trendColor}>{trendIcon}</span>
        </span>
        <div className="min-w-0 flex-1">
          <Text variant="small" className="text-slate-100 font-medium leading-snug">
            {insightMessage}
          </Text>
          <div className="flex flex-wrap gap-x-3 mt-0.5">
            {currentGpa != null && (
              <Text variant="small" color="muted" className="leading-snug">
                Current: <span className="font-semibold text-slate-200">{Number(currentGpa).toFixed(2)}</span>
              </Text>
            )}
            {gapToTarget != null && (
              <Text variant="small" color="muted" className="leading-snug">
                {gapToTarget > 0 ? (
                  <>Gap to target: <span className="font-semibold text-amber-300">+{gapToTarget.toFixed(2)} needed</span></>
                ) : gapToTarget < 0 ? (
                  <>Target exceeded by <span className="font-semibold text-success-400">{Math.abs(gapToTarget).toFixed(2)}</span></>
                ) : (
                  <>Target <span className="font-semibold text-success-400">reached!</span></>
                )}
              </Text>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
