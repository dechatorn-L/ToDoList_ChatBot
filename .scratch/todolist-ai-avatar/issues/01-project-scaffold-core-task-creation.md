# 01: Project Scaffold & Core Task Creation (Tracer Bullet)

**What to build:**
A running React application powered by Vite, TypeScript, Tailwind CSS v4, and Vitest. Users see a clean task management header and an input field where typing a task title and pressing Enter immediately adds the task to the screen and persists it in browser `localStorage`. A test confirms the state updates and saves correctly.

**Blocked by:**
None (can start immediately)

**Status:** ready-for-agent

- [x] Project initialized with Vite + React + TypeScript + Tailwind CSS v4 + Vitest setup.
- [x] User can type a new task title into the input bar and submit via Enter or click Add.
- [x] Added tasks render immediately in a visible task list with an active checkbox and title.
- [x] Task state and storage logic cleanly encapsulated in an exported, testable custom hook (`useTasks`).
- [x] Tasks automatically persist to and rehydrate from browser `localStorage`.
- [x] Automated Vitest suite passes for the task state management seam.
