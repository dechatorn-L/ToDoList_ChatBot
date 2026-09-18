import { useState, useEffect } from 'react';
import { Task, Priority } from '../types/task';

export type { Task, Priority };

const STORAGE_KEY = 'todolist_tasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Ignore write errors (e.g. storage full)
    }
  }, [tasks]);

  const addTask = (title: string, priority: Priority = 'medium', dueDate?: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: trimmed,
      completed: false,
      priority,
      dueDate,
      createdAt: Date.now(),
    };

    setTasks((prev) => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const editTask = (
    id: string,
    updates: Partial<Pick<Task, 'title' | 'priority' | 'dueDate'>>
  ) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((task) => !task.completed));
  };

  return {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    clearCompleted,
  };
}
