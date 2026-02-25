## 2026-02-25 - [AI Model Parameter Tampering]
**Vulnerability:** The `/api/chat` and `/api/conversations` endpoints accepted any `model` string and forwarded it to the AI provider, allowing potential unauthorized model usage or cost escalation.
**Learning:** AI proxy endpoints often trust client-provided parameters (like `model`, `max_tokens`) blindly.
**Prevention:** Always whitelist allowed values for sensitive parameters like AI models on the server side.
