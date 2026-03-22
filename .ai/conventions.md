# Code Conventions

---

## General Rules

- **TypeScript strict mode** — always type function parameters and return values explicitly
- **No `any` in new code** — use proper interfaces; `any[]` is tolerated only for raw Jira API responses until they are typed
- Prefer `useMemo` for derived data in components; avoid re-computing in render
- All new React components must be **named exports** (not default), except page-level components in `src/pages/`
- Keep components **pure and presentational** where possible; put data logic in hooks

---

## File Organization

```
src/
├── components/
│   ├── dashboard/      ← dashboard-specific components
│   └── ui/             ← shadcn/ui components (DO NOT edit manually)
├── hooks/              ← custom React hooks
├── pages/              ← route-level page components
├── types/              ← TypeScript interfaces
└── integrations/       ← auto-generated Supabase client code
supabase/
└── functions/
    └── jira-stats/     ← Deno edge function
        └── index.ts    ← single file, self-contained
```

---

## Styling

- **Tailwind CSS** — utility classes only; no raw CSS unless absolutely necessary
- Use **design tokens** from `tailwind.config.ts` and `index.css` (HSL CSS variables):
  - `text-foreground`, `text-card-foreground`, `text-muted-foreground`, `text-primary`
  - `bg-background`, `bg-card`, `bg-muted`, `bg-accent`
  - `border-border`
- The chart color palette is defined in `DashboardCharts.tsx` as `CHART_COLORS` — add new colors there
- Fonts: `font-display` (JetBrains Mono) for labels/headings, default Inter for body text
- Avoid hardcoding colors like `text-blue-500` — use the CSS variable tokens

---

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| React components | PascalCase | `FilterBar`, `PivotTable` |
| Hooks | camelCase with `use` prefix | `useJiraStats`, `useDashboardFilters` |
| Types/interfaces | PascalCase | `JiraStatRow`, `DashboardFilters` |
| Edge function files | kebab-case directory + `index.ts` | `jira-stats/index.ts` |
| CSS classes | Tailwind utilities | `text-sm font-display` |
| Metric keys | camelCase matching interface field | `issuesCreated`, `timeLoggedSeconds` |

---

## Backend (Deno Edge Function)

- Always read secrets via `Deno.env.get('SECRET_NAME')` — never hardcode
- Check for `OPTIONS` method first and return CORS headers
- Always merge `corsHeaders` into every response
- Use the `getCached` / `setCache` helpers for any expensive Jira API call
- Edge function is **single-file** (`index.ts`) — keep it that way unless complexity demands splitting
- Use `any` types only for raw Jira API response parsing; define local types for aggregation structures

---

## Adding a New Chart

1. Add new `useMemo` in `DashboardCharts.tsx` to derive aggregate data from `rows`
2. Add a new `<div className={chartCardClass}>` block with a Recharts component
3. Pick the next unused index from `CHART_COLORS`
4. If the metric doesn't exist yet, add it to `JiraStatRow` and `aggregateStats` first

---

## Adding a New Filter

1. Add the field to `DashboardFilters` in `src/types/jira.ts`
2. Add a `MultiSelectFilter` in `FilterBar.tsx`
3. Add filter logic in `useDashboardFilters.ts` inside the `filteredRows` `useMemo`
4. Reset it in `clearFilters()`
