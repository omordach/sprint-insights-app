export interface JiraStatRow {
  sprint: string;
  user: string;
  issueType: string;
  status: string;
  issuesCreated: number;
  issuesUpdated: number;
  issuesAssigned: number;
  issuesCommented: number;
  commentsCount: number;
  timeLoggedSeconds: number;
}

export interface JiraStatsResponse {
  rows: JiraStatRow[];
  users: string[];
  sprints: string[];
  issueTypes: string[];
  statuses: string[];
  sprintDetails: unknown[];
  totalIssues: number;
  year: number;
}

export interface DashboardFilters {
  sprint: string[];
  month: string[];
  user: string[];
  issueType: string[];
  status: string[];
}
