# 07: Avatar Character Personas & Customization Gallery

**What to build:**
Users can customize their mascot avatar companion by choosing between three distinct personas: Classic Robot, Orange Cat, and Shiba Dog. Every character persona faithfully expresses all 7 emotional states (`neutral`, `idle_lounge`, `idle_sleep`, `celebrating`, `alert_overdue`, `thinking`, `talking`) with distinct SVG facial features and animations. Users can switch characters from both the Settings Modal gallery and a quick switcher in the Chat Drawer header, with their choice persisting in client-side storage.

**Blocked by:**
04: Floating Mascot with Dynamic Idle & Reactive Emotions
05: Settings Modal & Multi-Provider AI Credential Store

**Status:** complete

- [x] `AvatarCharacter` domain type (`robot`, `cat`, `dog`) supported in settings and components.
- [x] Orange Cat SVG persona implemented with ears, whiskers, and expressions for all 7 moods.
- [x] Shiba Dog SVG persona implemented with snout, ears, and expressions for all 7 moods.
- [x] Visual character gallery selector in Settings Modal with 1-click selection and preview.
- [x] Quick character switcher in the Chat Drawer header allowing instant companion swaps.
- [x] Selected character persists in browser `localStorage` under `todolist_ai_settings`.
- [x] Automated tests verify character rendering, mood expressions, and persistence.
