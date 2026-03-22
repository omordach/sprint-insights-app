# Known Issues & Limitations

> Check this file before reporting a bug or trying to fix something that may already be documented.

---

## 1. `issuesUpdated` is Attributed to the Creator (Not the Actual Updater)

**Location:** `supabase/functions/jira-stats/index.ts` → `aggregateStats()`

**Problem:** Jira's change history (issue changelog) is not fetched because it is expensive (requires extra API calls per issue). Instead, `issuesUpdated` is incremented for the issue's *creator*, not the person who actually made the last update.

**Impact:** `issuesUpdated` metric is an approximation — it under-counts updates by non-creators and over-counts for creators.

**Fix (if needed):** Fetch `GET /rest/api/3/issue/{issueKey}/changelog` for each issue and aggregate `updatedBy` from the changelog entries. Be aware this multiplies API calls by the number of issues.

---

## 2. `issueType` and `status` Filters Are UI-Only (Not Applied)

**Location:** `src/hooks/useDashboardFilters.ts`

**Problem:** The `DashboardFilters` interface includes `issueType` and `status` fields, and `FilterBar` renders those dropdowns. However, the `filteredRows` `useMemo` only applies `sprint` and `user` filters. `issueType` and `status` selections have no effect on charts or pivot table.

**Root cause:** The aggregated `JiraStatRow` does not carry `issueType` or `status` per row — those are per-issue, and the current aggregation loses that granularity.

**Fix (if needed):** Either (a) pre-filter issues in the edge function by `issueType`/`status` before aggregating (requires passing filter params to edge function), or (b) store `issueType` and `status` per row by splitting rows further.

---

## 3. Sprint Ordering Is Alphabetical, Not Chronological

**Location:** `aggregateStats()` → `Array.from(sprints).sort()`

**Problem:** Sprint names are sorted alphabetically (`"Sprint 10"` comes before `"Sprint 9"`). For sprints named with numbers above 9 this produces incorrect ordering in charts and the pivot table.

**Fix:** Either sort by the sprint's start date using `sprintDetails`, or use natural sort: `sprints.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))`.

---

## 4. `worklog` Field May Be Truncated (Max 20 Entries)

**Location:** `supabase/functions/jira-stats/index.ts` → `fetchAllIssues`

**Problem:** Jira returns at most 20 worklog entries in the `worklog` field when fetched inline with the issue. Issues with more than 20 worklogs will show underreported `timeLoggedSeconds`.

**Fix:** For high-volume work-logging teams, fetch full worklogs via `GET /rest/api/3/issue/{key}/worklog` separately for issues where `worklog.total > worklog.maxResults`.

---

## 5. In-Memory Cache Resets on Cold Start

**Location:** `supabase/functions/jira-stats/index.ts` — `cache` Map

**Problem:** Because the cache is in-memory at the Deno isolate level, every cold start (Supabase function spin-up after inactivity) starts with an empty cache and must re-fetch all issues.

**Fix (if needed):** Use Supabase KV storage or an external cache (Redis) for persistent caching. For now, the 10-minute client-side `staleTime` in `useJiraStats` mitigates this for active browser sessions.

---

## 6. `month` Filter Is Reserved But Has No Data

**Location:** `src/types/jira.ts` → `DashboardFilters.month`

**Problem:** The `month` field is defined in `DashboardFilters` but there is no `month` filter rendered in `FilterBar` and no filter logic in `useDashboardFilters`. It was planned but not implemented.

**Fix:** Add a month-based filter that uses the issue creation/update date per row — this requires adding a `month` field to `JiraStatRow` or filtering based on sprint date ranges from `sprintDetails`.

---

## 7. Year Range Is Hardcoded

**Location:** `src/components/dashboard/FilterBar.tsx` line 102: `[2024, 2025, 2026]`

**Fix:** Extend the array or make it dynamic (e.g., current year ± 2).
