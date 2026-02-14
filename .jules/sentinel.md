# Sentinel's Journal

## 2026-02-11 - Unauthenticated API Access to Paid LLM
**Vulnerability:** The `/api/chat` endpoint retrieved the user session but did not enforce authentication, allowing anonymous users to trigger calls to the paid `MEGALLM_API_KEY`.
**Learning:** Checking for user existence (`supabase.auth.getUser()`) is not enough; explicit control flow (early return) is required to stop execution.
**Prevention:** Always add `if (!user) return new Response('Unauthorized', { status: 401 });` immediately after authentication checks in API routes.

## 2024-05-22 - Missing Model Validation in Chat API
**Vulnerability:** The chat API accepted any string as the 'model' parameter, passing it directly to the external LLM provider. This could allow usage of unauthorized, expensive, or internal models.
**Learning:** Even when using external APIs, all inputs (including configuration parameters like model names) must be validated against a whitelist to enforce business and security policies.
**Prevention:** Always validate external API parameters against a strict allowlist (e.g., `ALLOWED_CHAT_MODELS`) before making the request. Default to a safe value if validation fails.
