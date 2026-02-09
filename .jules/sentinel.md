# Sentinel's Journal

## 2025-02-18 - Client-Side Enforcement, Server-Side Trust
**Vulnerability:** The `/api/chat` endpoint relied on client-side authentication checks in the UI component, allowing unauthenticated users to access the paid LLM API directly.
**Learning:** Frontend `if (!user)` checks are merely UX features, not security controls. API endpoints must always independently verify authentication regardless of client-side logic.
**Prevention:** Always implement authentication middleware or explicit checks in API route handlers before processing sensitive operations or calling external paid services.
