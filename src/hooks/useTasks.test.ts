import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useTasks } from './useTasks';

describe('useTasks Hook (Seam 1: Task State & LocalStorage)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with empty array when localStorage is empty', () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.tasks).toEqual([]);
  });

  it('initializes with tasks stored in localStorage', () => {
    const initialTasks = [
      {
        id: 'task-1',
        title: 'Existing task',
        completed: false,
        priority: 'medium' as const,
        createdAt: 1000,
      },
    ];
    localStorage.setItem('todolist_tasks', JSON.stringify(initialTasks));

    const { result } = renderHook(() => useTasks());
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('Existing task');
  });

  it('adds a new task with default medium priority and updates localStorage', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask('Buy groceries');
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('Buy groceries');
    expect(result.current.tasks[0].completed).toBe(false);
    expect(result.current.tasks[0].priority).toBe('medium');

    const stored = JSON.parse(localStorage.getItem('todolist_tasks') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe('Buy groceries');
  });

  it('toggles task completion status', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask('Write tests');
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.toggleTask(taskId);
    });

    expect(result.current.tasks[0].completed).toBe(true);

    act(() => {
      result.current.toggleTask(taskId);
    });

    expect(result.current.tasks[0].completed).toBe(false);
  });

  it('deletes a task by id', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask('Task to delete');
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.deleteTask(taskId);
    });

    expect(result.current.tasks).toHaveLength(0);
  });

  it('clears all completed tasks', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask('Task 1');
      result.current.addTask('Task 2');
    });

    const task1 = result.current.tasks.find((t) => t.title === 'Task 1')!;

    act(() => {
      result.current.toggleTask(task1.id);
    });

    act(() => {
      result.current.clearCompleted();
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('Task 2');
  });

  it('adds task with specific priority', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask('Critical bug', 'high');
      result.current.addTask('Nice to have', 'low');
    });

    const highTask = result.current.tasks.find((t) => t.title === 'Critical bug')!;
    const lowTask = result.current.tasks.find((t) => t.title === 'Nice to have')!;

    expect(highTask.priority).toBe('high');
    expect(lowTask.priority).toBe('low');
  });

  it('edits an existing task title and priority', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask('Original title', 'low');
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.editTask(taskId, { title: 'Updated title', priority: 'high' });
    });

    expect(result.current.tasks[0].title).toBe('Updated title');
    expect(result.current.tasks[0].priority).toBe('high');
  });

  it('supports setting and editing due dates', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask('Tax deadline', 'high', '2026-04-15');
    });

    const task = result.current.tasks.find((t) => t.title === 'Tax deadline')!;
    expect(task.dueDate).toBe('2026-04-15');

    act(() => {
      result.current.editTask(task.id, { dueDate: '2026-04-30' });
    });

    const updatedTask = result.current.tasks.find((t) => t.title === 'Tax deadline')!;
    expect(updatedTask.dueDate).toBe('2026-04-30');
  });
});

