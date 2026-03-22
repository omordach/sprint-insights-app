# Backend — Supabase Edge Function: `jira-stats`

**File:** `supabase/functions/jira-stats/index.ts`  
**Runtime:** Deno (via Supabase Edge Functions)  
**Endpoint:** `GET /functions/v1/jira-stats?year=2026`

---

## Overview

The edge function is the sole backend of this project. It fetches all Jira issues for the `UIV4` project within the requested year, aggregates statistics per sprint × user combination, and returns a single JSON payload consumed by the frontend.

---

## Constants

```typescript
const JIRA_BASE_URL = 'https://unionimpact.atlassian.net';
const JIRA_EMAIL = 'oleh@get-code.net';
const PROJECT_KEY = 'UIV4';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
```

> **Never** hardcode `JIRA_API_TOKEN`. Always read it from `Deno.env.get('JIRA_API_TOKEN')`.

---

## Key Functions

### `jiraFetch(path, token)`
Low-level wrapper around `fetch`. Constructs Basic Auth header, sets JSON headers, throws on non-OK responses.

### `fetchAllIssues(token, year)`
- JQL: `project = UIV4 AND updated >= {year}-01-01 AND updated < {year+1}-01-01`
- Fields: `summary, creator, assignee, status, issuetype, created, updated, worklog, comment, customfield_10115`
- Uses the **new** `/rest/api/3/search/jql` endpoint with **cursor-based pagination** via `nextPageToken` (not `startAt`-based)
- Deduplicates issues by `issue.key`
- Results cached under key `issues_{year}`

### `fetchSprints(token)`
- Fetches boards via `/rest/agile/1.0/board?projectKeyOrId=UIV4`
- Takes the first board's ID, then fetches sprints via `/rest/agile/1.0/board/{boardId}/sprint`
- Cached under key `sprints`
- Returns `[]` (gracefully) if the board/sprint API fails — does not crash the whole response

### `extractSprintName(issue)`
- Reads `fields.customfield_10115` — the Sprint custom field for this Jira instance
- If the field is an array (standard), uses the **last element** (most recent sprint)
- Falls back to `'No Sprint'` if the field is absent or empty

### `aggregateStats(issues, year)`
Builds a `sprint → user → metrics` nested map, then flattens it to an array of `JiraStatRow` objects.

| Metric | Attribution Rule |
|---|---|
| `issuesCreated` | Attributed to issue `creator`, only if created in the target year |
| `issuesUpdated` | Attributed to issue `creator` (changelog not fetched — approximation) |
| `issuesAssigned` | Attributed to current `assignee` |
| `issuesCommented` | Each commenter who commented in target year gets +1 per issue |
| `commentsCount` | Each comment in target year increments the author's count |
| `timeLoggedSeconds` | From `worklog.worklogs`, filtered by `wl.started` year, attributed to worklog author |

---

## Response Shape

```json
{
  "rows": [
    {
      "sprint": "Sprint 15",
      "user": "Oleh Mordach",
      "issuesCreated": 5,
      "issuesUpdated": 12,
      "issuesAssigned": 8,
      "issuesCommented": 6,
      "commentsCount": 15,
      "timeLoggedSeconds": 14400
    }
  ],
  "users": ["Lidia Mykyteiek", "Oleh Mordach", "Roman Nebesnuy"],
  "sprints": ["No Sprint", "Sprint 14", "Sprint 15"],
  "issueTypes": ["Bug", "Story", "Task"],
  "statuses": ["Done", "In Progress", "To Do"],
  "sprintDetails": [ /* raw Jira sprint objects */ ],
  "totalIssues": 342,
  "year": 2026
}
```

---

## Caching

Simple in-memory `Map<string, { data, timestamp }>`. Cache keys:
- `issues_{year}` — per year
- `sprints` — shared across years

**TTL:** 10 minutes. Cache is instance-level (does not persist across cold starts).

---

## CORS

Wildcard CORS with `OPTIONS` preflight support. Headers are defined in `corsHeaders` constant and merged into every response.

---

## Adding New Metrics

1. Add the field to the `fields` query param in `fetchAllIssues`
2. Add the aggregation logic in `aggregateStats` inside the `ensure(sprint, user)` → accumulate pattern
3. Add the field to `JiraStatRow` interface in `src/types/jira.ts`
4. Expose it in the frontend `METRICS` array in `PivotTable.tsx`
