// jira-stats edge function v2
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const JIRA_BASE_URL = 'https://unionimpact.atlassian.net';

const PROJECT_KEY = 'UIV4';

// Simple in-memory cache
const cache: Map<string, { data: unknown; timestamp: number }> = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached(key: string) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data;
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
}

async function jiraFetch(path: string, token: string, email: string) {
  const auth = btoa(`${email}:${token}`);
  const res = await fetch(`${JIRA_BASE_URL}${path}`, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Jira API Error ${res.status}: ${body}`);
    throw new Error(`Jira API Request Failed (${res.status})`);
  }
  return res.json();
}

async function fetchAllIssues(token: string, email: string, year: number) {
  const cacheKey = `issues_${year}`;
  const cached = getCached(cacheKey);
  if (cached) return cached as any[];

  const jql = `project = ${PROJECT_KEY} AND updated >= ${year}-01-01 AND updated < ${year + 1}-01-01`;
  const fields = 'summary,creator,assignee,status,issuetype,created,updated,worklog,comment,customfield_10115';

  const maxResults = 100;
  const allIssues: any[] = [];
  const seenKeys = new Set<string>();

  let nextPageToken: string | undefined = undefined;

  while (true) {
    let url = `${JIRA_BASE_URL}/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&fields=${fields}&maxResults=${maxResults}`;
    if (nextPageToken) {
      url += `&nextPageToken=${encodeURIComponent(nextPageToken)}`;
    }
    
    const data = await jiraFetch(url.replace(JIRA_BASE_URL, ''), token, email);
    
    for (const issue of data.issues || []) {
      if (!seenKeys.has(issue.key)) {
        seenKeys.add(issue.key);
        allIssues.push(issue);
      }
    }
    
    if (!data.nextPageToken) break;
    nextPageToken = data.nextPageToken;
  }

  setCache(cacheKey, allIssues);
  return allIssues;
}

async function fetchSprints(token: string, email: string) {
  const cached = getCached('sprints');
  if (cached) return cached as any[];

  // First get the board ID for the project
  try {
    const boardData = await jiraFetch(
      `/rest/agile/1.0/board?projectKeyOrId=${PROJECT_KEY}`,
      token,
      email
    );
    if (!boardData.values || boardData.values.length === 0) {
      setCache('sprints', []);
      return [];
    }
    const boardId = boardData.values[0].id;
    
    const sprintData = await jiraFetch(
      `/rest/agile/1.0/board/${boardId}/sprint?maxResults=100`,
      token,
      email
    );
    const sprints = sprintData.values || [];
    setCache('sprints', sprints);
    return sprints;
  } catch (e) {
    console.error('Error fetching sprints:', e);
    setCache('sprints', []);
    return [];
  }
}

function extractSprintName(issue: any): string {
  // Use the known Sprint custom field
  const sprintField = issue.fields?.customfield_10115;
  if (Array.isArray(sprintField) && sprintField.length > 0) {
    // Use the last element (most recent sprint)
    const last = sprintField[sprintField.length - 1];
    // Standard format: array of objects { name: "Sprint 15" }
    if (typeof last === 'object' && last?.name) return last.name;
    // Legacy format: array of strings ["Sprint 15"]
    if (typeof last === 'string' && last.length > 0) return last;
  }
  // Single object format
  if (typeof sprintField === 'object' && sprintField?.name) return sprintField.name;
  // Plain string format
  if (typeof sprintField === 'string' && sprintField.length > 0) return sprintField;

  return 'No Sprint';
}

function aggregateStats(issues: any[], year: number) {
  const stats: Record<string, Record<string, Record<string, Record<string, {
    issuesCreated: number;
    issuesUpdated: number;
    issuesAssigned: number;
    issuesCommented: number;
    commentsCount: number;
    timeLoggedSeconds: number;
  }>>>> = {};

  const users = new Set<string>();
  const sprints = new Set<string>();
  const issueTypes = new Set<string>();
  const statuses = new Set<string>();

  for (const issue of issues) {
    const sprintName = extractSprintName(issue);
    sprints.add(sprintName);

    const issueType = issue.fields?.issuetype?.name || 'Unknown';
    issueTypes.add(issueType);

    const status = issue.fields?.status?.name || 'Unknown';
    statuses.add(status);

    const creatorName = issue.fields?.creator?.displayName || 'Unknown';
    const assigneeName = issue.fields?.assignee?.displayName || 'Unassigned';

    users.add(creatorName);
    if (assigneeName !== 'Unassigned') users.add(assigneeName);

    // Ensure sprint-user bucket exists
    const ensure = (sprint: string, user: string, issueType: string, status: string) => {
      if (!stats[sprint]) stats[sprint] = {};
      if (!stats[sprint][user]) stats[sprint][user] = {};
      if (!stats[sprint][user][issueType]) stats[sprint][user][issueType] = {};
      if (!stats[sprint][user][issueType][status]) {
        stats[sprint][user][issueType][status] = {
          issuesCreated: 0, issuesUpdated: 0, issuesAssigned: 0,
          issuesCommented: 0, commentsCount: 0, timeLoggedSeconds: 0,
        };
      }
    };

    // Issues Created
    const createdDate = new Date(issue.fields?.created);
    if (createdDate.getFullYear() === year) {
      ensure(sprintName, creatorName, issueType, status);
      stats[sprintName][creatorName][issueType][status].issuesCreated++;
    }

    // Issues Updated (count for all users who appear)
    const updatedDate = new Date(issue.fields?.updated);
    if (updatedDate.getFullYear() === year) {
      // Attribute update to creator as a fallback (changelog would be more accurate but expensive)
      ensure(sprintName, creatorName, issueType, status);
      stats[sprintName][creatorName][issueType][status].issuesUpdated++;
    }

    // Issues Assigned
    if (assigneeName !== 'Unassigned') {
      ensure(sprintName, assigneeName, issueType, status);
      stats[sprintName][assigneeName][issueType][status].issuesAssigned++;
    }

    // Comments
    const comments = issue.fields?.comment?.comments || [];
    const commenters = new Set<string>();
    for (const comment of comments) {
      const commentDate = new Date(comment.created);
      if (commentDate.getFullYear() === year) {
        const authorName = comment.author?.displayName || 'Unknown';
        users.add(authorName);
        ensure(sprintName, authorName, issueType, status);
        stats[sprintName][authorName][issueType][status].commentsCount++;
        commenters.add(authorName);
      }
    }
    for (const commenter of commenters) {
      stats[sprintName][commenter][issueType][status].issuesCommented++;
    }

    // Worklogs
    const worklogs = issue.fields?.worklog?.worklogs || [];
    for (const wl of worklogs) {
      const wlDate = new Date(wl.started || wl.created);
      if (wlDate.getFullYear() === year) {
        const authorName = wl.author?.displayName || 'Unknown';
        users.add(authorName);
        ensure(sprintName, authorName, issueType, status);
        stats[sprintName][authorName][issueType][status].timeLoggedSeconds += wl.timeSpentSeconds || 0;
      }
    }
  }

  // Flatten to array
  const rows: any[] = [];
  for (const [sprint, userMap] of Object.entries(stats)) {
    for (const [user, issueTypeMap] of Object.entries(userMap)) {
      for (const [issueType, statusMap] of Object.entries(issueTypeMap)) {
        for (const [status, metrics] of Object.entries(statusMap)) {
          rows.push({ sprint, user, issueType, status, ...metrics });
        }
      }
    }
  }

  return {
    rows,
    users: Array.from(users).sort(),
    // Natural numeric sort so "Sprint 10" sorts after "Sprint 9"
    sprints: Array.from(sprints).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    issueTypes: Array.from(issueTypes).sort(),
    statuses: Array.from(statuses).sort(),
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const token = Deno.env.get('JIRA_API_TOKEN');
    const email = Deno.env.get('JIRA_EMAIL');
    if (!token || !email) {
      return new Response(JSON.stringify({ error: 'JIRA_API_TOKEN or JIRA_EMAIL not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const yearParam = url.searchParams.get('year') || '2026';
    const year = parseInt(yearParam, 10);
    
    // Input validation for year parameter to prevent arbitrary queries and unbounded cache growth
    if (isNaN(year) || year < 2000 || year > 2100) {
      return new Response(JSON.stringify({ error: 'Invalid year parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Removed the unauthenticated 'fresh=1' cache bypass to prevent DoS via cache exhaustion

    const [issues, sprintsList] = await Promise.all([
      fetchAllIssues(token, email, year),
      fetchSprints(token, email),
    ]);

    const result = aggregateStats(issues, year);

    // Merge Agile API sprint names as the canonical list.
    // This ensures sprints that exist in Jira but have no issues in the
    // filtered date range still appear in the UI.
    const agileSprintNames: string[] = sprintsList
      .map((s: any) => s.name)
      .filter(Boolean);
    const mergedSprints = Array.from(
      new Set([...agileSprintNames, ...result.sprints])
    ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    return new Response(JSON.stringify({
      ...result,
      sprints: mergedSprints,
      sprintDetails: sprintsList,
      totalIssues: issues.length,
      year,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'An internal server error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
