import { useQuery } from "@tanstack/react-query";
import type { JiraStatsResponse } from "@/types/jira";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function useJiraStats(year: number) {
  return useQuery<JiraStatsResponse>({
    queryKey: ["jira-stats", year],
    queryFn: async () => {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/jira-stats?year=${year}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Failed to fetch Jira stats');
      }

      return res.json();
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
