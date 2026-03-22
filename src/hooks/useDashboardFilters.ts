import { useCallback, useMemo, useState } from "react";
import type { JiraStatRow, DashboardFilters } from "@/types/jira";

export function useDashboardFilters(rows: JiraStatRow[]) {
  const [filters, setFilters] = useState<DashboardFilters>({
    sprint: [],
    month: [],
    user: [],
    issueType: [],
    status: [],
  });

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (filters.sprint.length > 0 && !filters.sprint.includes(row.sprint)) return false;
      if (filters.user.length > 0 && !filters.user.includes(row.user)) return false;
      if (filters.issueType.length > 0 && !filters.issueType.includes(row.issueType)) return false;
      if (filters.status.length > 0 && !filters.status.includes(row.status)) return false;
      return true;
    });
  }, [rows, filters]);

  // ⚡ Bolt: Memoized updateFilter with useCallback.
  // Expected Impact: Maintains referential equality so child components (FilterBar) do not re-render unnecessarily.
  const updateFilter = useCallback((key: keyof DashboardFilters, values: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: values }));
  }, []);

  // ⚡ Bolt: Memoized clearFilters with useCallback.
  // Expected Impact: Maintains referential equality so child components do not re-render unnecessarily.
  const clearFilters = useCallback(() => {
    setFilters({ sprint: [], month: [], user: [], issueType: [], status: [] });
  }, []);

  return { filters, filteredRows, updateFilter, clearFilters };
}
