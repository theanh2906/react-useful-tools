import { useState, useEffect, useCallback } from 'react';

/** Represents the broken-down time remaining until a target date. */
interface CountdownTime {
  /** Remaining full days. */
  days: number;
  /** Remaining hours (0–23). */
  hours: number;
  /** Remaining minutes (0–59). */
  minutes: number;
  /** Remaining seconds (0–59). */
  seconds: number;
  /** Total remaining time in milliseconds. */
  total: number;
  /** Whether the countdown has reached zero. */
  isComplete: boolean;
}

/**
 * Custom hook that provides a live countdown to a target date.
 *
 * Updates every second and returns the broken-down remaining time.
 * When the target date is reached or passed, `isComplete` becomes `true`
 * and all time values are zeroed out.
 *
 * @param targetDate - The target date to count down to (Date, ISO string, or timestamp).
 * @returns The current countdown state with days, hours, minutes, seconds, total, and completion status.
 *
 * @example
 * const { days, hours, minutes, seconds, isComplete } = useCountdown('2026-12-31');
 */
export function useCountdown(
  targetDate: Date | string | number
): CountdownTime {
  const calculateTimeLeft = useCallback((): CountdownTime => {
    const target = new Date(targetDate).getTime();
    const now = Date.now();
    const difference = target - now;

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
        isComplete: true,
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference,
      isComplete: false,
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState<CountdownTime>(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return timeLeft;
}
