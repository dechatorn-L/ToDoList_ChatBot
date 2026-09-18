import React, { useState } from 'react';
import { useTasks } from './hooks/useTasks';
import { Header } from './components/Header';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import { TaskFilterBar, TaskFilter } from './components/TaskFilterBar';
import { AvatarWidget } from './components/AvatarWidget';
import { SettingsModal } from './components/SettingsModal';
import { ChatDrawer } from './components/ChatDrawer';
import { useAvatarState } from './hooks/useAvatarState';
import { isOverdue } from './utils/date';
import { loadSettings, saveSettings, AISettings, AvatarCharacter } from './utils/aiSettings';
import { ToolActionHandler } from './utils/aiDispatcher';

export const App: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask, editTask, clearCompleted } = useTasks();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [aiSettings, setAiSettings] = useState<AISettings>(loadSettings);

  const hasOverdue = tasks.some((t) => isOverdue(t.dueDate, t.completed));
  const { mood, triggerCelebration, wakeUp } = useAvatarState({
    hasOverdue,
    isChatOpen,
    isThinking,
  });

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  const handleToggle = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task && !task.completed) {
      triggerCelebration();
    }
    toggleTask(id);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
    setAiSettings(loadSettings());
  };

  const handleCharacterChange = (character: AvatarCharacter) => {
    const next = { ...aiSettings, character };
    setAiSettings(next);
    saveSettings(next);
  };

  const toolHandlers: ToolActionHandler = {
    createTask: (title, priority, dueDate) => {
      addTask(title, priority, dueDate);
    },
    updateTask: (id, updates) => {
      if (updates.completed !== undefined) {
        const task = tasks.find((t) => t.id === id);
        if (task && task.completed !== updates.completed) {
          if (updates.completed) triggerCelebration();
          toggleTask(id);
        }
      }
      if (updates.title || updates.priority !== undefined || updates.dueDate !== undefined) {
        editTask(id, {
          title: updates.title,
          priority: updates.priority,
          dueDate: updates.dueDate,
        });
      }
    },
    deleteTask: (id) => {
      deleteTask(id);
    },
    clearCompleted: () => {
      clearCompleted();
    },
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/40 via-zinc-50 to-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-xl">
        <Header activeCount={activeCount} onOpenSettings={() => setIsSettingsOpen(true)} />
        <TaskInput onAddTask={addTask} />

        {tasks.length > 0 && (
          <TaskFilterBar
            currentFilter={filter}
            onFilterChange={setFilter}
            counts={{
              all: tasks.length,
              active: activeCount,
              completed: completedCount,
            }}
          />
        )}

        <TaskList
          tasks={filteredTasks}
          onToggle={handleToggle}
          onDelete={deleteTask}
          onEdit={editTask}
          onClearCompleted={clearCompleted}
        />
      </main>

      <AvatarWidget
        mood={mood}
        character={aiSettings.character}
        onWakeUp={wakeUp}
        onClick={() => setIsChatOpen((prev) => !prev)}
      />

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        tasks={tasks}
        settings={aiSettings}
        handlers={toolHandlers}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLoadingChange={setIsThinking}
        onCharacterChange={handleCharacterChange}
      />

      <SettingsModal isOpen={isSettingsOpen} onClose={handleCloseSettings} />
    </div>
  );
};

export default App;
