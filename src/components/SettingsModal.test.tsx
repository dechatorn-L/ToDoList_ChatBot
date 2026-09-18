import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsModal } from './SettingsModal';

describe('SettingsModal', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<SettingsModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders modal with providers and fields when isOpen is true', () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText('AI Settings')).toBeDefined();
    expect(screen.getByRole('button', { name: /gemini/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /openai/i })).toBeDefined();
  });

  it('toggles password visibility with eye button', () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText(/enter api key/i) as HTMLInputElement;
    expect(input.type).toBe('password');

    const toggleBtn = screen.getByRole('button', { name: /toggle key visibility/i });
    fireEvent.click(toggleBtn);
    expect(input.type).toBe('text');

    fireEvent.click(toggleBtn);
    expect(input.type).toBe('password');
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(<SettingsModal isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches provider and updates localStorage on save', async () => {
    const handleClose = vi.fn();
    render(<SettingsModal isOpen={true} onClose={handleClose} />);

    // Switch to OpenAI
    const openAiBtn = screen.getByRole('button', { name: /openai/i });
    fireEvent.click(openAiBtn);

    const input = screen.getByPlaceholderText(/enter api key/i);
    fireEvent.change(input, { target: { value: 'sk-my-test-key' } });

    const saveBtn = screen.getByRole('button', { name: /save settings/i });
    fireEvent.click(saveBtn);

    const stored = JSON.parse(localStorage.getItem('todolist_ai_settings') || '{}');
    expect(stored.provider).toBe('openai');
    expect(stored.openaiKey).toBe('sk-my-test-key');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('shows error banner when test connection fails without key', async () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);

    const testBtn = screen.getByRole('button', { name: /test connection/i });
    fireEvent.click(testBtn);

    await waitFor(() => {
      expect(screen.getByText(/api key is required/i)).toBeDefined();
    });
  });
});
