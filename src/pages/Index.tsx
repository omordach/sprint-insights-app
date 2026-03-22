import { useState } from "react";
import { useJiraStats } from "@/hooks/useJiraStats";
import { useDashboardFilters } from "@/hooks/useDashboardFilters";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { PivotTable } from "@/components/dashboard/PivotTable";
import { LoadingState, ErrorState, EmptyState } from "@/components/dashboard/DashboardStates";
import { BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [year, setYear] = useState(2026);
  const { data, isLoading, error, refetch, isFetching } = useJiraStats(year);

  const rows = data?.rows || [];
  const { filters, filteredRows, updateFilter, clearFilters } = useDashboardFilters(rows);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-semibold leading-tight">Sprint Insights</h1>
              <p className="text-xs text-muted-foreground">Jira Analytics Dashboard</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
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
        {data && filteredRows.length === 0 && !isLoading && <EmptyState />}

        {data && filteredRows.length > 0 && (
          <>
            <DashboardCharts rows={filteredRows} />
            <PivotTable rows={filteredRows} users={data.users} sprints={data.sprints} />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
