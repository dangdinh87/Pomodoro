# Sentinel's Journal

## 2026-02-11 - Unauthenticated API Access to Paid LLM
**Vulnerability:** The `/api/chat` endpoint retrieved the user session but did not enforce authentication, allowing anonymous users to trigger calls to the paid `MEGALLM_API_KEY`.
**Learning:** Checking for user existence (`supabase.auth.getUser()`) is not enough; explicit control flow (early return) is required to stop execution.
**Prevention:** Always add `if (!user) return new Response('Unauthorized', { status: 401 });` immediately after authentication checks in API routes.

## 2026-03-02 - Unauthenticated API Access to MegaLLM Models List
**Vulnerability:** The `/api/chat/models` endpoint acted as an unauthenticated proxy to the MegaLLM models API, which could be abused or allow anonymous usage limits/data harvesting.
**Learning:** Similarly to the chat endpoint, read-only external API proxy endpoints also need robust session validation to prevent unauthorized usage and possible abuse.
**Prevention:** Always wrap external API calls behind a valid authenticated user session using `supabase.auth.getUser()` and explicitly returning `401` when no valid user is present.

## 2026-03-03 - Insecure Direct Object Reference (IDOR) in Chat Appends
**Vulnerability:** The `/api/chat` endpoint accepted a `conversationId` to append messages to, but it did not verify that the ID actually belonged to the authenticated user, allowing any user to append messages to another user's conversation.
**Learning:** Checking for an authenticated session does not automatically validate that the session is authorized to modify specific resources via their ID.
**Prevention:** Always verify resource ownership by querying the database using the resource ID and comparing the owner's `user_id` to the currently authenticated `user.id` before allowing modifications.
