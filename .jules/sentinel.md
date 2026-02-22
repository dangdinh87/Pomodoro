# Sentinel's Journal

## 2026-02-11 - Unauthenticated API Access to Paid LLM
**Vulnerability:** The `/api/chat` endpoint retrieved the user session but did not enforce authentication, allowing anonymous users to trigger calls to the paid `MEGALLM_API_KEY`.
**Learning:** Checking for user existence (`supabase.auth.getUser()`) is not enough; explicit control flow (early return) is required to stop execution.
**Prevention:** Always add `if (!user) return new Response('Unauthorized', { status: 401 });` immediately after authentication checks in API routes.

## 2026-02-12 - [Unrestricted Model Usage in Chat API]
**Vulnerability:** The Chat API allowed users to specify any model string via the `model` parameter, which was passed directly to the LLM provider, potentially allowing access to unauthorized or expensive models.
**Learning:** Dynamic model fetching endpoints (like `/api/chat/models`) create a false sense of security; backend endpoints must independently validate inputs against a strict allowlist.
**Prevention:** Define explicit allowlists (e.g., `ALLOWED_CHAT_MODELS`) for sensitive parameters that control resource usage or cost, and validate user input against them on the server.
