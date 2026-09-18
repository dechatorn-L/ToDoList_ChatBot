# Specification: Todolist Web App with Dynamic AI Avatar Companion

- **Status:** ready-for-agent
- **Target Platform:** Web (React + TypeScript + Vite + Tailwind CSS v4)
- **Primary Seams:** `TaskEngine` (State/Storage), `AIAgentDispatcher` (Tool-Calling), `AvatarEngine` (Dynamic Emotions & Character Selection), `VoiceSpeechEngine` (STT & TTS)

---

## Problem Statement

Users frequently struggle with tracking tasks, prioritizing urgent responsibilities, and staying motivated to complete daily to-dos. Traditional task managers are static, dry, and require tedious manual entry for every action, turning productivity into an uninspiring chore. Furthermore, users lack a lightweight, privacy-focused productivity companion that can organize their workload through conversational natural language and voice interaction without requiring heavy server infrastructure or accounts.

---

## Solution

A responsive, client-side web application combining a modern task dashboard with an interactive, customizable AI Avatar Companion.
1. **Core Task System:** Full CRUD, priority tiers (High, Medium, Low), due date tracking with overdue flags, active/completed filters, and local persistence via `localStorage`.
2. **Customizable Living Avatar Companion:** A floating, animated mascot that lives in the corner of the app with multiple character personas (Robot, Orange Cat, Shiba Dog). It exhibits living idle behaviors (sleeping, lounging) when inactive, and reacts dynamically to user progress (celebrating on completion, alerting on overdue).
3. **Conversational Task Automation & Tool Dispatching:** A chat drawer powered by multi-provider AI (Google Gemini or OpenAI) using client-side API keys. The AI answers productivity queries and executes real task operations (creating, completing, prioritizing, or deleting tasks) via structured function calling with task snapshot injection.
4. **Voice Interaction (Speech-to-Text & Text-to-Speech):** Native browser Web Speech API integration allowing users to dictate commands via microphone in Thai or English, while the assistant reads responses aloud with full mute/unmute control.

---

## User Stories

1. As a user, I want to create a task with a title, priority level, and due date so that I can capture my obligations quickly.
2. As a user, I want to toggle a task between completed and active so that I can maintain an accurate view of my progress.
3. As a user, I want to edit a task's title, priority, or due date inline so that I can update details as plans evolve.
4. As a user, I want to delete a task so that invalid or obsolete items can be permanently removed.
5. As a user, I want to filter my task list by All, Active, and Completed so that I can focus on what is immediately relevant.
6. As a user, I want to see an active task counter so that I know exactly how many items require my attention.
7. As a user, I want distinct color coding for High, Medium, and Low priorities so that I can visually triage urgent tasks.
8. As a user, I want tasks with past due dates to display a prominent "Overdue" status badge so that I notice delayed items immediately.
9. As a user, I want a "Clear Completed" button so that I can purge all finished tasks in a single click.
10. As a user, I want all task data to automatically persist to browser `localStorage` so that my data survives page reloads and browser restarts without a backend account.
11. As a user, I want a floating avatar icon in the bottom-right corner so that my AI assistant is easily accessible without encroaching on task list space.
12. As a user, I want the avatar to show lively idle animations (sleeping, lounging) when I am not interacting with it so that the application feels alive.
13. As a user, I want the avatar to react emotionally to my board (celebrating when I complete a task, looking alarmed when items are overdue) so that completing tasks feels rewarding.
14. As a user, I want to click the avatar to open a chat drawer so that I can interact with the assistant seamlessly.
15. As a user, I want a Settings modal where I can select my AI provider (Google Gemini or OpenAI) and paste my API key so that my credentials stay private in my browser.
16. As a user, I want to type natural language commands (e.g., "Add a high priority task to review PR tomorrow") so that the bot automatically creates the task with proper fields.
17. As a user, I want to tell the bot to complete or delete tasks in conversation (e.g., "Mark task 1 as done" or "Clear completed tasks") so that I can manage my board hands-free.
18. As a user, I want the bot to answer coaching questions (e.g., "What should I focus on first?") so that I receive intelligent planning guidance based on my current list.
19. As a user, I want the bot to display a thinking animation while awaiting API responses so that I know my command is processing.
20. As a user, I want clear, friendly error messages if my API key is invalid, missing, or rate-limited so that I can rectify the issue easily.
21. As a user, I want keyboard support (`Enter` to submit tasks, `Esc` to close modals/drawers) so that I can operate the app efficiently without relying solely on mouse clicks.
22. As a user, I want to choose my avatar companion character between **Robot**, **Orange Cat**, and **Shiba Dog** so that the mascot fits my personal preference.
23. As a user, I want every chosen character persona to express all 7 emotional states (`neutral`, `idle_lounge`, `idle_sleep`, `celebrating`, `alert_overdue`, `thinking`, `talking`) with distinct SVG facial expressions and body features.
24. As a user, I want to switch my avatar character from both the **Settings Modal** and a quick switcher in the **Chat Drawer header** so that I can change companions effortlessly.
25. As a user, I want to click a microphone button in the chat drawer to dictate task commands in Thai or English so that I can manage my to-do list completely hands-free.
26. As a user, I want the AI assistant to synthesize speech and read out its responses aloud so that I can listen to feedback without staring at the screen.
27. As a user, I want a clear Mute/Unmute audio toggle in the chat drawer header and settings so that I can mute spoken audio instantly in quiet environments.
28. As a user, I want my character selection and voice preferences to persist in `localStorage` so that they remain active on future visits.

---

## Implementation Decisions

