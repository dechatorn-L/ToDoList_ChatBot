import React, { useState, useEffect } from 'react';
import {
  AISettings,
  AIProvider,
  AvatarCharacter,
  SpeechLanguage,
  loadSettings,
  saveSettings,
  testConnection,
} from '../utils/aiSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AISettings>(loadSettings);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [testState, setTestState] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  useEffect(() => {
    if (isOpen) {
      setSettings(loadSettings());
      setTestState({ loading: false });
      setShowKey(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isGemini = settings.provider === 'gemini';
  const currentKey = isGemini ? settings.geminiKey || '' : settings.openaiKey || '';
  const currentModel = isGemini
    ? settings.geminiModel || 'gemini-2.0-flash'
    : settings.openaiModel || 'gpt-4o-mini';

  const handleProviderChange = (provider: AIProvider) => {
    setSettings((prev) => ({ ...prev, provider }));
    setTestState({ loading: false });
  };

  const handleCharacterChange = (character: AvatarCharacter) => {
    setSettings((prev) => ({ ...prev, character }));
  };

  const handleKeyChange = (val: string) => {
    setSettings((prev) =>
      isGemini ? { ...prev, geminiKey: val } : { ...prev, openaiKey: val }
    );
  };

  const handleModelChange = (val: string) => {
    setSettings((prev) =>
      isGemini ? { ...prev, geminiModel: val } : { ...prev, openaiModel: val }
    );
  };

  const handleTestConnection = async () => {
    setTestState({ loading: true });
    const res = await testConnection(settings);
    setTestState({
      loading: false,
      success: res.success,
      message: res.message,
    });
  };

  const handleSave = () => {
    saveSettings(settings);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl transition-all max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <h2 id="settings-title" className="text-lg font-bold text-zinc-900">
              AI Settings
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              API keys and preferences are stored strictly in your browser.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-4">
          {/* Avatar Character Gallery */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Avatar Companion Persona
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleCharacterChange('robot')}
                className={`flex flex-col items-center justify-center rounded-xl p-2.5 border transition-all cursor-pointer ${
                  settings.character === 'robot'
                    ? 'border-teal-500 bg-teal-50/60 shadow-xs ring-2 ring-teal-500/20'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100/60 text-teal-700 mb-1.5">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v4" />
                    <line x1="8" y1="16" x2="8" y2="16" />
                    <line x1="16" y1="16" x2="16" y2="16" />
                  </svg>
                </div>
                <span className="text-[11px] font-semibold text-zinc-800">Robot</span>
                <span className="text-[9px] text-zinc-400">Classic</span>
              </button>

              <button
                type="button"
                onClick={() => handleCharacterChange('cat')}
                className={`flex flex-col items-center justify-center rounded-xl p-2.5 border transition-all cursor-pointer ${
                  settings.character === 'cat'
                    ? 'border-orange-500 bg-orange-50/60 shadow-xs ring-2 ring-orange-500/20'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100/60 text-orange-700 mb-1.5">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="4,7 8,2 12,6" />
                    <polygon points="20,7 16,2 12,6" />
                    <circle cx="12" cy="13" r="8" />
                    <circle cx="9" cy="12" r="1" fill="currentColor" />
                    <circle cx="15" cy="12" r="1" fill="currentColor" />
                  </svg>
                </div>
                <span className="text-[11px] font-semibold text-zinc-800">Orange Cat</span>
                <span className="text-[9px] text-zinc-400">Playful</span>
              </button>

              <button
                type="button"
                onClick={() => handleCharacterChange('dog')}
                className={`flex flex-col items-center justify-center rounded-xl p-2.5 border transition-all cursor-pointer ${
                  settings.character === 'dog'
                    ? 'border-amber-500 bg-amber-50/60 shadow-xs ring-2 ring-amber-500/20'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100/60 text-amber-700 mb-1.5">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 5.172a2 2 0 00-1.414.586L6.414 7.93A2 2 0 005.828 9.344V12a2 2 0 002 2h10a2 2 0 002-2V9.343a2 2 0 00-.586-1.414l-2.172-2.172A2 2 0 0014.828 5.172H10z" />
                    <circle cx="9" cy="10" r="1" fill="currentColor" />
                    <circle cx="15" cy="10" r="1" fill="currentColor" />
                    <ellipse cx="12" cy="13" rx="1.5" ry="1" fill="currentColor" />
                  </svg>
                </div>
                <span className="text-[11px] font-semibold text-zinc-800">Shiba Dog</span>
                <span className="text-[9px] text-zinc-400">Loyal</span>
              </button>
            </div>
          </div>

          {/* Provider Selection Tabs */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              AI Provider
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-100/80 p-1">
              <button
                type="button"
                onClick={() => handleProviderChange('gemini')}
                className={`flex items-center justify-center rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
                  isGemini
                    ? 'bg-white text-teal-800 shadow-xs border border-zinc-200/60'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Google Gemini
              </button>
              <button
                type="button"
                onClick={() => handleProviderChange('openai')}
                className={`flex items-center justify-center rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
                  !isGemini
                    ? 'bg-white text-teal-800 shadow-xs border border-zinc-200/60'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                OpenAI
              </button>
            </div>
          </div>

          {/* Model Selector */}
          <div>
            <label htmlFor="ai-model" className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Model
            </label>
            <select
              id="ai-model"
              value={currentModel}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800 focus:border-teal-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
            >
              {isGemini ? (
                <>
                  <option value="gemini-2.0-flash">gemini-2.0-flash (Recommended)</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                </>
              ) : (
                <>
                  <option value="gpt-4o-mini">gpt-4o-mini (Recommended)</option>
                  <option value="gpt-4o">gpt-4o</option>
                  <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                </>
              )}
            </select>
          </div>

          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="api-key" className="text-xs font-semibold text-zinc-700">
                {isGemini ? 'Gemini API Key' : 'OpenAI API Key'}
              </label>
              <a
                href={
                  isGemini
                    ? 'https://aistudio.google.com/app/apikey'
                    : 'https://platform.openai.com/api-keys'
                }
                target="_blank"
                rel="noreferrer"
                className="text-xs text-teal-600 hover:underline"
              >
                Get API key ↗
              </a>
            </div>
            <div className="relative">
              <input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                placeholder={`Enter API Key (${isGemini ? 'AIza...' : 'sk-...'})`}
                value={currentKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 pr-10 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
              />
              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                aria-label="Toggle key visibility"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                {showKey ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Voice & Audio Preferences */}
          <div className="pt-2 border-t border-zinc-100 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-700">Voice & Speech Interaction</h3>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200/60">
              <div>
                <span className="text-xs font-semibold text-zinc-800 block">Voice Spoken Responses</span>
                <span className="text-[11px] text-zinc-500">Play spoken voice audio when companion responds</span>
              </div>
              <button
                type="button"
                role="button"
                aria-label="Toggle voice audio"
                onClick={() => setSettings((prev) => ({ ...prev, voiceMuted: !(prev.voiceMuted ?? false) }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  !settings.voiceMuted ? 'bg-teal-600' : 'bg-zinc-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    !settings.voiceMuted ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div>
              <label htmlFor="voice-language" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Voice Language
              </label>
              <select
                id="voice-language"
                aria-label="Voice Language"
                value={settings.speechLanguage || 'th-TH'}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    speechLanguage: e.target.value as SpeechLanguage,
                  }))
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800 focus:border-teal-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
              >
                <option value="th-TH">Thai (th-TH)</option>
                <option value="en-US">English (en-US)</option>
              </select>
            </div>
          </div>

          {/* Test Status Banner */}
          {testState.message && (
            <div
              className={`flex items-start gap-2 rounded-xl p-3 text-xs ${
                testState.success
                  ? 'bg-teal-50 border border-teal-200/80 text-teal-800'
                  : 'bg-rose-50 border border-rose-200/80 text-rose-800'
              }`}
            >
              <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {testState.success ? (
                  <polyline points="20 6 9 17 4 12" />
                ) : (
                  <>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </>
                )}
              </svg>
              <span>{testState.message}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-100">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testState.loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {testState.loading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin text-teal-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-500 active:scale-95 transition-all cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
