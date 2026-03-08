# Sentinel's Journal

## 2026-02-11 - Unauthenticated API Access to Paid LLM
**Vulnerability:** The `/api/chat` endpoint retrieved the user session but did not enforce authentication, allowing anonymous users to trigger calls to the paid `MEGALLM_API_KEY`.
**Learning:** Checking for user existence (`supabase.auth.getUser()`) is not enough; explicit control flow (early return) is required to stop execution.
**Prevention:** Always add `if (!user) return new Response('Unauthorized', { status: 401 });` immediately after authentication checks in API routes.

## 2026-03-02 - Unauthenticated API Access to MegaLLM Models List
**Vulnerability:** The `/api/chat/models` endpoint acted as an unauthenticated proxy to the MegaLLM models API, which could be abused or allow anonymous usage limits/data harvesting.
**Learning:** Similarly to the chat endpoint, read-only external API proxy endpoints also need robust session validation to prevent unauthorized usage and possible abuse.
**Prevention:** Always wrap external API calls behind a valid authenticated user session using `supabase.auth.getUser()` and explicitly returning `401` when no valid user is present.

## 2026-03-05 - AI Prompt Injection via Role Spoofing
**Vulnerability:** The `/api/chat` endpoint accepted incoming messages and mapped their roles directly (`role: msg.role`) without sanitizing whether a user was attempting to inject a `system` prompt. This allowed users to bypass the application's intended restrictions by overriding `BRO_AI_SYSTEM_PROMPT` using injected system instructions.
**Learning:** We cannot trust the `role` attribute from client requests when constructing messages for a Large Language Model. Attackers can manipulate payload values to elevate privileges in the prompt.
**Prevention:** Always restrict incoming message roles to `user` or `assistant` and explicitly fallback to `user` if an invalid or restricted role is provided. System prompts must strictly originate from the server.
