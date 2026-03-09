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
**Vulnerability:** The API endpoints for chat completions (`/api/chat/route.ts`) and message persistence (`/api/conversations/[id]/messages/route.ts`) blindly accepted the `role` property from the client. Malicious users could pass `role: "system"` to override the LLM's core instructions and constraints.
**Learning:** Any data originating from the client, even keys within a seemingly safe message object, must be explicitly validated. We cannot trust that the client will only send "user" or "assistant" roles.
**Prevention:** Explicitly validate and sanitize roles in the LLM pipeline. For inference, gracefully fallback invalid roles to `"user"`. For storage, strictly enforce valid roles and reject bad requests with a `400`.
