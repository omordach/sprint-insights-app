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
    // ⚡ Bolt: Fast-path return if no filters are active (O(1) instead of O(N))
    const hasFilters = Object.values(filters).some(arr => arr.length > 0);
    if (!hasFilters) return rows;

    // ⚡ Bolt: Convert filter arrays to Sets for O(1) lookups instead of O(M) Array.includes()
    // This reduces the filtering complexity from O(N * M) to O(N) where N=rows and M=selected filters
    const filterSets = {
      sprint: filters.sprint.length > 0 ? new Set(filters.sprint) : null,
      user: filters.user.length > 0 ? new Set(filters.user) : null,
      issueType: filters.issueType.length > 0 ? new Set(filters.issueType) : null,
      status: filters.status.length > 0 ? new Set(filters.status) : null,
    };

    return rows.filter((row) => {
      if (filterSets.sprint && !filterSets.sprint.has(row.sprint)) return false;
      if (filterSets.user && !filterSets.user.has(row.user)) return false;
      if (filterSets.issueType && !filterSets.issueType.has(row.issueType)) return false;
      if (filterSets.status && !filterSets.status.has(row.status)) return false;
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
