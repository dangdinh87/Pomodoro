# Sentinel's Journal

## 2026-02-11 - Unauthenticated API Access to Paid LLM
**Vulnerability:** The `/api/chat` endpoint retrieved the user session but did not enforce authentication, allowing anonymous users to trigger calls to the paid `MEGALLM_API_KEY`.
**Learning:** Checking for user existence (`supabase.auth.getUser()`) is not enough; explicit control flow (early return) is required to stop execution.
**Prevention:** Always add `if (!user) return new Response('Unauthorized', { status: 401 });` immediately after authentication checks in API routes.

## 2026-02-13 - Unauthenticated API Proxy for Models
**Vulnerability:** The `/api/chat/models` endpoint proxied requests to the MegaLLM API without any authentication, allowing public access to the model list.
**Learning:** Even "read-only" endpoints that proxy to external services should be authenticated to prevent unauthorized usage and potential abuse of API quotas.
**Prevention:** Apply the same authentication checks to auxiliary endpoints (like model lists) as to core feature endpoints.
