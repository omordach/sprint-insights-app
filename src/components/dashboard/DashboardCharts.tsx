import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import type { JiraStatRow } from "@/types/jira";
import { useMemo, memo } from "react";

interface ChartsProps {
  rows: JiraStatRow[];
}

function formatTime(seconds: number): string {
  const hours = Math.round((seconds / 3600) * 10) / 10;
  return `${hours}h`;
}

const CHART_COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(270, 67%, 58%)",
  "hsl(190, 80%, 45%)",
  "hsl(340, 75%, 55%)",
  "hsl(60, 70%, 45%)",
  "hsl(200, 60%, 50%)",
  "hsl(310, 60%, 50%)",
  "hsl(160, 60%, 40%)",
  "hsl(25, 80%, 55%)",
  "hsl(100, 50%, 45%)",
  "hsl(240, 50%, 60%)",
  "hsl(15, 90%, 55%)",
  "hsl(180, 55%, 45%)",
];

/** Compute a reasonable chart height so every bar has ~28px */
function barChartHeight(count: number) {
  return Math.max(200, count * 28 + 40);
}

const BAR_MARGIN = { top: 8, right: 20, bottom: 5, left: 5 };

// ⚡ Bolt: Extracted CustomTooltipScatter outside of DashboardCharts render function.
// Expected Impact: Prevents React from destroying and recreating the tooltip component DOM
// on every parent render, significantly improving scatter chart hover performance.
const CustomTooltipScatter = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: Record<string, number | string> }> }) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-md p-2 text-xs shadow-lg">
          <p className="font-semibold text-popover-foreground">{String(d.user)}</p>
          <p className="text-muted-foreground">Comments: {String(d.comments)}</p>
          <p className="text-muted-foreground">
            Logged: {formatTime(Number(d.timeHours) * 3600)}
          </p>
          <p className="text-muted-foreground">Issues Created: {String(d.created)}</p>
        </div>
      );
    }
    return null;
  };

