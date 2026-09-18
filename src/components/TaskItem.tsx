import React, { useState } from 'react';
import { Task, Priority } from '../types/task';
import { isOverdue, formatDueDate } from '../utils/date';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Pick<Task, 'title' | 'priority' | 'dueDate'>>) => void;
}

const priorityBadges: Record<Priority, { label: string; className: string }> = {
  low: {
    label: 'Low',
    className: 'bg-teal-50 text-teal-700 border-teal-200/80 hover:bg-teal-100',
  },
  medium: {
    label: 'Med',
    className: 'bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100',
  },
  high: {
    label: 'High',
    className: 'bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100',
  },
};

const nextPriority: Record<Priority, Priority> = {
  low: 'medium',
  medium: 'high',
  high: 'low',
};

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const overdue = isOverdue(task.dueDate, task.completed);

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== task.title) {
      onEdit(task.id, { title: editedTitle.trim() });
    } else {
      setEditedTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditedTitle(task.title);
      setIsEditing(false);
    }
  };

  const handleCyclePriority = () => {
    onEdit(task.id, { priority: nextPriority[task.priority] });
  };

  return (
    <div
      className={`group flex items-center justify-between rounded-lg border bg-white p-3 shadow-sm transition-all hover:border-zinc-300 ${
        overdue ? 'border-rose-300/80 bg-rose-50/20' : 'border-zinc-200/80'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer ${
            task.completed
              ? 'border-teal-600 bg-teal-600 text-white'
              : 'border-zinc-300 bg-white hover:border-teal-600'
          }`}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed && (
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="3"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          )}
        </button>

        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 rounded border border-teal-500 bg-teal-50/20 px-2 py-0.5 text-sm text-zinc-900 focus:outline-none"
          />
        ) : (
          <span
            onDoubleClick={() => setIsEditing(true)}
            className={`text-sm truncate cursor-text transition-colors select-none ${
              task.completed ? 'text-zinc-400 line-through' : 'text-zinc-800'
            }`}
            title="Double-click to edit"
          >
            {task.title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-3">
        {/* Overdue alert badge */}
        {overdue && (
          <span className="inline-flex items-center gap-1 rounded bg-rose-100 border border-rose-300 px-1.5 py-0.5 text-[10px] font-bold text-rose-800 animate-pulse">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            Overdue
          </span>
        )}

        {/* Due date badge */}
        {task.dueDate && (
          <span
            className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-mono ${
              overdue
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-zinc-50 text-zinc-600 border-zinc-200'
            }`}
          >
            <svg className="h-3 w-3 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v7.5" />
            </svg>
            {formatDueDate(task.dueDate)}
          </span>
        )}

        {/* Priority badge */}
        <button
          type="button"
          onClick={handleCyclePriority}
          title="Click to cycle priority (Low -> Med -> High)"
          className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold transition-colors cursor-pointer ${
            priorityBadges[task.priority].className
          }`}
        >
          {priorityBadges[task.priority].label}
        </button>

        {/* Delete button */}
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-rose-600 p-1 rounded transition-opacity cursor-pointer"
          aria-label="Delete task"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
};
