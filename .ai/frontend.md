# Frontend — React Application

**Entry point:** `src/main.tsx` → `src/App.tsx` → `src/pages/Index.tsx`

---

## Component Tree

```
Index.tsx  (page)
├── <header>  — sticky top bar with title, issue count, Refresh button
├── <FilterBar />  — top filter section
├── <LoadingState /> | <ErrorState /> | <EmptyState />  — conditional states
├── <DashboardCharts rows={filteredRows} />
└── <PivotTable rows={filteredRows} users sprints />
```

---

## Pages

### `src/pages/Index.tsx`
The single page of the app. Orchestrates data fetching + filtering.

```tsx
const [year, setYear] = useState(2026);
const { data, isLoading, error, refetch, isFetching } = useJiraStats(year);
const { filters, filteredRows, updateFilter, clearFilters } = useDashboardFilters(rows);
```

Data from `useJiraStats` is the raw full dataset. `filteredRows` is the subset after applying filters. `PivotTable` and charts receive `filteredRows`, but `users`/`sprints` lists always come from the full `data` object so the filter options don't collapse.

---

## Components

### `src/components/dashboard/FilterBar.tsx`

Props:
```typescript
interface FilterBarProps {
  sprints: string[];
  users: string[];
  issueTypes: string[];
  statuses: string[];
  filters: DashboardFilters;
  onFilterChange: (key: keyof DashboardFilters, values: string[]) => void;
  onClear: () => void;
  year: number;
  onYearChange: (year: number) => void;
}
```

- Renders a `MultiSelectFilter` for each dimension (Sprint, User, Issue Type, Status) + a Year selector
- `MultiSelectFilter` is a **local** sub-component — uses shadcn `Select` with a `checkmark` toggle pattern
- Selected values shown as dismissible `Badge` chips below each dropdown
- Year options are hardcoded: `[2024, 2025, 2026]` — extend here to support more years

### `src/components/dashboard/DashboardCharts.tsx`

Props: `{ rows: JiraStatRow[] }`

Renders 5 Recharts charts in a responsive grid (`grid-cols-1 lg:grid-cols-2 xl:grid-cols-3`):

| Chart | Type | Data | Key |
|---|---|---|---|
| Issues Created per User | Horizontal BarChart | `userAggregates` | `created` |
| Issues Updated per User | Horizontal BarChart | `userAggregates` | `updated` |
| Comments per User | Horizontal BarChart | `userAggregates` | `comments` |
| Logged Time per User | Horizontal BarChart | `userAggregates` | `timeHours` |
| Issues per Sprint (Trend) | LineChart | `sprintTrend` | `issues` |

The sprint trend spans `lg:col-span-2`. All data is derived via `useMemo` from `rows`.

`CHART_COLORS` array defines the HSL color palette for bar fills (index 0–5).

### `src/components/dashboard/PivotTable.tsx`

Props: `{ rows: JiraStatRow[], users: string[], sprints: string[] }`

State:
- `selectedMetric: MetricKey` — which metric to display (default: `issuesCreated`)
- `sortBy: string | null` — user column to sort by
- `sortDir: 'asc' | 'desc'`

Features:
- **Metric selector** — 6 buttons for each `MetricKey`
- **Sortable columns** — clicking a user column header sorts sprints by that user's metric
- **Row totals** — rightmost column, sum across all displayed users
- **Column totals** — footer row, sum across all displayed sprints
- **Grand total** — bottom-right cell
- **CSV export** — `exportCsv()` downloads `jira-stats-{metric}.csv`
- **Zero handling** — `formatValue()` renders `—` for zero values; `timeLoggedSeconds` uses `formatTime()` to render `Xh Ym`

`displayUsers` filters to only users present in the current filtered `rows`.

### `src/components/dashboard/DashboardStates.tsx`
Three simple presentational components: `<LoadingState />`, `<ErrorState message />`, `<EmptyState />`. No props except `message` on `ErrorState`.

---

## Hooks

### `src/hooks/useJiraStats.ts`

```typescript
export function useJiraStats(year: number): UseQueryResult<JiraStatsResponse>
```

- Calls `${VITE_SUPABASE_URL}/functions/v1/jira-stats?year=${year}`
- `staleTime: 10 * 60 * 1000` — matches backend cache TTL; data is not re-fetched within 10 min
- `retry: 1` — one retry on failure
- Query key: `['jira-stats', year]` — changing year triggers a fresh fetch

No Authorization header is sent — the function is publicly accessible (no Supabase auth required for read).

### `src/hooks/useDashboardFilters.ts`

```typescript
export function useDashboardFilters(rows: JiraStatRow[]): {
  filters: DashboardFilters;
  filteredRows: JiraStatRow[];
  updateFilter: (key: keyof DashboardFilters, values: string[]) => void;
  clearFilters: () => void;
}
```

- Filters `rows` client-side by `sprint` and `user` dimensions
- `issueType` and `status` filters are stored in state but **not yet applied** to rows (the backend aggregated rows don't carry issue type/status per row — only per issue). This is a known limitation.

---

## Data Flow Diagram

```
useJiraStats(year)
    │
    ▼
JiraStatsResponse { rows, users, sprints, issueTypes, statuses, ... }
    │
    ├── FilterBar ← uses users, sprints, issueTypes, statuses as option lists
    │
    └── useDashboardFilters(rows)
            │
            ▼
        filteredRows
            │
            ├── DashboardCharts
            └── PivotTable
```
