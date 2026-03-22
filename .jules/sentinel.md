## 2025-05-20 - Hardcoded API Target Email
**Vulnerability:** A hardcoded email `oleh@get-code.net` was used as `JIRA_EMAIL` in the `supabase/functions/jira-stats/index.ts` file to construct Basic Authentication headers for Jira API.
**Learning:** Hardcoding sensitive or user-specific information (like emails used for authorization tokens) in the codebase is a security and flexibility risk. It can expose targeted accounts if the repository is public or accessed by unauthorized individuals.
**Prevention:** Fetch such sensitive or environment-specific configuration via environment variables instead, ensuring secrets are securely injected at runtime. Always validate the presence of these environment variables before using them to prevent silent failures or unintended consequences.
