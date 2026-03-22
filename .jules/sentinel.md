## 2024-03-22 - Prevented Information Exposure in API Error Responses
**Vulnerability:** The Supabase Edge Function `jira-stats` was returning raw Jira API error bodies and internal Error messages directly to the client when a request failed.
**Learning:** Returning raw API responses or internal error messages directly to the client can leak sensitive infrastructure details, stack traces, or other internal information.
**Prevention:** Always log detailed error messages server-side (e.g., using `console.error`) for debugging, but return generic error messages (e.g., "An internal server error occurred") to the client.
