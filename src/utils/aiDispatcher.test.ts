import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildSystemPrompt,
  executeToolCall,
  sendChatMessage,
  ChatMessage,
  ToolActionHandler,
} from './aiDispatcher';
import { Task } from '../hooks/useTasks';
import { AISettings } from './aiSettings';

describe('aiDispatcher', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Buy groceries',
      completed: false,
      priority: 'high',
      dueDate: '2026-09-20',
      createdAt: 1000,
    },
    {
      id: 'task-2',
      title: 'Workout',
      completed: true,
      priority: 'medium',
      createdAt: 2000,
    },
  ];

  it('builds system prompt with date and task snapshot', () => {
    const prompt = buildSystemPrompt(mockTasks);
    expect(prompt).toContain('Buy groceries');
    expect(prompt).toContain('task-1');
    expect(prompt).toContain('task-2');
    expect(prompt).toContain('Active Tasks Snapshot');
  });

  it('executes create_task tool correctly', () => {
    const handlers: ToolActionHandler = {
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      clearCompleted: vi.fn(),
    };

    const res = executeToolCall(
      'create_task',
      { title: 'Read book', priority: 'medium', dueDate: '2026-09-25' },
      handlers
    );

    expect(handlers.createTask).toHaveBeenCalledWith(
      'Read book',
      'medium',
      '2026-09-25'
    );
    expect(res.summary).toContain('Created task: Read book');
  });

  it('executes update_task tool correctly', () => {
    const handlers: ToolActionHandler = {
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      clearCompleted: vi.fn(),
    };

    const res = executeToolCall(
      'update_task',
      { id: 'task-1', completed: true },
      handlers
    );

    expect(handlers.updateTask).toHaveBeenCalledWith('task-1', {
      completed: true,
    });
    expect(res.summary).toContain('Updated task: task-1');
  });

  it('executes delete_task and clear_completed_tasks tools', () => {
    const handlers: ToolActionHandler = {
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      clearCompleted: vi.fn(),
    };

    executeToolCall('delete_task', { id: 'task-1' }, handlers);
    expect(handlers.deleteTask).toHaveBeenCalledWith('task-1');

    executeToolCall('clear_completed_tasks', {}, handlers);
    expect(handlers.clearCompleted).toHaveBeenCalled();
  });

  it('handles Gemini response with function calling', async () => {
    const handlers: ToolActionHandler = {
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      clearCompleted: vi.fn(),
    };

    const settings: AISettings = {
      provider: 'gemini',
      geminiKey: 'valid-gemini-key',
      geminiModel: 'gemini-2.0-flash',
    };

    const messages: ChatMessage[] = [{ role: 'user', content: 'Add a task to call mom' }];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  functionCall: {
                    name: 'create_task',
                    args: { title: 'Call mom', priority: 'high' },
                  },
                },
                {
                  text: 'I have added the task for you!',
                },
              ],
            },
          },
        ],
      }),
    } as Response);

    const result = await sendChatMessage(messages, mockTasks, settings, handlers);

    expect(handlers.createTask).toHaveBeenCalledWith('Call mom', 'high', undefined);
    expect(result.reply).toBe('I have added the task for you!');
    expect(result.performedActions).toHaveLength(1);
    expect(result.performedActions[0]).toContain('Created task: Call mom');
  });

  it('handles OpenAI response with tool_calls', async () => {
    const handlers: ToolActionHandler = {
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      clearCompleted: vi.fn(),
    };

    const settings: AISettings = {
      provider: 'openai',
      openaiKey: 'valid-openai-key',
      openaiModel: 'gpt-4o-mini',
    };

    const messages: ChatMessage[] = [{ role: 'user', content: 'Clear all completed tasks' }];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: 'All done! Completed tasks are cleared.',
              tool_calls: [
                {
                  id: 'call_123',
                  type: 'function',
                  function: {
                    name: 'clear_completed_tasks',
                    arguments: '{}',
                  },
                },
              ],
            },
          },
        ],
      }),
    } as Response);

    const result = await sendChatMessage(messages, mockTasks, settings, handlers);

    expect(handlers.clearCompleted).toHaveBeenCalledTimes(1);
    expect(result.reply).toBe('All done! Completed tasks are cleared.');
    expect(result.performedActions).toContain('Cleared completed tasks');
  });

  it('returns helpful error when API key is missing', async () => {
    const handlers: ToolActionHandler = {
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      clearCompleted: vi.fn(),
    };

    const settings: AISettings = {
      provider: 'gemini',
      geminiKey: '',
    };

    const result = await sendChatMessage(
      [{ role: 'user', content: 'hello' }],
      mockTasks,
      settings,
      handlers
    );

    expect(result.reply).toContain('API key is missing');
    expect(result.performedActions).toHaveLength(0);
  });
});
