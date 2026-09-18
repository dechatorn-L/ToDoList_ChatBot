# 06: Conversational Agent & Tool-Calling Dispatcher

**What to build:**
Clicking the mascot avatar opens a chat drawer. Users can type natural language instructions to manage tasks (e.g. "Add high-priority task to submit report by Friday", "Complete the groceries task", "What tasks are overdue?"). The system includes an active task snapshot in the prompt and uses structured function calling to automatically mutate board state and reply conversationally.

**Blocked by:**
04: Floating Mascot with Dynamic Idle & Reactive Emotions
05: Settings Modal & Multi-Provider AI Credential Store

**Status:** completed

- [x] Clicking the avatar toggles the Chat Drawer open/closed with smooth animation.
- [x] Chat interface displays conversational history with message bubbles and loading indicators.
- [x] If no API key is configured, chat drawer displays a friendly prompt with a button directing user to Settings.
- [x] Active task snapshot (`id`, `title`, `completed`, `priority`, `dueDate`) is dynamically injected into the system prompt.
- [x] AI client invokes structured tools (`create_task`, `update_task`, `delete_task`, `clear_completed_tasks`) and updates the board immediately.
- [x] Chat bubble shows confirmation badges for board mutations performed by the bot.
- [x] Mascot transitions to `thinking` while awaiting AI response and `talking` when emitting text.
- [x] Automated tests verify tool dispatching, snapshot injection, and conversational error handling.
