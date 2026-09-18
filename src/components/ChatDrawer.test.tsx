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

  let mockRecognitionInstance: any;
  let mockSpeechSynthesis: any;

  beforeEach(() => {
    vi.restoreAllMocks();

    mockRecognitionInstance = {
      continuous: false,
      interimResults: false,
      lang: '',
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
      onstart: null,
      onresult: null,
      onerror: null,
      onend: null,
    };

    const MockRecognitionConstructor = vi.fn().mockImplementation(() => mockRecognitionInstance);
    (window as any).SpeechRecognition = MockRecognitionConstructor;
    (window as any).webkitSpeechRecognition = MockRecognitionConstructor;

    mockSpeechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      speaking: false,
      paused: false,
      getVoices: vi.fn().mockReturnValue([]),
    };

    Object.defineProperty(window, 'speechSynthesis', {
      value: mockSpeechSynthesis,
      writable: true,
      configurable: true,
    });

    (window as any).SpeechSynthesisUtterance = vi.fn().mockImplementation((text: string) => ({
      text,
      lang: '',
    }));
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

  it('triggers onCharacterChange when clicking character switcher pills', () => {
    const handleCharacterChange = vi.fn();
    const { rerender } = render(
      <ChatDrawer
        isOpen={true}
        onClose={vi.fn()}
        tasks={mockTasks}
        settings={{ ...mockSettings, character: 'robot' }}
        handlers={mockHandlers}
        onOpenSettings={vi.fn()}
        onCharacterChange={handleCharacterChange}
      />
    );

    expect(screen.getByText('AI Task Assistant')).toBeDefined();

    const catBtn = screen.getByRole('button', { name: 'Cat' });
    fireEvent.click(catBtn);
    expect(handleCharacterChange).toHaveBeenCalledWith('cat');

    rerender(
      <ChatDrawer
        isOpen={true}
        onClose={vi.fn()}
        tasks={mockTasks}
        settings={{ ...mockSettings, character: 'cat' }}
        handlers={mockHandlers}
        onOpenSettings={vi.fn()}
        onCharacterChange={handleCharacterChange}
      />
    );
    expect(screen.getByText('Milo the Cat')).toBeDefined();

    const dogBtn = screen.getByRole('button', { name: 'Dog' });
    fireEvent.click(dogBtn);
    expect(handleCharacterChange).toHaveBeenCalledWith('dog');
  });

  it('renders microphone button and speaker toggle button in ChatDrawer', () => {
    render(
      <ChatDrawer
        isOpen={true}
        onClose={vi.fn()}
        tasks={mockTasks}
        settings={{ ...mockSettings, voiceMuted: false }}
        handlers={mockHandlers}
        onOpenSettings={vi.fn()}
      />
    );

    const micBtn = screen.getByRole('button', { name: /start voice input/i });
    const speakerBtn = screen.getByRole('button', { name: /mute voice audio/i });
    expect(micBtn).toBeDefined();
    expect(speakerBtn).toBeDefined();
  });

  it('triggers onVoiceMuteToggle when clicking speaker button', () => {
    const handleVoiceMuteToggle = vi.fn();
    render(
      <ChatDrawer
        isOpen={true}
        onClose={vi.fn()}
        tasks={mockTasks}
        settings={{ ...mockSettings, voiceMuted: false }}
        handlers={mockHandlers}
        onOpenSettings={vi.fn()}
        onVoiceMuteToggle={handleVoiceMuteToggle}
      />
    );

    const speakerBtn = screen.getByRole('button', { name: /mute voice audio/i });
    fireEvent.click(speakerBtn);
    expect(handleVoiceMuteToggle).toHaveBeenCalledWith(true);
  });

  it('triggers speech recognition start when clicking microphone button', () => {
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

    const micBtn = screen.getByRole('button', { name: /start voice input/i });
    fireEvent.click(micBtn);
    expect(mockRecognitionInstance.start).toHaveBeenCalledTimes(1);
  });

  it('synthesizes speech when assistant responds and cancels on drawer close', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: 'Here is your answer!' }],
            },
          },
        ],
      }),
    } as Response);

    const handleClose = vi.fn();
    const { rerender } = render(
      <ChatDrawer
        isOpen={true}
        onClose={handleClose}
        tasks={mockTasks}
        settings={{ ...mockSettings, voiceMuted: false, speechLanguage: 'th-TH' }}
        handlers={mockHandlers}
        onOpenSettings={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/ask me to add, complete/i);
    fireEvent.change(input, { target: { value: 'Hello' } });

    const sendBtn = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText('Here is your answer!')).toBeDefined();
    });

    expect(mockSpeechSynthesis.speak).toHaveBeenCalled();

    // Rerender as closed
    rerender(
      <ChatDrawer
        isOpen={false}
        onClose={handleClose}
        tasks={mockTasks}
        settings={{ ...mockSettings, voiceMuted: false }}
        handlers={mockHandlers}
        onOpenSettings={vi.fn()}
      />
    );

    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
  });
});
