# Specification: Todolist Web App with Dynamic AI Avatar Companion

- **Status:** ready-for-agent
- **Target Platform:** Web (React + TypeScript + Vite + Tailwind CSS v4)
- **Primary Seams:** `TaskEngine` (State/Storage), `AIAgentDispatcher` (Tool-Calling), `AvatarEngine` (Dynamic Emotions)

---

## Problem Statement

Users frequently struggle with tracking tasks, prioritizing urgent responsibilities, and staying motivated to complete daily to-dos. Traditional task managers are static, dry, and require tedious manual entry for every action, turning productivity into an uninspiring chore. Furthermore, users lack a lightweight, privacy-focused productivity companion that can organize their workload through conversational natural language without requiring heavy server infrastructure or accounts.

---

## Solution

A responsive, client-side web application combining a modern task dashboard with an interactive AI Avatar Companion.
1. **Core Task System:** Full CRUD, priority tiers (High, Medium, Low), due date tracking with overdue flags, active/completed filters, and local persistence via `localStorage`.
2. **AI Avatar Companion:** A floating, animated mascot that lives in the corner of the app. It exhibits random idle behaviors (sleeping, lounging) when inactive, and reacts dynamically to user progress (celebrating when tasks are finished, showing urgency when tasks are overdue).
3. **Conversational Task Automation:** A chat drawer powered by multi-provider AI (Google Gemini or OpenAI) using the user's personal API key stored locally. The AI can answer productivity queries and execute real task operations (creating, completing, prioritizing, or deleting tasks) via structured function calling.

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
12. As a user, I want the avatar to show lively idle animations (sleeping, lounging, playing) when I am not interacting with it so that the application feels alive.
13. As a user, I want the avatar to react emotionally to my board (celebrating when I complete a task, looking alarmed/concerned when items are overdue) so that completing tasks feels rewarding.
14. As a user, I want to click the avatar to open a chat drawer so that I can interact with the assistant seamlessly.
15. As a user, I want a Settings modal where I can select my AI provider (Google Gemini or OpenAI) and paste my API key so that my credentials stay private in my browser.
16. As a user, I want to type natural language commands (e.g., "Add a high priority task to review PR tomorrow") so that the bot automatically creates the task with proper fields.
17. As a user, I want to tell the bot to complete or delete tasks in conversation (e.g., "Mark task 1 as done" or "Clear completed tasks") so that I can manage my board hands-free.
18. As a user, I want the bot to answer coaching questions (e.g., "What should I focus on first?") so that I receive intelligent planning guidance based on my current list.
19. As a user, I want the bot to display a thinking animation while awaiting API responses so that I know my command is processing.
20. As a user, I want clear, friendly error messages if my API key is invalid, missing, or rate-limited so that I can rectify the issue easily.
21. As a user, I want keyboard support (`Enter` to submit tasks, `Esc` to close modals/drawers) so that I can operate the app efficiently without relying solely on mouse clicks.

---

## Implementation Decisions

### 1. Module Structure
- **Task Engine (`useTasks` Hook / Store):** Single source of truth for task state, filtering, stats calculation, and `localStorage` synchronization.
- **AI Agent Dispatcher (`aiService`):** Unified client adapter wrapping Google Gemini API (`@google/genai` or direct REST) and OpenAI API (`chat/completions`). Uses structured tool calling to parse natural language into deterministic board actions.
- **Avatar Emotion Controller (`useAvatarState`):** Computes avatar state based on idle timers, API pending state, and task events (celebrations on completion, alert on overdue).
- **UI Presentation Layer (Components):**
  - `Header`: Title, active stats summary, and Settings button.
  - `TaskInput`: Quick-add bar with priority select and date picker.
  - `TaskList` & `TaskItem`: Render tasks with status toggles, inline edit, priority pills, and overdue badges.
  - `TaskFilterBar`: Tabbed filtering (All / Active / Completed) and Clear Completed action.
  - `AvatarWidget`: Floating interactive avatar with animated SVG faces/poses.
  - `ChatDrawer`: Conversational message thread with action confirmation pills.
  - `SettingsModal`: Provider selection (Gemini / OpenAI), API key inputs, and validation test button.

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

