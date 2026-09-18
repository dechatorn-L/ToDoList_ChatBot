import React from 'react';

export type TaskFilter = 'all' | 'active' | 'completed';

interface TaskFilterBarProps {
  currentFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
  };
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  currentFilter,
  onFilterChange,
  counts,
}) => {
  const tabs: { id: TaskFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'active', label: 'Active', count: counts.active },
    { id: 'completed', label: 'Completed', count: counts.completed },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-zinc-200/80 mb-4 pb-2">
      {tabs.map((tab) => {
        const isActive = currentFilter === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onFilterChange(tab.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              isActive
                ? 'bg-teal-50 text-teal-800 border border-teal-200/80 font-semibold shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/80 border border-transparent'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                isActive ? 'bg-teal-200/60 text-teal-900' : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