// ⚡ Bolt: Wrapped DashboardCharts in React.memo to prevent unnecessary re-renders
// when parent (Index.tsx) re-renders due to isFetching state changes.
// Expected Impact: Eliminates expensive Recharts re-renders when data has not changed.
export const DashboardCharts = memo(function DashboardCharts({ rows }: ChartsProps) {
  const userAggregates = useMemo(() => {
    const map: Record<
      string,
      {
        user: string;
        created: number;
        updated: number;
        assigned: number;
        comments: number;
        issuesCommented: number;
        timeHours: number;
      }
    > = {};
    for (const r of rows) {
      if (!map[r.user])
        map[r.user] = {
          user: r.user,
          created: 0,
          updated: 0,
          assigned: 0,
          comments: 0,
          issuesCommented: 0,
          timeHours: 0,
        };
      map[r.user].created += r.issuesCreated;
      map[r.user].updated += r.issuesUpdated;
      map[r.user].assigned += r.issuesAssigned;
      map[r.user].comments += r.commentsCount;
      map[r.user].issuesCommented += r.issuesCommented;
      map[r.user].timeHours += r.timeLoggedSeconds / 3600;
    }
    return Object.values(map).sort((a, b) => b.created - a.created);
  }, [rows]);

  const engagementData = useMemo(() => {
    return userAggregates
      .map((u) => ({
        user: u.user,
        score: Math.round(
          u.created * 3 + u.updated * 1 + u.comments * 2 + u.timeHours * 0.5
        ),
      }))
      .sort((a, b) => b.score - a.score);
  }, [userAggregates]);

  const timeDistribution = useMemo(() => {
    return userAggregates
      .filter((u) => u.timeHours > 0)
      .map((u) => ({
        name: u.user,
        value: Math.round(u.timeHours * 10) / 10,
      }))
      .sort((a, b) => b.value - a.value);
  }, [userAggregates]);

  const scatterData = useMemo(() => {
    return userAggregates
      .filter((u) => u.comments > 0 || u.timeHours > 0)
      .map((u) => ({
        user: u.user,
        comments: u.comments,
        timeHours: Math.round(u.timeHours * 10) / 10,
        created: u.created,
      }));
  }, [userAggregates]);

  const ratioData = useMemo(() => {
    return userAggregates
      .filter((u) => u.created > 0)
      .map((u) => ({
        user: u.user,
        ratio: Math.round((u.comments / u.created) * 10) / 10,
        created: u.created,
      }))
      .sort((a, b) => b.ratio - a.ratio);
  }, [userAggregates]);

  const chartCardClass =
    "bg-card border border-border rounded-lg p-4 shadow-sm";



  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {/* Engagement Score */}
      <div className={chartCardClass}>
        <h3 className="text-sm font-display font-semibold text-card-foreground mb-1">
          Engagement Score
        </h3>
        <p className="text-[10px] text-muted-foreground mb-3">
          Weighted: issues×3 + updates×1 + comments×2 + hours×0.5
        </p>
        <ResponsiveContainer width="100%" height={barChartHeight(engagementData.length)}>
          <BarChart data={engagementData} layout="vertical" margin={BAR_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="user" width={120} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {engagementData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Issues Created per User */}
      <div className={chartCardClass}>
        <h3 className="text-sm font-display font-semibold text-card-foreground mb-3">
          Issues Created per User
        </h3>
        <ResponsiveContainer width="100%" height={barChartHeight(userAggregates.length)}>
          <BarChart data={userAggregates} layout="vertical" margin={BAR_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="user" width={120} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="created" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Comments per User */}
      <div className={chartCardClass}>
        <h3 className="text-sm font-display font-semibold text-card-foreground mb-3">
          Comments per User
        </h3>
        <ResponsiveContainer width="100%" height={barChartHeight(userAggregates.length)}>
          <BarChart data={userAggregates} layout="vertical" margin={BAR_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="user" width={120} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="comments" fill={CHART_COLORS[2]} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Time Distribution Pie */}
      <div className={chartCardClass}>
        <h3 className="text-sm font-display font-semibold text-card-foreground mb-3">
          Logged Time Distribution
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={timeDistribution}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) =>
                `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {timeDistribution.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => `${v}h`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Effort vs Collaboration Scatter */}
      <div className={chartCardClass}>
        <h3 className="text-sm font-display font-semibold text-card-foreground mb-1">
          Effort vs Collaboration
        </h3>
        <p className="text-[10px] text-muted-foreground mb-3">
          Logged hours (X) vs Comments (Y) — bubble = issues created
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              dataKey="timeHours"
              name="Logged Hours"
              tick={{ fontSize: 10 }}
              label={{ value: "Hours Logged", position: "insideBottom", offset: -5, fontSize: 10 }}
            />
            <YAxis
              type="number"
              dataKey="comments"
              name="Comments"
              tick={{ fontSize: 10 }}
              label={{ value: "Comments", angle: -90, position: "insideLeft", fontSize: 10 }}
            />
            <ZAxis type="number" dataKey="created" range={[40, 400]} name="Issues Created" />
            <Tooltip content={<CustomTooltipScatter />} />
            <Scatter data={scatterData} fill={CHART_COLORS[4]} opacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Comment-to-Creation Ratio */}
      <div className={chartCardClass}>
        <h3 className="text-sm font-display font-semibold text-card-foreground mb-1">
          Comment-to-Creation Ratio
        </h3>
        <p className="text-[10px] text-muted-foreground mb-3">
          Higher = more collaborative / review-focused
        </p>
        <ResponsiveContainer width="100%" height={barChartHeight(ratioData.length)}>
          <BarChart data={ratioData} layout="vertical" margin={BAR_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="user" width={120} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: number) => `${v} comments per issue`} />
            <Bar dataKey="ratio" fill={CHART_COLORS[5]} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
