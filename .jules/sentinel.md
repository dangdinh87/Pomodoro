# Sentinel's Journal

## 2026-02-11 - Unauthenticated API Access to Paid LLM
**Vulnerability:** The `/api/chat` endpoint retrieved the user session but did not enforce authentication, allowing anonymous users to trigger calls to the paid `MEGALLM_API_KEY`.
**Learning:** Checking for user existence (`supabase.auth.getUser()`) is not enough; explicit control flow (early return) is required to stop execution.
**Prevention:** Always add `if (!user) return new Response('Unauthorized', { status: 401 });` immediately after authentication checks in API routes.

## 2026-02-11 - Unprotected Helper Endpoint Exposing Paid Service
**Vulnerability:** The `/api/chat/models` endpoint was completely public, allowing any unauthenticated user to trigger requests to the paid MegaLLM service using the server-side `MEGALLM_API_KEY`.
**Learning:** Helper endpoints (like "list models") often get overlooked during security reviews because they seem "read-only", but they still consume resources and API quota.
**Prevention:** Apply the same authentication middleware/checks to *all* related endpoints in a feature vertical (e.g., if `/chat` is auth-only, `/chat/models` must be too).
