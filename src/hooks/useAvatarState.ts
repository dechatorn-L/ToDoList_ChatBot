import { useState, useEffect, useRef, useCallback } from 'react';

export type AvatarMood =
  | 'neutral'
  | 'idle_lounge'
  | 'idle_sleep'
  | 'celebrating'
  | 'alert_overdue'
  | 'thinking'
  | 'talking';

interface UseAvatarStateProps {
  hasOverdue: boolean;
  isChatOpen?: boolean;
  isThinking?: boolean;
}

export function useAvatarState({
  hasOverdue,
  isChatOpen = false,
  isThinking = false,
}: UseAvatarStateProps) {
  const [mood, setMood] = useState<AvatarMood>(() =>
    hasOverdue ? 'alert_overdue' : 'neutral'
  );
  const [lastActivity, setLastActivity] = useState<number>(() => Date.now());
  const celebratingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevOverdueRef = useRef<boolean>(hasOverdue);

  const wakeUp = useCallback(() => {
    setLastActivity(Date.now());
    if (mood === 'idle_lounge' || mood === 'idle_sleep') {
      setMood('neutral');
    }
  }, [mood]);

  const triggerCelebration = useCallback(() => {
    if (celebratingTimerRef.current) clearTimeout(celebratingTimerRef.current);
    setMood('celebrating');
    setLastActivity(Date.now());

    celebratingTimerRef.current = setTimeout(() => {
      setMood('neutral');
      setLastActivity(Date.now());
    }, 5000);
  }, []);

  // Handle overdue detection & decay
  useEffect(() => {
    if (hasOverdue && !prevOverdueRef.current) {
      setMood('alert_overdue');
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      alertTimerRef.current = setTimeout(() => {
        setMood('neutral');
      }, 10000);
    }
    prevOverdueRef.current = hasOverdue;
  }, [hasOverdue]);

  // Initial overdue decay if starts with alert_overdue
  useEffect(() => {
    if (hasOverdue && mood === 'alert_overdue') {
      alertTimerRef.current = setTimeout(() => {
        setMood('neutral');
      }, 10000);
    }
    return () => {
      if (celebratingTimerRef.current) clearTimeout(celebratingTimerRef.current);
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, []);

  // Inactivity tracking (30s -> idle_lounge, 60s -> idle_sleep)
  useEffect(() => {
    if (mood === 'celebrating' || mood === 'alert_overdue' || isChatOpen || isThinking) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      if (elapsed >= 60000) {
        setMood('idle_sleep');
      } else if (elapsed >= 30000) {
        setMood('idle_lounge');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastActivity, mood, isChatOpen, isThinking]);

  // Chat & thinking state reflection
  useEffect(() => {
    if (isThinking) {
      setMood('thinking');
    } else if (isChatOpen) {
      setMood('talking');
    } else if (mood === 'thinking' || mood === 'talking') {
      setMood('neutral');
    }
  }, [isThinking, isChatOpen]);

  return {
    mood,
    triggerCelebration,
    wakeUp,
  };
}
