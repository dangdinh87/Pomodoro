# Sentinel's Journal

## 2026-02-11 - Unauthenticated API Access to Paid LLM
**Vulnerability:** The `/api/chat` endpoint retrieved the user session but did not enforce authentication, allowing anonymous users to trigger calls to the paid `MEGALLM_API_KEY`.
**Learning:** Checking for user existence (`supabase.auth.getUser()`) is not enough; explicit control flow (early return) is required to stop execution.
**Prevention:** Always add `if (!user) return new Response('Unauthorized', { status: 401 });` immediately after authentication checks in API routes.

## 2026-02-26 - Prompt Injection in Title Generation
**Vulnerability:** User input was directly interpolated into the LLM system instruction string, allowing users to override instructions (Prompt Injection).
**Learning:** String interpolation for LLM prompts is inherently insecure when user input is involved, similar to SQL injection.
**Prevention:** Always use structured messages (`messages: [{ role: 'system', ... }, { role: 'user', content: userInput }]`) to separate instructions from untrusted content.
