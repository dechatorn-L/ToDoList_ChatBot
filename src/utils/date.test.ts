import { describe, it, expect } from 'vitest';
import { isOverdue, getTodayString, formatDueDate } from './date';

describe('Date Utilities (Ticket 03)', () => {
  it('identifies overdue tasks correctly', () => {
    const yesterday = '2020-01-01';
    const future = '2099-01-01';
    const today = getTodayString();

    expect(isOverdue(yesterday, false)).toBe(true);
    expect(isOverdue(yesterday, true)).toBe(false); // Completed tasks are not overdue
    expect(isOverdue(future, false)).toBe(false);
    expect(isOverdue(today, false)).toBe(false); // Due today is not yet overdue
    expect(isOverdue(undefined, false)).toBe(false);
  });

  it('formats due dates nicely', () => {
    const today = getTodayString();
    expect(formatDueDate(today)).toBe('Today');
    expect(formatDueDate('2020-01-15')).toBe('Jan 15, 2020');
  });
});
