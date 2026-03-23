import { useState } from "react";
import { useJiraStats } from "@/hooks/useJiraStats";
import { useDashboardFilters } from "@/hooks/useDashboardFilters";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { LoadingState, ErrorState, EmptyState } from "@/components/dashboard/DashboardStates";
import { BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// ⚡ Bolt: Maintain stable empty array reference to prevent unnecessary hook re-evaluations
// Expected Impact: Avoids invalidating 'filteredRows' useMemo when 'data' is undefined
import type { JiraStatRow } from "@/types/jira";

const EMPTY_ARRAY: JiraStatRow[] = [];

const Index = () => {
  const [year, setYear] = useState(2026);
  const { data, isLoading, error, refetch, isFetching } = useJiraStats(year);

  const rows = data?.rows || EMPTY_ARRAY;
  const { filters, filteredRows, updateFilter, clearFilters } = useDashboardFilters(rows);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-display font-bold text-foreground tracking-tight">
                Jira Analytics
              </h1>
              <p className="text-xs text-muted-foreground">UIV4 · {year} Team Activity</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data && (
              <span className="text-xs text-muted-foreground font-display">
                {data.totalIssues} issues
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-8"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {data && (
          <FilterBar
            sprints={data.sprints}
            users={data.users}
            issueTypes={data.issueTypes}
            statuses={data.statuses}
            filters={filters}
            onFilterChange={updateFilter}
            onClear={clearFilters}
            year={year}
            onYearChange={setYear}
          />
        )}

        {isLoading && <LoadingState />}
        {error && <ErrorState message={(error as Error).message} />}
        {data && filteredRows.length === 0 && !isLoading && <EmptyState onClearFilters={clearFilters} />}

        {data && filteredRows.length > 0 && (
          <DashboardCharts rows={filteredRows} />
        )}
      </main>
    </div>
  );
};

export default Index;
