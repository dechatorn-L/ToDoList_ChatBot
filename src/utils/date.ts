export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isOverdue(dueDate?: string, completed?: boolean): boolean {
  if (!dueDate || completed) return false;
  return dueDate < getTodayString();
}

export function formatDueDate(dueDate?: string): string {
  if (!dueDate) return '';
  const today = getTodayString();
  if (dueDate === today) return 'Today';

  const [year, month, day] = dueDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
