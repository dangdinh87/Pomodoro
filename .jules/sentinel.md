# Sentinel's Journal

## 2026-02-11 - Unauthenticated API Access to Paid LLM
**Vulnerability:** The `/api/chat` endpoint retrieved the user session but did not enforce authentication, allowing anonymous users to trigger calls to the paid `MEGALLM_API_KEY`.
**Learning:** Checking for user existence (`supabase.auth.getUser()`) is not enough; explicit control flow (early return) is required to stop execution.
**Prevention:** Always add `if (!user) return new Response('Unauthorized', { status: 401 });` immediately after authentication checks in API routes.

## 2026-03-02 - Unauthenticated API Access to MegaLLM Models List
**Vulnerability:** The `/api/chat/models` endpoint acted as an unauthenticated proxy to the MegaLLM models API, which could be abused or allow anonymous usage limits/data harvesting.
**Learning:** Similarly to the chat endpoint, read-only external API proxy endpoints also need robust session validation to prevent unauthorized usage and possible abuse.
**Prevention:** Always wrap external API calls behind a valid authenticated user session using `supabase.auth.getUser()` and explicitly returning `401` when no valid user is present.

## 2026-03-03 - AI Prompt Injection via Role Spoofing
**Vulnerability:** The `/api/chat` and `/api/conversations/[id]/messages` endpoints did not restrict the `role` parameter of incoming messages. This allowed malicious actors to inject `{ role: "system", content: "..." }` to overwrite system instructions or insert arbitrary roles.
**Learning:** Never trust the `role` attribute provided in client payloads when handling LLM conversations. User input should only be allowed to populate the `user` role or, in some contexts, append previous `assistant` responses.
**Prevention:** Explicitly validate or sanitize the `role` field on all message API boundaries, strictly restricting it to `user` or `assistant`.
