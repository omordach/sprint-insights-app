# Data Model

**File:** `src/types/jira.ts`

---

## `JiraStatRow`

The core data unit — one row represents one user's activity in one sprint.

```typescript
interface JiraStatRow {
  sprint: string;              // Sprint name, e.g. "Sprint 15" or "No Sprint"
  user: string;                // User displayName, e.g. "Oleh Mordach"
  issuesCreated: number;       // Issues created by this user in this sprint
  issuesUpdated: number;       // Issues updated (attributed to creator — approximation)
  issuesAssigned: number;      // Issues currently assigned to this user in this sprint
  issuesCommented: number;     // Distinct issues where the user commented in target year
  commentsCount: number;       // Total comments by this user in this sprint
  timeLoggedSeconds: number;   // Total worklog seconds by this user in this sprint
}
```

## `JiraStatsResponse`

Full API response from the edge function.

```typescript
interface JiraStatsResponse {
  rows: JiraStatRow[];         // Flat array of sprint×user metric rows
  users: string[];             // All unique user displayNames (sorted)
  sprints: string[];           // All unique sprint names (sorted)
  issueTypes: string[];        // All unique issue type names (sorted)
  statuses: string[];          // All unique status names (sorted)
  sprintDetails: any[];        // Raw Jira sprint objects from Agile API
  totalIssues: number;         // Count of all fetched issues (before aggregation)
  year: number;                // The year that was queried
}
```

## `DashboardFilters`

Client-side filter state managed by `useDashboardFilters`.

```typescript
interface DashboardFilters {
  sprint: string[];            // Selected sprint names (empty = all)
  month: string[];             // Reserved — not yet implemented
  user: string[];              // Selected user names (empty = all)
  issueType: string[];         // Stored but not yet applied to rows (see known-issues)
  status: string[];            // Stored but not yet applied to rows (see known-issues)
}
```

---

## Key Points for AI Agents

- `sprint` strings come directly from the Jira `customfield_10115` field name. They may include `"No Sprint"` for issues not assigned to any sprint.
- `timeLoggedSeconds` is always in **seconds** — convert to hours with `/ 3600` for display.
- `users` and `sprints` arrays in `JiraStatsResponse` contain **all** values from the full dataset, not just the filtered subset. Always pass these (not derived from `filteredRows`) to components that need full option lists.
- `sprintDetails` is raw Jira Agile API data — use with caution, type it with `any[]` for now.
