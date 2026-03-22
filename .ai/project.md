# Project Overview — Sprint Insights

## What It Is

**Sprint Insights** is a Jira analytics dashboard that shows team activity statistics per sprint and per user for a configurable year (default 2026). It is designed for project managers to analyse team productivity, sprint activity, and developer contributions at a glance.

The aesthetic goal is a clean BI-tool look — similar to Notion dashboards or Metabase — using a blue primary palette and JetBrains Mono + Inter fonts.

## Jira Data Source

| Parameter | Value |
|---|---|
| Jira Cloud URL | `https://unionimpact.atlassian.net` |
| Project Key | `UIV4` |
| Auth | Basic Auth — Email + API Token |
| Email | `oleh@get-code.net` |
| API Token | `JIRA_API_TOKEN` env variable (never hardcode) |
| Sprint custom field | `customfield_10115` |

The backend fetches only issues where `project = UIV4 AND updated >= {year}-01-01 AND updated < {year+1}-01-01`.

## Architecture

```
┌────────────────────────────────┐        ┌──────────────────────────────────┐
│  React Frontend (Vite + TS)    │  HTTP  │  Supabase Edge Function (Deno)   │
│  src/                          │◄──────►│  supabase/functions/jira-stats/   │
│  - pages/Index.tsx             │        │  index.ts                         │
│  - components/dashboard/       │        │  - Fetches all UIV4 issues via JQL│
│  - hooks/                      │        │  - Aggregates sprint × user stats  │
│  - types/jira.ts               │        │  - 10-min in-memory cache          │
└────────────────────────────────┘        └──────────────────────────────────┘
                                                          │
                                                          ▼
                                           Jira Cloud REST API
                                           /rest/api/3/search/jql
                                           /rest/agile/1.0/board
```

## Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** (build tool, dev server)
- **Tailwind CSS** + **shadcn/ui** (Radix-based components)
- **Recharts** (BarChart, LineChart)
- **TanStack Query v5** (`@tanstack/react-query`) for data fetching & caching
- **react-router-dom v6** routing

### Backend
- **Deno** runtime (Supabase Edge Functions)
- No external npm dependencies — uses Deno std lib and native `fetch`
- Deployed as Supabase Function: `jira-stats`

## Main Features

1. **Filter Bar** — Year, Sprint, User, Issue Type, Status (multi-select with badge chips)
2. **Charts** — 4 bar charts (issues created/updated/comments/time per user) + 1 sprint trend line chart
3. **Pivot Table** — Sprint × User with metric selector, sortable columns, row/col totals, CSV export
4. **Year selector** — supports 2024, 2025, 2026 (easily extensible)

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `JIRA_API_TOKEN` | Supabase Function secrets | Jira Basic Auth token |
| `VITE_SUPABASE_URL` | Frontend `.env` | Supabase project URL for edge function calls |
