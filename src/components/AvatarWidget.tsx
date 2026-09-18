import React from 'react';
import { AvatarMood } from '../hooks/useAvatarState';
import { AvatarCharacter } from '../utils/aiSettings';

export interface AvatarWidgetProps {
  mood: AvatarMood;
  character?: AvatarCharacter;
  onClick?: () => void;
  onWakeUp?: () => void;
}

export const AvatarWidget: React.FC<AvatarWidgetProps> = ({
  mood,
  character = 'robot',
  onClick,
  onWakeUp,
}) => {
  const getMoodTooltip = (m: AvatarMood, char: AvatarCharacter): string => {
    const name = char === 'cat' ? 'Milo the Cat' : char === 'dog' ? 'Hachi the Shiba' : 'AI Companion';
    switch (m) {
      case 'idle_sleep':
        return 'Zzz... Resting';
      case 'idle_lounge':
        return `${name} is chilling`;
      case 'celebrating':
        return 'Awesome job! 🎉';
      case 'alert_overdue':
        return 'Don’t forget overdue tasks!';
      case 'thinking':
        return 'Thinking...';
      case 'talking':
        return 'Let’s chat!';
      default:
        return `Click to chat with ${name}`;
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
      <div className="mb-2 max-w-[220px] rounded-xl border border-zinc-200/90 bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-xs transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
        <p className="text-xs font-medium text-zinc-700 select-none">
          {getMoodTooltip(mood, character)}
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
            : character === 'cat'
            ? 'border-orange-400 shadow-orange-100'
            : character === 'dog'
            ? 'border-amber-500 shadow-amber-100'
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

        {/* Persona 1: Classic Robot */}
        {character === 'robot' && (
          <svg
            data-testid="avatar-persona-robot"
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
            <rect x="12" y="12" width="40" height="36" rx="12" fill="#F0FDFA" stroke="#0D9488" strokeWidth="2.5" />

            {/* Screen Display */}
            <rect x="17" y="18" width="30" height="22" rx="6" fill={mood === 'idle_sleep' ? '#E2E8F0' : '#134E4A'} />

            {/* Robot Expressions */}
            {mood === 'idle_sleep' ? (
              <g stroke="#64748B" strokeWidth="2" strokeLinecap="round" fill="none">
                <path d="M22 29 Q25 33 28 29" />
                <path d="M36 29 Q39 33 42 29" />
              </g>
            ) : mood === 'alert_overdue' ? (
              <g fill="#F43F5E">
                <circle cx="25" cy="27" r="3.5" />
                <circle cx="39" cy="27" r="3.5" />
                <ellipse cx="32" cy="34" rx="3" ry="2" fill="#F43F5E" />
              </g>
            ) : mood === 'celebrating' ? (
              <g stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none">
                <path d="M22 28 Q25 24 28 28" />
                <path d="M36 28 Q39 24 42 28" />
                <path d="M26 34 Q32 39 38 34" stroke="#F59E0B" strokeWidth="2" />
              </g>
            ) : mood === 'idle_lounge' ? (
              <g stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" fill="none">
                <line x1="22" y1="28" x2="28" y2="28" />
                <line x1="36" y1="28" x2="42" y2="28" />
                <path d="M28 34 Q32 36 36 34" />
              </g>
            ) : (
              <g fill="#2DD4BF">
                <circle cx="25" cy="28" r="3" />
                <circle cx="39" cy="28" r="3" />
                <path d="M27 34 Q32 38 37 34" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" fill="none" />
              </g>
            )}

            {(mood === 'celebrating' || mood === 'neutral') && (
              <g fill="#FDA4AF" opacity="0.6">
                <circle cx="20" cy="33" r="2" />
                <circle cx="44" cy="33" r="2" />
              </g>
            )}

            <rect x="8" y="24" width="4" height="8" rx="2" fill="#0D9488" />
            <rect x="52" y="24" width="4" height="8" rx="2" fill="#0D9488" />
          </svg>
        )}

        {/* Persona 2: Orange Cat (Milo) */}
        {character === 'cat' && (
          <svg
            data-testid="avatar-persona-cat"
            viewBox="0 0 64 64"
            className={`h-12 w-12 transition-transform duration-300 ${
              mood === 'celebrating' ? 'animate-bounce' : 'group-hover:-translate-y-0.5'
            }`}
          >
            {/* Triangular Cat Ears */}
            <polygon points="14,24 22,6 30,22" fill="#FB923C" stroke="#EA580C" strokeWidth="2" strokeLinejoin="round" />
            <polygon points="17,21 22,11 27,20" fill="#FECDD3" />
            <polygon points="50,24 42,6 34,22" fill="#FB923C" stroke="#EA580C" strokeWidth="2" strokeLinejoin="round" />
            <polygon points="47,21 42,11 37,20" fill="#FECDD3" />

            {/* Cat Head Base */}
            <rect x="12" y="16" width="40" height="34" rx="16" fill="#FED7AA" stroke="#EA580C" strokeWidth="2.5" />

            {/* Muzzle */}
            <ellipse cx="32" cy="37" rx="12" ry="7" fill="#FFF7ED" />
            <polygon points="30,33 34,33 32,36" fill="#F43F5E" />

            {/* Whiskers */}
            <g stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round">
              <line x1="16" y1="36" x2="8" y2="34" />
              <line x1="16" y1="39" x2="8" y2="40" />
              <line x1="48" y1="36" x2="56" y2="34" />
              <line x1="48" y1="39" x2="56" y2="40" />
            </g>

            {/* Cat Expressions */}
            {mood === 'idle_sleep' ? (
              <g stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" fill="none">
                <path d="M22 28 Q25 31 28 28" />
                <path d="M36 28 Q39 31 42 28" />
                <path d="M30 38 Q32 40 34 38" />
              </g>
            ) : mood === 'alert_overdue' ? (
              <g fill="#991B1B">
                <circle cx="24" cy="27" r="3.5" />
                <circle cx="40" cy="27" r="3.5" />
                <ellipse cx="32" cy="40" rx="2.5" ry="2" fill="#E11D48" />
              </g>
            ) : mood === 'celebrating' ? (
              <g stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" fill="none">
                <path d="M21 27 Q25 23 29 27" />
                <path d="M35 27 Q39 23 43 27" />
                <path d="M29 38 Q32 43 35 38" stroke="#EA580C" strokeWidth="2" fill="#F43F5E" />
              </g>
            ) : mood === 'idle_lounge' ? (
              <g stroke="#9A3412" strokeWidth="2" strokeLinecap="round" fill="none">
                <line x1="22" y1="28" x2="28" y2="28" />
                <line x1="36" y1="28" x2="42" y2="28" />
                <path d="M30 38 Q32 40 34 38" />
              </g>
            ) : (
              // Neutral / Talking / Thinking
              <g fill="#7C2D12">
                <circle cx="24" cy="28" r="3" />
                <circle cx="40" cy="28" r="3" />
                <path d="M29 37 Q32 40 35 37" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              </g>
            )}

            {/* Cheeks Blush */}
            <circle cx="18" cy="34" r="2.5" fill="#FDA4AF" opacity="0.7" />
            <circle cx="46" cy="34" r="2.5" fill="#FDA4AF" opacity="0.7" />
          </svg>
        )}

        {/* Persona 3: Shiba Dog (Hachi) */}
        {character === 'dog' && (
          <svg
            data-testid="avatar-persona-dog"
            viewBox="0 0 64 64"
            className={`h-12 w-12 transition-transform duration-300 ${
              mood === 'celebrating' ? 'animate-bounce' : 'group-hover:-translate-y-0.5'
            }`}
          >
            {/* Shiba Ears */}
            <polygon points="12,24 20,8 30,22" fill="#D97706" stroke="#B45309" strokeWidth="2" strokeLinejoin="round" />
            <polygon points="16,21 20,13 26,20" fill="#FEF3C7" />
            <polygon points="52,24 44,8 34,22" fill="#D97706" stroke="#B45309" strokeWidth="2" strokeLinejoin="round" />
            <polygon points="48,21 44,13 38,20" fill="#FEF3C7" />

            {/* Dog Head Base */}
            <rect x="12" y="16" width="40" height="34" rx="16" fill="#FBBF24" stroke="#B45309" strokeWidth="2.5" />

            {/* Shiba White Cheeks / Muzzle */}
            <ellipse cx="32" cy="37" rx="14" ry="9" fill="#FFFBEB" />
            <ellipse cx="32" cy="33" rx="3.5" ry="2.5" fill="#451A03" />

            {/* Dog Expressions */}
            {mood === 'idle_sleep' ? (
              <g stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none">
                <path d="M22 28 Q25 31 28 28" />
                <path d="M36 28 Q39 31 42 28" />
                <path d="M30 38 Q32 40 34 38" />
              </g>
            ) : mood === 'alert_overdue' ? (
              <g fill="#991B1B">
                <circle cx="24" cy="27" r="3.5" />
                <circle cx="40" cy="27" r="3.5" />
                <ellipse cx="32" cy="40" rx="2.5" ry="2" fill="#E11D48" />
              </g>
            ) : mood === 'celebrating' ? (
              <g>
                <g stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" fill="none">
                  <path d="M21 27 Q25 23 29 27" />
                  <path d="M35 27 Q39 23 43 27" />
                </g>
                {/* Happy Tongue Out */}
                <path d="M28 38 Q32 44 36 38" stroke="#B45309" strokeWidth="2" fill="#F43F5E" />
              </g>
            ) : mood === 'idle_lounge' ? (
              <g stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none">
                <line x1="22" y1="28" x2="28" y2="28" />
                <line x1="36" y1="28" x2="42" y2="28" />
                <path d="M30 38 Q32 40 34 38" />
              </g>
            ) : (
              // Neutral / Talking / Thinking
              <g fill="#451A03">
                <circle cx="24" cy="27" r="3" />
                <circle cx="40" cy="27" r="3" />
                <path d="M29 37 Q32 40 35 37" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              </g>
            )}

            {/* White eyebrow dots */}
            <circle cx="23" cy="21" r="2" fill="#FFFBEB" />
            <circle cx="41" cy="21" r="2" fill="#FFFBEB" />
          </svg>
        )}

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
