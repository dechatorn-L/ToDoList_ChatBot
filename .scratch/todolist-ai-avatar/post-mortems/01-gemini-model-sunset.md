# Post-Mortem: Gemini 2.0 Flash Model Deprecation / Sunset

## 1. Summary
Google Gemini deprecated the `models/gemini-2.0-flash` endpoint, causing all task chat requests and test connection pings using default settings to fail with an API error. The issue was resolved by upgrading the default and fallback model to `gemini-3.6-flash`, adding an automatic in-flight migration for existing client-side `localStorage` stores, and updating the UI model selector options.

## 2. Symptom
Users attempting to send chat messages or test Gemini connections encountered the following runtime API error:
```
Error: This model models/gemini-2.0-flash is no longer available. Please update your code to use models/gemini-3.6-flash for the latest features and improvements. We recommend you to use the Interactions API
```

## 3. Root Cause
`src/utils/aiSettings.ts` hardcoded `gemini-2.0-flash` in `DEFAULT_SETTINGS.geminiModel` and as fallback in `testConnection()`. Furthermore, `src/utils/aiDispatcher.ts` and `src/components/SettingsModal.tsx` hardcoded `gemini-2.0-flash` as the default fallback. Once Google disabled the model endpoint, any call to `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:...` resulted in an HTTP error response from Google.

## 4. Why It Produced the Symptom
1. When a user first opens the app or has saved settings with Gemini, `settings.geminiModel` defaulted to `gemini-2.0-flash`.
2. `sendChatMessage()` constructed the URL:
   `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=...`
3. Google AI Studio returned HTTP error rejecting the deprecated model string.
4. The error message bubbled up into `ChatDrawer` chat messages and `SettingsModal` test connection banner.

## 5. Fix
- **`src/utils/aiSettings.ts`**:
  - Updated `DEFAULT_SETTINGS.geminiModel` to `'gemini-3.6-flash'`.
  - Added automatic migration in `loadSettings()`:
    ```typescript
    if (parsed.geminiModel === 'gemini-2.0-flash' || parsed.geminiModel === 'models/gemini-2.0-flash') {
      parsed.geminiModel = 'gemini-3.6-flash';
    }
    ```
    This guarantees that existing users with previous `localStorage` data are seamlessly upgraded without manual re-configuration.
  - Updated fallback model in `testConnection()` to `gemini-3.6-flash`.
- **`src/utils/aiDispatcher.ts`**:
  - Updated fallback model in `sendChatMessage()` to `gemini-3.6-flash`.
- **`src/components/SettingsModal.tsx`**:
  - Updated model dropdown to feature `gemini-3.6-flash (Recommended)`.
- **`src/components/ChatDrawer.tsx`**:
  - Updated fallback model label in header subtitle to `gemini-3.6-flash`.

## 6. How It Was Found
- **Repro:** Added unit tests in `src/utils/aiSettings.test.ts` verifying default model value and checking that `loadSettings()` transforms `gemini-2.0-flash` into `gemini-3.6-flash`.
- **Debug Mantra Cascade:**
  - *Mantra 1 (Reproducibility):* Captured deterministic test failure (`expected 'gemini-2.0-flash' to be 'gemini-3.6-flash'`).
  - *Mantra 2 (Fail Path):* Traced `loadSettings()` -> `sendChatMessage()` -> URL string interpolation.
  - *Mantra 3 (Falsify Hypothesis):* Proved that only updating `DEFAULT_SETTINGS` was insufficient because existing user `localStorage` would still load the deprecated model name.
  - *Mantra 4 (Ledger):* Verified across all 60 tests in test suite.

## 7. Why It Slipped Through
- External API model lifecycles evolve independently of codebase releases. Models that were active during development were sunset upstream by the AI provider.

## 8. Validation
- `src/utils/aiSettings.test.ts`:
  - `defaults character to robot if missing in storage and uses gemini-3.6-flash` (Passed)
  - `automatically migrates deprecated gemini-2.0-flash to gemini-3.6-flash` (Passed)
- Full Vitest suite: 60/60 tests passing (`npx vitest run`).
- Full TypeScript & Vite build: 0 errors (`npm run build`).

## 9. Action Items / Follow-ups
- None — the backward-compatible auto-migration and model upgrade resolve the root cause completely.
