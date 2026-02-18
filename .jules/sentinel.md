# Sentinel's Journal

## 2026-02-11 - Unauthenticated API Access to Paid LLM
**Vulnerability:** The `/api/chat` endpoint retrieved the user session but did not enforce authentication, allowing anonymous users to trigger calls to the paid `MEGALLM_API_KEY`.
**Learning:** Checking for user existence (`supabase.auth.getUser()`) is not enough; explicit control flow (early return) is required to stop execution.
**Prevention:** Always add `if (!user) return new Response('Unauthorized', { status: 401 });` immediately after authentication checks in API routes.

## 2026-02-12 - Unauthorized Model Injection & DoS in Chat API
**Vulnerability:** The `/api/chat` endpoint accepted any `model` string from the client and passed it directly to the LLM provider, allowing potential use of more expensive models. It also lacked input length validation, exposing the system to token exhaustion and cost spikes.
**Learning:** LLM APIs often charge by token count and model tier. Trusting client input for model selection or message length directly impacts operational costs and system stability.
**Prevention:** Whitelist allowed models on the server side (e.g., `ALLOWED_CHAT_MODELS`) and enforce strict character limits on user input before sending to external AI services.
