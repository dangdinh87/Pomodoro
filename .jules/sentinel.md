# Sentinel's Journal

## 2026-02-11 - Unauthenticated API Access to Paid LLM
**Vulnerability:** The `/api/chat` endpoint retrieved the user session but did not enforce authentication, allowing anonymous users to trigger calls to the paid `MEGALLM_API_KEY`.
**Learning:** Checking for user existence (`supabase.auth.getUser()`) is not enough; explicit control flow (early return) is required to stop execution.
**Prevention:** Always add `if (!user) return new Response('Unauthorized', { status: 401 });` immediately after authentication checks in API routes.

## 2026-03-02 - Unauthenticated API Access to MegaLLM Models List
**Vulnerability:** The `/api/chat/models` endpoint acted as an unauthenticated proxy to the MegaLLM models API, which could be abused or allow anonymous usage limits/data harvesting.
**Learning:** Similarly to the chat endpoint, read-only external API proxy endpoints also need robust session validation to prevent unauthorized usage and possible abuse.
**Prevention:** Always wrap external API calls behind a valid authenticated user session using `supabase.auth.getUser()` and explicitly returning `401` when no valid user is present.
## 2026-03-04 - Prevent Arbitrary Model Updates
**Vulnerability:** The API endpoints for updating and creating conversations lacked validation on the `model` parameter. This could allow users to specify models that are unavailable or prohibitively expensive, potentially causing downstream errors or API abuse.
**Learning:** When acting as a proxy to third-party services (like LLM APIs), all incoming configurations—especially those dictating resource usage like the 'model'—must be strictly validated against an allowed list, rather than relying solely on client-side constraints.
**Prevention:** Establish a single source of truth for allowed models (e.g., `ALLOWED_CHAT_MODELS`) and enforce validation on both creation (POST) and update (PATCH) requests on the server-side, failing safely by dropping invalid properties or using fallbacks.
