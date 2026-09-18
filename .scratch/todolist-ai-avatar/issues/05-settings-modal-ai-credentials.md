# 05: Settings Modal & Multi-Provider AI Credential Store

**What to build:**
A Settings modal accessible from the header allowing the user to select their AI provider (Google Gemini or OpenAI), enter their respective API key, select the model (e.g. Gemini 2.0 Flash / GPT-4o-mini), and run a connection test. Credentials are saved strictly to client-side `localStorage`.

**Blocked by:**
01: Project Scaffold & Core Task Creation (Tracer Bullet)

**Status:** completed

- [x] Settings button in header opens an accessible modal dialog (`Esc` to dismiss).
- [x] Provider switcher between Google Gemini and OpenAI.
- [x] Password-masked input field for API Key with an eye toggle to view/hide.
- [x] "Test Connection" button sends a lightweight ping to verify the key and reports success or clear error messages.
- [x] Configuration securely stored in browser `localStorage` under `todolist_ai_settings`.
- [x] Automated tests verify credential storage and validation helper logic.