### 1. Module Structure
- **Task Engine (`useTasks` Hook / Store):** Single source of truth for task state, filtering, stats calculation, and `localStorage` synchronization.
- **AI Agent Dispatcher (`aiDispatcher`):** Unified client adapter wrapping Google Gemini API and OpenAI API REST endpoints. Injects dynamic task snapshots into system prompts and handles structured tool calling.
- **Avatar Emotion Controller (`useAvatarState`):** Computes avatar emotion based on idle timers, API pending state, and task events.
- **Avatar Character Engine (`AvatarWidget` & SVGs):** Multi-character renderer supporting Robot, Orange Cat, and Shiba Dog SVGs with reactive facial poses.
- **Voice Speech Engine (`useVoiceSpeech` / Web Speech APIs):**
  - **Speech-to-Text (STT):** Utilizes browser-native `webkitSpeechRecognition` / `SpeechRecognition` with language switching (`th-TH` default, `en-US`).
  - **Text-to-Speech (TTS):** Utilizes browser-native `window.speechSynthesis` with speech rate/pitch tuning and instant cancellation upon mute or drawer close.
- **UI Presentation Layer (Components):**
  - `Header`: Title, active stats summary, and Settings button.
  - `TaskInput`: Quick-add bar with priority select and date picker.
  - `TaskList` & `TaskItem`: Render tasks with status toggles, inline edit, priority pills, and overdue badges.
  - `TaskFilterBar`: Tabbed filtering (All / Active / Completed) and Clear Completed action.
  - `AvatarWidget`: Floating interactive avatar with character switcher and animated SVG faces/poses.
  - `ChatDrawer`: Conversational message thread with microphone voice dictation button, speaker audio toggle, and character switcher.
  - `SettingsModal`: Provider selection, API key inputs, character persona gallery, and voice speech preferences.

### 2. Domain Data Shapes

```typescript
type Priority = 'low' | 'medium' | 'high';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string; // YYYY-MM-DD
  createdAt: number;
}

type AvatarMood =
  | 'neutral'
  | 'idle_lounge'
  | 'idle_sleep'
  | 'celebrating'
  | 'alert_overdue'
  | 'thinking'
  | 'talking';

type AvatarCharacter = 'robot' | 'cat' | 'dog';

type AIProvider = 'gemini' | 'openai';

interface AISettings {
  provider: AIProvider;
  geminiKey?: string;
  geminiModel?: string; // default: gemini-2.0-flash
  openaiKey?: string;
  openaiModel?: string; // default: gpt-4o-mini
  character: AvatarCharacter; // default: 'robot'
  voiceEnabled: boolean; // default: true
  voiceLanguage: 'th-TH' | 'en-US'; // default: 'th-TH'
}
```

### 3. AI Tool-Calling & Context Contracts
- **System Prompt Task Snapshot:** Every request includes an up-to-date JSON snapshot of active tasks (`[{ id, title, completed, priority, dueDate }]`) in the system instruction.
- **Unified Tool Dispatching:** Both Gemini and OpenAI tools map to these four deterministic dispatch functions:
  - `create_task({ title: string, priority?: Priority, dueDate?: string })`
  - `update_task({ id: string, title?: string, priority?: Priority, dueDate?: string, completed?: boolean })`
  - `delete_task({ id: string })`
  - `clear_completed_tasks()`

### 4. Technical Constraints & Rules
- **Native Platform First (Zero Extra Dependencies):**
  - AI client uses native browser `fetch` (no `@google/genai` or `openai` SDKs).
  - Voice STT uses native browser `SpeechRecognition` / `webkitSpeechRecognition`.
  - Voice TTS uses native browser `window.speechSynthesis`.
- **Overdue Rule:** A task is overdue if `dueDate` exists, `!completed`, and `dueDate < new Date().toLocaleDateString('en-CA')`.
- **LocalStorage Keys:**
  - Tasks: `todolist_tasks`
  - Settings (AI, Character, Voice): `todolist_ai_settings`

---

## Testing Decisions

### Seam 1: Task State & LocalStorage Seam (`useTasks`)
- Tests public behavior through actions (`addTask`, `toggleTask`, `deleteTask`, `editTask`, `clearCompleted`) and verifies state mutations, overdue calculation, and `localStorage` writes.

### Seam 2: AI Action Tool Dispatcher Seam (`aiDispatcher`)
- Verifies tool-call payloads generated by LLMs invoke the correct task state actions and that task snapshots are injected into prompt payloads.

### Seam 3: Avatar Emotional State Transitions Seam (`useAvatarState`)
- Verifies emotional transitions (idle lounge at 30s, sleep at 60s, celebration on completion, alert overdue with 10s decay).

### Seam 4: Avatar Multi-Character Persona Seam (`AvatarWidget`)
- Verifies that `AvatarWidget` correctly renders character-specific SVG anatomy (Robot antenna/screen, Cat ears/whiskers, Dog ears/snout) across all 7 emotional states.

### Seam 5: Voice Speech Engine Seam (`useVoiceSpeech` / Web Speech APIs)
- Verifies microphone recording state transitions, transcript callback delivery, speech synthesis execution, and mute toggle respect without errors in unsupported or mocked test environments.

---

## Out of Scope

- Multi-device cloud sync or database backends (Firebase, Supabase, PostgreSQL).
- User authentication (OAuth, email/password login).
- External paid third-party voice APIs (ElevenLabs, Google Cloud Text-to-Speech API). Uses browser-native Web Speech API exclusively.
- Sub-tasks or hierarchical task nesting.

---

## Further Notes

- Strict adherence to `design-system/todolist-ai/MASTER.md` (Teal primary, Warm Orange CTA, Plus Jakarta Sans, pure inline SVGs, zero emojis as icons).
- Touch target sizes minimum 44×44px for microphone, speaker, and avatar switcher controls.
