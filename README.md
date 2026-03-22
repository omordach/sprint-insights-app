# Sprint Insights — Jira Analytics Dashboard

A BI-style analytics dashboard for the **UIV4** Jira project at [unionimpact.atlassian.net](https://unionimpact.atlassian.net). Shows team activity statistics per sprint and per user for a configurable year (default 2026).

## Features

- **Filter Bar** — filter by Year, Sprint, User, Issue Type, Status (multi-select with badge chips)
- **Charts** — issues created/updated/comments/time per user (bar charts) + sprint activity trend (line chart)
- **Pivot Table** — Sprint × User with selectable metric, sortable columns, row/column totals, CSV export
- **Data caching** — 10-minute cache in the backend edge function + React Query stale-time

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui (Radix) |
| Charts | Recharts |
| Data fetching | TanStack Query v5 |
| Backend | Supabase Edge Function (Deno) |
| Jira API | REST v3 + Agile v1 |

## Development Setup

```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

### Environment Variables

Create `.env` (or `.env.local`) with:

```env
VITE_SUPABASE_URL=https://<your-supabase-project>.supabase.co
```

The Jira API token is stored as a **Supabase Function Secret** named `JIRA_API_TOKEN` — never put it in the frontend `.env`.

### Deploying the Edge Function

```sh
supabase functions deploy jira-stats
supabase secrets set JIRA_API_TOKEN=<your-jira-api-token>
```

## Project Structure

```
src/
├── components/dashboard/   ← FilterBar, DashboardCharts, PivotTable, DashboardStates
├── hooks/                  ← useJiraStats, useDashboardFilters
├── pages/                  ← Index.tsx (main page)
└── types/jira.ts           ← TypeScript interfaces

supabase/functions/
└── jira-stats/index.ts     ← Deno edge function (fetches + aggregates Jira data)

.ai/                        ← AI agent steering documentation
```

## AI Agent Documentation

See [`.ai/`](./.ai/README.md) for steering documentation intended for AI coding agents working on this project.

## Jira Data Source

- **Project:** UIV4
- **Jira instance:** `https://unionimpact.atlassian.net`
- **Sprint field:** `customfield_10115`
- Issues fetched: `project = UIV4 AND updated >= {year}-01-01`
