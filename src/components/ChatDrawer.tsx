import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../hooks/useTasks';
import { AISettings, AvatarCharacter } from '../utils/aiSettings';
import {
  ChatMessage,
  ToolActionHandler,
  sendChatMessage,
} from '../utils/aiDispatcher';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  settings: AISettings;
  handlers: ToolActionHandler;
  onOpenSettings: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onCharacterChange?: (character: AvatarCharacter) => void;
}

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! I'm your AI task assistant. You can tell me to add, complete, delete, or organize tasks, or ask me for planning guidance.",
};

const SUGGESTIONS = [
  'Add high-priority task to submit report by tomorrow',
  'What tasks are overdue?',
  'Clear all completed tasks',
];

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  tasks,
  settings,
  handlers,
  onOpenSettings,
  onLoadingChange,
  onCharacterChange,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isGemini = settings.provider === 'gemini';
  const activeKey = isGemini ? settings.geminiKey : settings.openaiKey;
  const isKeyMissing = !activeKey || activeKey.trim() === '';

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);
    onLoadingChange?.(true);

    try {
      const result = await sendChatMessage(
        newHistory,
        tasks,
        settings,
        handlers
      );

      const botMessage: ChatMessage = {
        role: 'assistant',
        content: result.reply,
        actions: result.performedActions,
      };

      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI Chat Assistant Drawer"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-900/30 backdrop-blur-2xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="relative w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-zinc-200/90 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 bg-zinc-50/50">
            <div className="flex items-center gap-2.5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                settings.character === 'cat'
                  ? 'bg-orange-50 border-orange-200 text-orange-600'
                  : settings.character === 'dog'
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'bg-teal-50 border-teal-200/80 text-teal-600'
              }`}>
                {settings.character === 'cat' ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="4,7 8,2 12,6" />
                    <polygon points="20,7 16,2 12,6" />
                    <circle cx="12" cy="13" r="7" fill="#FED7AA" />
                    <circle cx="9" cy="12" r="1" fill="#7C2D12" />
                    <circle cx="15" cy="12" r="1" fill="#7C2D12" />
                  </svg>
                ) : settings.character === 'dog' ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="4,8 8,3 12,7" />
                    <polygon points="20,8 16,3 12,7" />
                    <circle cx="12" cy="13" r="7" fill="#FBBF24" />
                    <circle cx="9" cy="12" r="1" fill="#451A03" />
                    <circle cx="15" cy="12" r="1" fill="#451A03" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v4" />
                    <line x1="8" y1="16" x2="8" y2="16" strokeWidth="2.5" />
                    <line x1="16" y1="16" x2="16" y2="16" strokeWidth="2.5" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-900">
                  {settings.character === 'cat' ? 'Milo the Cat' : settings.character === 'dog' ? 'Hachi the Shiba' : 'AI Task Assistant'}
                </h2>
                <p className="text-[11px] text-zinc-500 font-mono">
                  {isGemini ? `Gemini (${settings.geminiModel || '2.0-flash'})` : `OpenAI (${settings.openaiModel || 'gpt-4o-mini'})`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Quick Persona Switcher */}
              <div className="flex items-center gap-0.5 rounded-lg bg-zinc-100 p-0.5 border border-zinc-200/60" aria-label="Character Switcher">
                <button
                  type="button"
                  onClick={() => onCharacterChange?.('robot')}
                  className={`px-1.5 py-0.5 text-[10px] rounded transition-colors cursor-pointer ${
                    settings.character === 'robot'
                      ? 'bg-white text-teal-700 font-semibold shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  Bot
                </button>
                <button
                  type="button"
                  onClick={() => onCharacterChange?.('cat')}
                  className={`px-1.5 py-0.5 text-[10px] rounded transition-colors cursor-pointer ${
                    settings.character === 'cat'
                      ? 'bg-white text-orange-700 font-semibold shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  Cat
                </button>
                <button
                  type="button"
                  onClick={() => onCharacterChange?.('dog')}
                  className={`px-1.5 py-0.5 text-[10px] rounded transition-colors cursor-pointer ${
                    settings.character === 'dog'
                      ? 'bg-white text-amber-700 font-semibold shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  Dog
                </button>
              </div>
              <button
                type="button"
                onClick={onOpenSettings}
                aria-label="Open Settings"
                className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Chat Drawer"
                className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Missing Key Banner */}
          {isKeyMissing && (
            <div className="m-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 shadow-xs">
              <div className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold">API Key Required</p>
                  <p className="text-amber-800/90 mt-0.5">
                    Connect your {isGemini ? 'Google Gemini' : 'OpenAI'} API key to enable AI task management.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="mt-2.5 inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-500 cursor-pointer transition-all"
                  >
                    Configure in Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed max-w-[85%] ${
                      isUser
                        ? 'rounded-tr-xs bg-teal-600 text-white shadow-xs'
                        : 'rounded-tl-xs bg-zinc-50 border border-zinc-200/80 text-zinc-800 shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Action Confirmation Badges */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 pt-2 border-t border-zinc-200/60">
                        {msg.actions.map((actionText, actIdx) => (
                          <span
                            key={actIdx}
                            className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700 border border-teal-200/80"
                          >
                            <svg className="w-3 h-3 text-teal-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {actionText}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing / Thinking Indicator */}
            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="rounded-2xl rounded-tl-xs bg-zinc-50 border border-zinc-200/80 px-4 py-2.5 text-xs text-zinc-500 shadow-xs flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="border-t border-zinc-100 px-4 py-2.5 bg-zinc-50/40">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(suggestion)}
                  disabled={isLoading || isKeyMissing}
                  className="shrink-0 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] text-zinc-600 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50/40 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="border-t border-zinc-200 p-4 bg-white"
          >
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me to add, complete, or organize tasks..."
                disabled={isLoading}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 pr-12 text-xs text-zinc-800 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className="absolute right-1.5 rounded-lg bg-orange-600 p-2 text-white shadow-xs hover:bg-orange-500 disabled:opacity-40 transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
