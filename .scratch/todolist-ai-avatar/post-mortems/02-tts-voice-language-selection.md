# Post-Mortem: Web Speech TTS Incomprehensible Thai & Distorted English Voice

## 1. Summary
When the AI companion attempted to speak responses, Thai text was pronounced as unintelligible alien gibberish, and English responses sounded robotic and unnatural. The root cause was that `SpeechSynthesisUtterance` only set `utterance.lang = language` without explicitly selecting and binding `utterance.voice` from `window.speechSynthesis.getVoices()`. On Chromium/Windows, this caused the browser to route Thai Unicode text to the operating system's default English synthesizer. The issue was resolved by implementing dynamic content language detection (`/[\u0E00-\u0E7F]/`), explicit voice matching for Thai (`th-TH`), prioritization of high-quality Natural/Google voices for English, and defensive fallback preventing Thai text from being routed to English engines when Thai language packs are absent.

## 2. Symptom
User reported:
```
ปัญหาเสียงพูด พูดภาษาไทยเป็นภาษาอะไรไม่รู้ ภาษาอังกฤษเสียงแปลกๆ ตรวจสอบ
(Spoken voice issue: Thai is pronounced like gibberish / unknown language, English voice sounds weird).
```

## 3. Root Cause
1. In `src/hooks/useVoiceSpeech.ts`, `speak()` created a `SpeechSynthesisUtterance(cleanText)` and set `utterance.lang = language`, but never assigned `utterance.voice`.
2. In browser Web Speech implementations (particularly Chromium on Windows), if `utterance.voice` is unset, the engine ignores `utterance.lang` and uses the default system voice (typically `Microsoft David Desktop` or standard English US).
3. Passing Thai Unicode strings (e.g., `สวัสดีครับ...`) into an English phoneme synthesizer causes the engine to evaluate Thai glyphs with English pronunciation rules, outputting bizarre, disjointed syllables ("พูดภาษาไทยเป็นภาษาอะไรไม่รู้").
4. For English, omitting voice selection defaulted to legacy robotic SAPI voices instead of available high-definition Natural voices (`Microsoft Natural` or `Google US English`).

## 4. Why It Produced the Symptom
- Browser TTS architecture requires explicit `SpeechSynthesisVoice` object references to trigger localized neural and acoustic models.
- When `utterance.voice` is `null`/`undefined`, the browser falls back to index 0 / system default voice. On non-Thai Windows locales, the default is an English voice engine incapable of synthesizing Thai tonal grammar or consonants.

## 5. Fix
- **`src/hooks/useVoiceSpeech.ts`**:
  - Added dynamic voice state tracking with `window.speechSynthesis.onvoiceschanged` listener.
  - Implemented smart content-aware language detection:
    ```typescript
    const hasThaiChars = /[\u0E00-\u0E7F]/.test(cleanText);
    const targetLanguage = hasThaiChars ? 'th-TH' : language || 'en-US';
    ```
  - Explicit Thai voice binding:
    ```typescript
    matchedVoice = allVoices.find(
      (v) =>
        v.lang?.toLowerCase().startsWith('th') ||
        v.lang?.toLowerCase().replace('_', '-').startsWith('th')
    );
    ```
  - Defensive guard: If Thai text is present but the host system has zero Thai TTS voices installed, abort cleanly and notify the user with a descriptive message to install the Thai Speech Pack in Windows/OS settings, rather than emitting distorted gibberish.
  - Natural English voice prioritization: Filter and prioritize `Natural`, `Google`, or `Online` voices over robotic legacy synthesizers.
  - Explicitly bind `utterance.voice = matchedVoice` and `utterance.lang = matchedVoice.lang`.

## 6. How It Was Found
- **Debug Mantra Cascade:**
  - *Mantra 1 (Reproducibility):* Inspected runtime `window.speechSynthesis.getVoices()` in the browser environment. Reproduced that `utterance.voice` remained `undefined` and triggered unit test assertions.
  - *Mantra 2 (Fail Path):* Traced `useVoiceSpeech.ts:speak()` -> `new SpeechSynthesisUtterance()` -> missing `utterance.voice` assignment.
  - *Mantra 3 (Falsify Hypothesis):* Proved that setting `utterance.lang = 'th-TH'` alone is ignored by Chromium if no Thai `utterance.voice` is bound.
  - *Mantra 4 (Ledger):* Verified across 11 test cases in `useVoiceSpeech.test.ts`.

## 7. Why It Slipped Through
- Standard unit test mocks in Vitest had mocked `window.speechSynthesis.speak()` without asserting `utterance.voice` binding, and headless test environments do not have physical audio output to hear the phonetic dissonance.

## 8. Validation
- `src/hooks/useVoiceSpeech.test.ts`:
  - `assigns matching Thai voice to utterance.voice when Thai voice exists` (Passed)
  - `selects best natural English voice when speaking English text` (Passed)
  - `prevents sending Thai text to English voice engine when no Thai voice is installed` (Passed)
- Full test suite: 63/63 tests passing.
- Production build: `tsc && vite build` passed (0 errors).

## 9. Action Items / Follow-ups
- Added unit tests specifically enforcing `utterance.voice` binding for multilingual synthesizers.
