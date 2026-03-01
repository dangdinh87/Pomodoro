# Sentinel's Journal

## 2026-02-11 - Unauthenticated API Access to Paid LLM
**Vulnerability:** The `/api/chat` endpoint retrieved the user session but did not enforce authentication, allowing anonymous users to trigger calls to the paid `MEGALLM_API_KEY`.
**Learning:** Checking for user existence (`supabase.auth.getUser()`) is not enough; explicit control flow (early return) is required to stop execution.
**Prevention:** Always add `if (!user) return new Response('Unauthorized', { status: 401 });` immediately after authentication checks in API routes.
## 2024-05-24 - [Critical] Fix API Authorization Bypass in Tasks API
**Vulnerability:** The `isAuthorized` function in `src/app/api/tasks/route.ts` and `src/app/api/tasks/[id]/route.ts` returned `true` if the `API_ROUTE_TOKEN` environment variable was not configured. This resulted in a "fail-open" scenario where missing configuration completely bypassed authentication.
**Learning:** Security checks that rely on environment variables must "fail securely" (fail-closed) if the variable is missing. Returning `true` when a token is not configured means the API assumes the request is authorized by default, which is a critical vulnerability.
**Prevention:** Always default to `false` or throw an error when security-critical configuration is missing. Apply the principle of "fail securely" to all authorization and authentication logic.
