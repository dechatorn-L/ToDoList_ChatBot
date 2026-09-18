import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatDrawer } from './ChatDrawer';
import { Task } from '../hooks/useTasks';
import { AISettings } from '../utils/aiSettings';

describe('ChatDrawer', () => {
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Review PR',
      completed: false,
      priority: 'high',
      createdAt: 1000,
    },
  ];

  const mockSettings: AISettings = {
    provider: 'gemini',
    geminiKey: 'valid-key',
    geminiModel: 'gemini-2.0-flash',
  };

  const mockHandlers = {
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    clearCompleted: vi.fn(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <ChatDrawer
        isOpen={false}
        onClose={vi.fn()}
        tasks={mockTasks}
        settings={mockSettings}
        handlers={mockHandlers}
        onOpenSettings={vi.fn()}
      />
    );
    expect(screen.queryByText(/AI Task Assistant/i)).toBeNull();
  });

  it('renders drawer header and greeting when isOpen is true', () => {
    render(
      <ChatDrawer
        isOpen={true}
        onClose={vi.fn()}
        tasks={mockTasks}
        settings={mockSettings}
        handlers={mockHandlers}
        onOpenSettings={vi.fn()}
      />
    );
    expect(screen.getByText('AI Task Assistant')).toBeDefined();
    expect(screen.getByText(/I'm your AI task assistant/i)).toBeDefined();
  });

  it('shows missing key prompt when key is empty and directs to settings', () => {
    const handleOpenSettings = vi.fn();
    render(
      <ChatDrawer
        isOpen={true}
        onClose={vi.fn()}
        tasks={mockTasks}
        settings={{ provider: 'gemini', geminiKey: '' }}
        handlers={mockHandlers}
        onOpenSettings={handleOpenSettings}
      />
    );

    expect(screen.getByText(/API Key Required/i)).toBeDefined();
    const configBtn = screen.getByRole('button', { name: /configure in settings/i });
    fireEvent.click(configBtn);
    expect(handleOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('sends message and renders reply with action badges', async () => {
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
                    args: { title: 'Write tests', priority: 'medium' },
                  },
                },
                { text: 'Task created for you!' },
              ],
            },
          },
        ],
      }),
    } as Response);

    render(
      <ChatDrawer
        isOpen={true}
        onClose={vi.fn()}
        tasks={mockTasks}
        settings={mockSettings}
        handlers={mockHandlers}
        onOpenSettings={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/ask me to add, complete/i);
    fireEvent.change(input, { target: { value: 'Add write tests task' } });

    const sendBtn = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText('Task created for you!')).toBeDefined();
      expect(screen.getByText(/Created task: Write tests/i)).toBeDefined();
    });
    expect(mockHandlers.createTask).toHaveBeenCalledWith('Write tests', 'medium', undefined);
  });

  it('closes drawer on Escape key', () => {
    const handleClose = vi.fn();
    render(
      <ChatDrawer
        isOpen={true}
        onClose={handleClose}
        tasks={mockTasks}
        settings={mockSettings}
        handlers={mockHandlers}
        onOpenSettings={vi.fn()}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
