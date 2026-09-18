import React, { useState } from 'react';
import { Priority } from '../types/task';

interface TaskInputProps {
  onAddTask: (title: string, priority: Priority, dueDate?: string) => void;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask(title.trim(), priority, dueDate || undefined);
    setTitle('');
    setPriority('medium');
    setDueDate('');
  };

  const priorityConfig: Record<Priority, { label: string; activeClass: string; inactiveClass: string }> = {
    low: {
      label: 'Low',
      activeClass: 'bg-teal-100 text-teal-800 border-teal-300 font-semibold',
      inactiveClass: 'text-zinc-500 hover:text-zinc-700 border-transparent',
    },
    medium: {
      label: 'Med',
      activeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
      inactiveClass: 'text-zinc-500 hover:text-zinc-700 border-transparent',
    },
    high: {
      label: 'High',
      activeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold',
      inactiveClass: 'text-zinc-500 hover:text-zinc-700 border-transparent',
    },
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-xl border border-zinc-200 bg-white p-2 shadow-sm focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/15 transition-all"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done? Press Enter..."
          className="flex-1 bg-transparent px-3 py-2 text-base sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
        />

        <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-zinc-200 pt-2 sm:pt-0 sm:pl-2 shrink-0">
          {/* Priority selector */}
          <div className="flex items-center gap-1">
            {(['low', 'medium', 'high'] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`rounded-md border px-2 py-1 text-xs transition-all cursor-pointer ${
                  priority === p ? priorityConfig[p].activeClass : priorityConfig[p].inactiveClass
                }`}
              >
                {priorityConfig[p].label}
              </button>
            ))}
          </div>

          {/* Due date picker */}
          <div className="relative flex items-center">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              aria-label="Due date"
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700 focus:border-teal-500 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Add button */}
          <button
            type="submit"
            disabled={!title.trim()}
            className="inline-flex items-center justify-center rounded-lg bg-[#EA580C] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#C2410C] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 cursor-pointer"
          >
            <svg
              className="mr-1 h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add
          </button>
        </div>
      </div>
    </form>
  );
};