type AvatarMood = 'idle_sleep' | 'idle_lounge' | 'thinking' | 'talking' | 'celebrating' | 'alert_overdue';

type AIProvider = 'gemini' | 'openai';

interface AISettings {
  provider: AIProvider;
  geminiKey?: string;
  geminiModel?: string; // default: gemini-2.0-flash / gemini-1.5-flash
  openaiKey?: string;
  openaiModel?: string; // default: gpt-4o-mini
}
```

### 3. AI Tool-Calling & Context Contracts
- **System Prompt Task Snapshot (Mandatory):** Every request to Gemini/OpenAI includes an up-to-date JSON snapshot of active tasks (`[{ id, title, completed, priority, dueDate }]`) in the system instruction. This enables the LLM to accurately resolve phrases like "finish task 1" or "delete the shopping task" to exact task `id`s without hallucination.
- **Unified Tool Dispatching:** Both Gemini and OpenAI tools map to these four deterministic dispatch functions:
  - `create_task({ title: string, priority?: Priority, dueDate?: string })`
  - `update_task({ id: string, title?: string, priority?: Priority, dueDate?: string, completed?: boolean })`
  - `delete_task({ id: string })`
  - `clear_completed_tasks()`

### 4. Technical Constraints & Rules
- **Native Fetch (No Heavy SDKs):** AI client uses native `fetch` calling standard REST endpoints (`gemini-2.0-flash:generateContent` / OpenAI `v1/chat/completions`) directly. Zero heavy third-party SDK dependencies (keeps bundle small and avoids Node polyfill bugs).
- **Overdue Rule:** A task is overdue if `dueDate` exists, `!completed`, and `dueDate < new Date().toLocaleDateString('en-CA')` (local `YYYY-MM-DD`).
- **Avatar State & Alert Decay:** `alert_overdue` triggers when overdue tasks are detected or upon app launch, but auto-decays to `idle_lounge` after 10 seconds if untouched, ensuring the mascot's idle sleeping animations are not starved.
- **LocalStorage Security:** Keys stored strictly under `todolist_ai_settings` in browser `localStorage`. Keys are never transmitted to any third-party backend.

---

## Testing Decisions

### Seam 1: Task State & LocalStorage Seam (`useTasks`)
- **What makes a good test:** Tests public behavior through actions (`addTask`, `toggleTask`, `deleteTask`, `editTask`, `clearCompleted`) and verifies state mutations, overdue calculation, and `localStorage` writes. Does not inspect internal variables.
- **Modules tested:** Task store / hook.
- **Prior Art:** Standard React Testing Library hook testing with mocked `localStorage`.

### Seam 2: AI Action Tool Dispatcher Seam (`aiDispatcher`)
- **What makes a good test:** Verifies that raw tool-call payloads generated by LLMs accurately invoke the correct Task State actions without unintended side effects, and that task snapshots are injected into the prompt payload.
- **Modules tested:** AI tool execution handler.

### Seam 3: Avatar Emotional State Transitions Seam (`useAvatarState`)
- **What makes a good test:** Verifies state transitions:
  - Task completed → triggers `celebrating` mood (temporary 5s celebration, then returns to neutral/idle).
  - Overdue task present → triggers `alert_overdue` with a 10s decay timer back to idle.
  - Inactive timer threshold (30s) reached → drops to `idle_lounge`, then `idle_sleep` (60s).
  - Chat initiated → wakes up immediately to `talking` or `thinking`.

---

## Out of Scope

- Multi-device cloud sync or database backends (Firebase, Supabase, PostgreSQL).
- User authentication (OAuth, email/password login).
- System-level audio alarms or desktop OS notifications.
- Sub-tasks, hierarchical task nesting, or project kanban boards.
- Complex recurring schedules (e.g. repeat every 2 weeks on Thursdays).

---

## Further Notes

- High keyboard accessibility: `Enter` to submit, `Esc` to dismiss modals, visible focus outlines on all interactive controls.
- Touch target sizes minimum 44×44px for mobile devices.
