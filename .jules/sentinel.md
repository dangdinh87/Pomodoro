# Sentinel's Journal

## 2026-02-11 - Unauthenticated API Access to Paid LLM
**Vulnerability:** The `/api/chat` endpoint retrieved the user session but did not enforce authentication, allowing anonymous users to trigger calls to the paid `MEGALLM_API_KEY`.
**Learning:** Checking for user existence (`supabase.auth.getUser()`) is not enough; explicit control flow (early return) is required to stop execution.
**Prevention:** Always add `if (!user) return new Response('Unauthorized', { status: 401 });` immediately after authentication checks in API routes.

## 2026-02-12 - Missing Security Headers & Rate Limiting Gap
**Vulnerability:** The application lacked standard security headers (X-Frame-Options, X-Content-Type-Options, etc.) and rate limiting on sensitive API routes like `/api/chat` (connected to paid LLM).
**Learning:** Next.js does not add these headers by default; they must be explicitly configured in `middleware.ts` or `next.config.js`. Serverless environments make stateful rate limiting difficult without external stores (Redis/Upstash).
**Prevention:** Always include a security headers middleware. For rate limiting, integrate a distributed rate limiter (e.g., Upstash) for sensitive routes.
