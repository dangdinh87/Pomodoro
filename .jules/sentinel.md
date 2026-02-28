# Sentinel's Journal

## 2026-02-11 - Unauthenticated API Access to Paid LLM
**Vulnerability:** The `/api/chat` endpoint retrieved the user session but did not enforce authentication, allowing anonymous users to trigger calls to the paid `MEGALLM_API_KEY`.
**Learning:** Checking for user existence (`supabase.auth.getUser()`) is not enough; explicit control flow (early return) is required to stop execution.
**Prevention:** Always add `if (!user) return new Response('Unauthorized', { status: 401 });` immediately after authentication checks in API routes.

## 2024-03-01 - Missing Authentication on Proxy API
**Vulnerability:** The API route `src/app/api/chat/models/route.ts` proxy requests to the external MegaLLM API using a server-side API key (`MEGALLM_API_KEY`). However, it lacked any `supabase.auth.getUser()` check, exposing it completely to the public. This could allow unauthenticated users to exhaust the external API quota or launch a denial of service attack.
**Learning:** Proxy endpoints that utilize secret keys or consume external services are high-risk targets. Just because an endpoint doesn't directly manipulate a local database doesn't mean it can bypass authentication.
**Prevention:** Always verify that all Next.js App Router API routes under `src/app/api/` (except public ones like webhooks) explicitly call `supabase.auth.getUser()` to enforce authentication before making external requests or executing business logic.
