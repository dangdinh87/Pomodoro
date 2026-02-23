# Sentinel's Journal

## 2026-02-11 - Unauthenticated API Access to Paid LLM
**Vulnerability:** The `/api/chat` endpoint retrieved the user session but did not enforce authentication, allowing anonymous users to trigger calls to the paid `MEGALLM_API_KEY`.
**Learning:** Checking for user existence (`supabase.auth.getUser()`) is not enough; explicit control flow (early return) is required to stop execution.
**Prevention:** Always add `if (!user) return new Response('Unauthorized', { status: 401 });` immediately after authentication checks in API routes.

## 2026-02-12 - Unrestricted AI Model Selection
**Vulnerability:** The `/api/chat` and `/api/conversations` endpoints accepted arbitrary strings for the `model` parameter, potentially allowing users to access unauthorized or expensive models if the backend provider supports them.
**Learning:** External API parameters controlled by user input must be strictly validated against an allowlist, even if they seem harmless or have defaults.
**Prevention:** Define `ALLOWED_MODELS` constants and validate input against them before passing to external services or database.
