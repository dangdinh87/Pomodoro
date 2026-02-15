# Sentinel's Journal

## 2026-02-11 - Unauthenticated API Access to Paid LLM
**Vulnerability:** The `/api/chat` endpoint retrieved the user session but did not enforce authentication, allowing anonymous users to trigger calls to the paid `MEGALLM_API_KEY`.
**Learning:** Checking for user existence (`supabase.auth.getUser()`) is not enough; explicit control flow (early return) is required to stop execution.
**Prevention:** Always add `if (!user) return new Response('Unauthorized', { status: 401 });` immediately after authentication checks in API routes.

## 2026-02-12 - Missing Rate Limiting on Public Endpoints
**Vulnerability:** The `/api/feedback` endpoint accepted anonymous POST requests without any rate limiting, creating a potential vector for spam and resource exhaustion.
**Learning:** Publicly accessible endpoints (even for benign purposes like feedback) are prime targets for abuse if not protected. In-memory rate limiting is a viable first line of defense for serverless functions, though distributed limiting is better for scale.
**Prevention:** Implement a lightweight `RateLimiter` utility for all anonymous API routes.
