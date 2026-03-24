## 2025-05-20 - Hardcoded API Target Email
**Vulnerability:** A hardcoded email `oleh@get-code.net` was used as `JIRA_EMAIL` in the `supabase/functions/jira-stats/index.ts` file to construct Basic Authentication headers for Jira API.
**Learning:** Hardcoding sensitive or user-specific information (like emails used for authorization tokens) in the codebase is a security and flexibility risk. It can expose targeted accounts if the repository is public or accessed by unauthorized individuals.
**Prevention:** Fetch such sensitive or environment-specific configuration via environment variables instead, ensuring secrets are securely injected at runtime. Always validate the presence of these environment variables before using them to prevent silent failures or unintended consequences.
## 2025-05-18 - [Unauthenticated Cache Bypass and Resource Exhaustion in Edge Functions]
**Vulnerability:** The Supabase Edge Function `jira-stats` allowed an unauthenticated cache bypass via `?fresh=1` and lacked input validation on the `year` parameter. This could lead to a Denial of Service (DoS) by growing the in-memory cache infinitely and exhausting the downstream Jira API rate limits.
**Learning:** Even simple analytics endpoints need strict input validation and access control on administrative features like cache busting. An unauthenticated endpoint must never expose a parameter that forces a cache bypass or unbounded resource allocation.
**Prevention:**
1. Always validate query parameters (e.g., `year` must be a valid number within a specific range).
2. Remove unauthenticated cache bypass mechanisms or protect them with secrets/auth.
3. Restrict HTTP methods to only what is necessary (e.g., allow only GET and OPTIONS).
## 2025-03-24 - [CORS Misconfiguration in Supabase Edge Functions]
**Vulnerability:** Overly permissive CORS `Access-Control-Allow-Origin: *` identified in `supabase/functions/jira-stats/index.ts`.
**Learning:** Default Supabase templates or initial setups might use wildcard origins for convenience, exposing the API to Cross-Origin Resource Sharing attacks.
**Prevention:** Always restrict `Access-Control-Allow-Origin` using environment variables (e.g., `Deno.env.get('ALLOWED_ORIGIN')`) with a secure fallback for local development.
