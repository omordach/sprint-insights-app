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
    // ⚡ Bolt: Use Sets for O(1) membership checking instead of O(M) Array.includes
    // Expected Impact: Reduces filtering complexity from O(N*M) to O(N), significantly improving performance on large datasets.
    const sprintSet = filters.sprint.length > 0 ? new Set(filters.sprint) : null;
    const userSet = filters.user.length > 0 ? new Set(filters.user) : null;
    const issueTypeSet = filters.issueType.length > 0 ? new Set(filters.issueType) : null;
    const statusSet = filters.status.length > 0 ? new Set(filters.status) : null;

    // ⚡ Bolt: Early return to skip iteration completely when no filters are active
    if (!sprintSet && !userSet && !issueTypeSet && !statusSet) {
      return rows;
    }

    return rows.filter((row) => {
      if (sprintSet && !sprintSet.has(row.sprint)) return false;
      if (userSet && !userSet.has(row.user)) return false;
      if (issueTypeSet && !issueTypeSet.has(row.issueType)) return false;
      if (statusSet && !statusSet.has(row.status)) return false;
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
