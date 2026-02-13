# Sentinel's Journal

## 2026-02-11 - Unauthenticated API Access to Paid LLM
**Vulnerability:** The `/api/chat` endpoint retrieved the user session but did not enforce authentication, allowing anonymous users to trigger calls to the paid `MEGALLM_API_KEY`.
**Learning:** Checking for user existence (`supabase.auth.getUser()`) is not enough; explicit control flow (early return) is required to stop execution.
**Prevention:** Always add `if (!user) return new Response('Unauthorized', { status: 401 });` immediately after authentication checks in API routes.

## 2026-02-12 - Prompt Injection in Chat Title Generation
**Vulnerability:** The `/api/chat` endpoint interpolated user input directly into a single string for title generation, allowing prompt injection (e.g., overriding instructions).
**Learning:** Interpolating user content into LLM prompts is inherently insecure.
**Prevention:** Always use structured messages (System for instructions, User for data) and truncate input to prevent resource exhaustion.
