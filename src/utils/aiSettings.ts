export type AIProvider = 'gemini' | 'openai';

export type AvatarCharacter = 'robot' | 'cat' | 'dog';

export type SpeechLanguage = 'th-TH' | 'en-US';

export interface AISettings {
  provider: AIProvider;
  geminiKey?: string;
  geminiModel?: string;
  openaiKey?: string;
  openaiModel?: string;
  character?: AvatarCharacter;
  voiceMuted?: boolean;
  speechLanguage?: SpeechLanguage;
}

export const DEFAULT_SETTINGS: AISettings = {
  provider: 'gemini',
  geminiKey: '',
  geminiModel: 'gemini-3.6-flash',
  openaiKey: '',
  openaiModel: 'gpt-4o-mini',
  character: 'robot',
  voiceMuted: false,
  speechLanguage: 'th-TH',
};

const STORAGE_KEY = 'todolist_ai_settings';

export function loadSettings(): AISettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Automatically migrate deprecated gemini-2.0-flash to gemini-3.6-flash
      if (
        parsed.geminiModel === 'gemini-2.0-flash' ||
        parsed.geminiModel === 'models/gemini-2.0-flash'
      ) {
        parsed.geminiModel = 'gemini-3.6-flash';
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // fallback to defaults on corrupt storage
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AISettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export async function testConnection(
  settings: AISettings
): Promise<{ success: boolean; message: string }> {
  const isGemini = settings.provider === 'gemini';
  const key = (isGemini ? settings.geminiKey : settings.openaiKey)?.trim();

  if (!key) {
    return { success: false, message: 'API key is required' };
  }

  try {
    if (isGemini) {
      const model = settings.geminiModel || 'gemini-3.6-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${encodeURIComponent(key)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message: data?.error?.message || `Gemini error (${res.status})`,
        };
      }
      return { success: true, message: 'Connected successfully to Gemini!' };
    } else {
      const model = settings.openaiModel || 'gpt-4o-mini';
      const url = `https://api.openai.com/v1/models/${model}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message: data?.error?.message || `OpenAI error (${res.status})`,
        };
      }
      return { success: true, message: 'Connected successfully to OpenAI!' };
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Network error or connection failed';
    return { success: false, message: errMsg };
  }
}
