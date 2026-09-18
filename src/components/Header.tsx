import React from 'react';

interface HeaderProps {
  activeCount: number;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeCount, onOpenSettings }) => {
  return (
    <header className="mb-8 flex items-center justify-between border-b border-zinc-200/80 pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Todolist</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Stay focused, one task at a time</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 border border-teal-200/60">
          <span className="font-mono">{activeCount}</span>
          <span className="ml-1 text-zinc-500">remaining</span>
        </span>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Settings"
          className="rounded-xl border border-zinc-200 bg-white p-2 text-zinc-500 hover:text-teal-700 hover:border-teal-300 hover:bg-teal-50/50 shadow-xs transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </header>
  );
};
