import React from 'react';
import { AvatarMood } from '../hooks/useAvatarState';

interface AvatarWidgetProps {
  mood: AvatarMood;
  onClick?: () => void;
  onWakeUp?: () => void;
}

export const AvatarWidget: React.FC<AvatarWidgetProps> = ({ mood, onClick, onWakeUp }) => {
  const getMoodTooltip = (m: AvatarMood): string => {
    switch (m) {
      case 'idle_sleep':
        return 'Zzz... Resting';
      case 'idle_lounge':
        return 'Just chilling here';
      case 'celebrating':
        return 'Awesome job! 🎉';
      case 'alert_overdue':
        return 'Don’t forget overdue tasks!';
      case 'thinking':
        return 'Thinking...';
      case 'talking':
        return 'Let’s chat!';
      default:
        return 'Click to chat with AI';
    }
  };

  const handleClick = () => {
    onWakeUp?.();
    onClick?.();
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end"
      onMouseEnter={onWakeUp}
    >
      {/* Speech Bubble / Tooltip */}
      <div className="mb-2 max-w-[200px] rounded-xl border border-zinc-200/90 bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-xs transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
        <p className="text-xs font-medium text-zinc-700 select-none">
          {getMoodTooltip(mood)}
        </p>
      </div>

      {/* Interactive Mascot Avatar Button */}
      <button
        type="button"
        onClick={handleClick}
        aria-label="AI Mascot Companion"
        className={`group relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 bg-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
          mood === 'alert_overdue'
            ? 'border-rose-400 shadow-rose-200/50'
            : mood === 'celebrating'
            ? 'border-amber-400 shadow-amber-200/50'
            : 'border-teal-500 shadow-teal-100'
        }`}
      >
        {/* Floating Zzz for sleeping */}
        {mood === 'idle_sleep' && (
          <div className="pointer-events-none absolute -top-4 -right-1 font-mono text-xs font-bold text-teal-600 animate-bounce">
            Zzz
          </div>
        )}

        {/* Sparkles for celebration */}
        {mood === 'celebrating' && (
          <div className="pointer-events-none absolute -top-2 -left-2 text-amber-500 animate-ping">
            ✨
          </div>
        )}

        {/* SVG Robot Mascot */}
        <svg
          viewBox="0 0 64 64"
          className={`h-12 w-12 transition-transform duration-300 ${
            mood === 'celebrating' ? 'animate-bounce' : 'group-hover:-translate-y-0.5'
          }`}
        >
          {/* Antenna */}
          <line x1="32" y1="12" x2="32" y2="4" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />
          <circle
            cx="32"
            cy="4"
            r="3"
            fill={mood === 'alert_overdue' ? '#DC2626' : mood === 'celebrating' ? '#EA580C' : '#14B8A6'}
            className={mood === 'thinking' ? 'animate-ping' : ''}
          />

          {/* Robot Head Outer */}
          <rect
            x="12"
            y="12"
            width="40"
            height="36"
            rx="12"
            fill="#F0FDFA"
            stroke="#0D9488"
            strokeWidth="2.5"
          />

          {/* Screen Display */}
          <rect
            x="17"
            y="18"
            width="30"
            height="22"
            rx="6"
            fill={mood === 'idle_sleep' ? '#E2E8F0' : '#134E4A'}
          />

          {/* Expressions according to mood */}
          {mood === 'idle_sleep' ? (
            // Closed happy sleeping eyes
            <g stroke="#64748B" strokeWidth="2" strokeLinecap="round" fill="none">
              <path d="M22 29 Q25 33 28 29" />
              <path d="M36 29 Q39 33 42 29" />
            </g>
          ) : mood === 'alert_overdue' ? (
            // Alarmed wide eyes & open mouth
            <g fill="#F43F5E">
              <circle cx="25" cy="27" r="3.5" />
              <circle cx="39" cy="27" r="3.5" />
              <ellipse cx="32" cy="34" rx="3" ry="2" fill="#F43F5E" />
            </g>
          ) : mood === 'celebrating' ? (
            // Joyful star/curved eyes & big smile
            <g stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <path d="M22 28 Q25 24 28 28" />
              <path d="M36 28 Q39 24 42 28" />
              <path d="M26 34 Q32 39 38 34" stroke="#F59E0B" strokeWidth="2" />
            </g>
          ) : mood === 'idle_lounge' ? (
            // Relaxed half-closed eyes
            <g stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" fill="none">
              <line x1="22" y1="28" x2="28" y2="28" />
              <line x1="36" y1="28" x2="42" y2="28" />
              <path d="M28 34 Q32 36 36 34" />
            </g>
          ) : (
            // Neutral / Talking / Thinking (Standard bright cyan eyes & gentle smile)
            <g fill="#2DD4BF">
              <circle cx="25" cy="28" r="3" />
              <circle cx="39" cy="28" r="3" />
              <path
                d="M27 34 Q32 38 37 34"
                stroke="#2DD4BF"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* Cheeks blush */}
          {(mood === 'celebrating' || mood === 'neutral') && (
            <g fill="#FDA4AF" opacity="0.6">
              <circle cx="20" cy="33" r="2" />
              <circle cx="44" cy="33" r="2" />
            </g>
          )}

          {/* Ears/Side bolts */}
          <rect x="8" y="24" width="4" height="8" rx="2" fill="#0D9488" />
          <rect x="52" y="24" width="4" height="8" rx="2" fill="#0D9488" />
        </svg>

        {/* Pulse indicator dot */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
              mood === 'alert_overdue'
                ? 'bg-rose-400'
                : mood === 'celebrating'
                ? 'bg-amber-400'
                : 'bg-teal-400'
            }`}
          />
          <span
            className={`relative inline-flex h-3 w-3 rounded-full ${
              mood === 'alert_overdue'
                ? 'bg-rose-500'
                : mood === 'celebrating'
                ? 'bg-amber-500'
                : 'bg-teal-500'
            }`}
          />
        </span>
      </button>
    </div>
  );
};
