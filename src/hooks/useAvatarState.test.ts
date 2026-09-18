import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useAvatarState } from './useAvatarState';

describe('useAvatarState Hook (Seam 3: Avatar State Machine)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts in neutral mood when there are no overdue tasks', () => {
    const { result } = renderHook(() => useAvatarState({ hasOverdue: false }));
    expect(result.current.mood).toBe('neutral');
  });

  it('triggers celebration for 5 seconds then reverts', () => {
    const { result } = renderHook(() => useAvatarState({ hasOverdue: false }));

    act(() => {
      result.current.triggerCelebration();
    });

    expect(result.current.mood).toBe('celebrating');

    // Advance 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.mood).toBe('neutral');
  });

  it('transitions to idle_lounge at 30s and idle_sleep at 60s of inactivity', () => {
    const { result } = renderHook(() => useAvatarState({ hasOverdue: false }));

    expect(result.current.mood).toBe('neutral');

    // 30 seconds of inactivity
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    expect(result.current.mood).toBe('idle_lounge');

    // Another 30 seconds (total 60s)
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    expect(result.current.mood).toBe('idle_sleep');

    // Wake up
    act(() => {
      result.current.wakeUp();
    });
    expect(result.current.mood).toBe('neutral');
  });

  it('alerts on overdue tasks with a 10-second decay timer back to idle/neutral', () => {
    const { result } = renderHook(() => useAvatarState({ hasOverdue: true }));

    expect(result.current.mood).toBe('alert_overdue');

    // Advance 10 seconds -> decays to neutral
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.mood).toBe('neutral');
  });
});
