# 08: Voice Interaction with Speech-to-Text & Spoken Responses

**What to build:**
Users can manage tasks hands-free by speaking into their microphone using native Web SpeechRecognition (supporting Thai `th-TH` default and English `en-US`), while the AI companion synthesizes spoken voice responses using native Web SpeechSynthesis. Users have full control to toggle audio mute on/off instantly and speech is automatically cancelled when interrupted or when the drawer is closed.

**Blocked by:**
06: Conversational Agent & Tool-Calling Dispatcher
07: Avatar Character Personas & Customization Gallery

**Status:** complete

- [x] Microphone button in Chat Drawer input bar starts native Speech-to-Text dictation.
- [x] Visual listening animation while recording and graceful fallback if microphone permission is denied or unsupported.
- [x] AI companion synthesizes speech and speaks out response text via Web SpeechSynthesis when audio is enabled.
- [x] Speaker Mute/Unmute toggle button in Chat Drawer header and Settings Modal.
- [x] Active speech immediately cancels (`speechSynthesis.cancel()`) upon mute, drawer close, or new voice input.
- [x] Speech language selection (Thai `th-TH` default, English `en-US`) configurable in Settings.
- [x] Automated tests verify speech recognition lifecycle, synthesis invocation, and mute behavior.
