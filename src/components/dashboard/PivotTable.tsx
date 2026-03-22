import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Download } from "lucide-react";
import type { JiraStatRow } from "@/types/jira";

interface PivotTableProps {
  rows: JiraStatRow[];
  users: string[];
  sprints: string[];
}

type MetricKey = "issuesCreated" | "issuesUpdated" | "issuesAssigned" | "issuesCommented" | "commentsCount" | "timeLoggedSeconds";

const METRICS: { key: MetricKey; label: string }[] = [
  { key: "issuesCreated", label: "Created" },
  { key: "issuesUpdated", label: "Updated" },
  { key: "issuesAssigned", label: "Assigned" },
  { key: "issuesCommented", label: "Commented" },
  { key: "commentsCount", label: "Comments" },
  { key: "timeLoggedSeconds", label: "Time Logged" },
];

function formatTime(seconds: number): string {
  if (seconds === 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatValue(key: MetricKey, value: number): string {
  if (key === "timeLoggedSeconds") return formatTime(value);
  return value === 0 ? "—" : String(value);
}

export function PivotTable({ rows, users, sprints }: PivotTableProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("issuesCreated");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const lookup = useMemo(() => {
    const map: Record<string, Record<string, JiraStatRow>> = {};
    for (const r of rows) {
      if (!map[r.sprint]) map[r.sprint] = {};
      if (!map[r.sprint][r.user]) {
        map[r.sprint][r.user] = { ...r };
      } else {
        const existing = map[r.sprint][r.user];
        existing.issuesCreated += r.issuesCreated;
        existing.issuesUpdated += r.issuesUpdated;
        existing.issuesAssigned += r.issuesAssigned;
        existing.issuesCommented += r.issuesCommented;
        existing.commentsCount += r.commentsCount;
        existing.timeLoggedSeconds += r.timeLoggedSeconds;
      }
    }
    return map;
  }, [rows]);

  const displayUsers = useMemo(() => {
    const activeUsers = new Set<string>();
    for (const r of rows) activeUsers.add(r.user);
    return users.filter((u) => activeUsers.has(u));
  }, [rows, users]);

  const displaySprints = useMemo(() => {
    const sorted = [...sprints];
    if (sortBy) {
      sorted.sort((a, b) => {
        const aVal = lookup[a]?.[sortBy]?.[selectedMetric] || 0;
        const bVal = lookup[b]?.[sortBy]?.[selectedMetric] || 0;
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      });
    }
    return sorted;
  }, [sprints, sortBy, sortDir, lookup, selectedMetric]);

  const columnTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const user of displayUsers) {
      totals[user] = 0;
      for (const sprint of sprints) {
        totals[user] += lookup[sprint]?.[user]?.[selectedMetric] || 0;
      }
    }
    return totals;
  }, [displayUsers, sprints, lookup, selectedMetric]);

  const rowTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const sprint of sprints) {
      totals[sprint] = 0;
      for (const user of displayUsers) {
        totals[sprint] += lookup[sprint]?.[user]?.[selectedMetric] || 0;
      }
    }
    return totals;
  }, [displayUsers, sprints, lookup, selectedMetric]);

  const grandTotal = useMemo(() => {
    return Object.values(columnTotals).reduce((a, b) => a + b, 0);
  }, [columnTotals]);

  const handleSort = (user: string) => {
    if (sortBy === user) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(user);
      setSortDir("desc");
    }
  };

  const exportCsv = () => {
    const header = ["Sprint", ...displayUsers, "Total"].join(",");
    const dataRows = displaySprints.map((sprint) => {
      const vals = displayUsers.map((user) => lookup[sprint]?.[user]?.[selectedMetric] || 0);
      return [sprint, ...vals, rowTotals[sprint]].join(",");
    });
    const totalRow = ["Total", ...displayUsers.map((u) => columnTotals[u]), grandTotal].join(",");
    const csv = [header, ...dataRows, totalRow].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jira-stats-${selectedMetric}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cellClass = (value: number) => {
    if (value === 0) return "text-muted-foreground";
    if (value > 10) return "font-semibold text-primary";
    return "text-card-foreground";
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold">Pivot Table</h3>
          <p className="text-xs text-muted-foreground">Sprint × User</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {METRICS.map((m) => (
            <Button
              key={m.key}
              variant={selectedMetric === m.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMetric(m.key)}
            >
              {m.label}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-1" />
            CSV
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-2 font-medium text-muted-foreground">Sprint</th>
              {displayUsers.map((user) => (
                <th
                  key={user}
                  className="text-right p-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort(user)}
                >
                  <span className="inline-flex items-center gap-1">
                    {user.split(" ")[0]}
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
              ))}
              <th className="text-right p-2 font-medium text-muted-foreground">Total</th>
            </tr>
          </thead>
          <tbody>
            {displaySprints.map((sprint, i) => (
              <tr key={sprint} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                <td className="p-2 font-medium">{sprint}</td>
                {displayUsers.map((user) => {
                  const val = lookup[sprint]?.[user]?.[selectedMetric] || 0;
                  return (
                    <td key={user} className={`text-right p-2 ${cellClass(val)}`}>
                      {formatValue(selectedMetric, val)}
                    </td>
                  );
                })}
                <td className="text-right p-2 font-semibold">
                  {formatValue(selectedMetric, rowTotals[sprint])}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border font-semibold">
              <td className="p-2">Total</td>
              {displayUsers.map((user) => (
                <td key={user} className="text-right p-2">
                  {formatValue(selectedMetric, columnTotals[user])}
                </td>
              ))}
              <td className="text-right p-2">{formatValue(selectedMetric, grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
