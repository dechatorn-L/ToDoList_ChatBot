import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  loadSettings,
  saveSettings,
  testConnection,
  DEFAULT_SETTINGS,
  AISettings,
} from './aiSettings';

describe('aiSettings', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('loads default settings when localStorage is empty', () => {
    const settings = loadSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it('loads and merges saved settings from localStorage', () => {
    const custom: AISettings = {
      provider: 'openai',
      openaiKey: 'sk-test-123',
      openaiModel: 'gpt-4o',
      geminiKey: 'gm-test-456',
      geminiModel: 'gemini-2.0-flash',
      character: 'cat',
    };
    localStorage.setItem('todolist_ai_settings', JSON.stringify(custom));

    const loaded = loadSettings();
    expect(loaded.provider).toBe('openai');
    expect(loaded.openaiKey).toBe('sk-test-123');
    expect(loaded.openaiModel).toBe('gpt-4o');
    expect(loaded.geminiKey).toBe('gm-test-456');
    expect(loaded.character).toBe('cat');
  });

  it('defaults character to robot if missing in storage', () => {
    localStorage.setItem('todolist_ai_settings', JSON.stringify({ provider: 'gemini' }));
    const loaded = loadSettings();
    expect(loaded.character).toBe('robot');
  });

  it('saves settings to localStorage under todolist_ai_settings', () => {
    const toSave: AISettings = {
      provider: 'gemini',
      geminiKey: 'gm-key-abc',
      geminiModel: 'gemini-2.0-flash',
    };
    saveSettings(toSave);

    const stored = JSON.parse(localStorage.getItem('todolist_ai_settings') || '{}');
    expect(stored.geminiKey).toBe('gm-key-abc');
  });

  it('returns failure when testConnection is called with missing key', async () => {
    const result = await testConnection({
      provider: 'gemini',
      geminiKey: '',
    });
    expect(result.success).toBe(false);
    expect(result.message).toContain('API key is required');
  });

  it('verifies connection successfully when endpoint returns 200', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ name: 'models/gemini-2.0-flash' }),
    } as Response);

    const result = await testConnection({
      provider: 'gemini',
      geminiKey: 'valid-gemini-key',
      geminiModel: 'gemini-2.0-flash',
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('Connected successfully');
  });

  it('reports descriptive error message when API responds with error status', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        error: { message: 'Incorrect API key provided' },
      }),
    } as Response);

    const result = await testConnection({
      provider: 'openai',
      openaiKey: 'invalid-key',
      openaiModel: 'gpt-4o-mini',
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Incorrect API key provided');
  });
});
