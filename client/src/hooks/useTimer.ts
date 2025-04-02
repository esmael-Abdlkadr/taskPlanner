import { useState, useEffect, useRef, useCallback } from "react";

interface UseTimerProps {
  initialSeconds?: number;
  countdownTarget?: number;
  autoStart?: boolean;
  onTimeUpdate?: (seconds: number) => void;
  onComplete?: () => void;
}

export const useTimer = ({
  initialSeconds = 0,
  countdownTarget,
  autoStart = false,
  onTimeUpdate,
  onComplete,
}: UseTimerProps) => {
  // For countdown mode, initialize seconds to the target
  const isCountdown = typeof countdownTarget === "number";
  const [seconds, setSeconds] = useState(
    isCountdown ? countdownTarget : initialSeconds
  );
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Handle the timer effect
  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setSeconds((prevSeconds) => {
        // For countdown, decrement until we reach 0
        if (isCountdown) {
          const newSeconds = prevSeconds - 1;
          if (newSeconds <= 0) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsPaused(false);
            onComplete?.();
            return 0;
          }
          onTimeUpdate?.(newSeconds);
          return newSeconds;
        }
        // For countup, just increment
        else {
          const newSeconds = prevSeconds + 1;
          onTimeUpdate?.(newSeconds);
          return newSeconds;
        }
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, isCountdown, onComplete, onTimeUpdate]);

  // Reset timer to initial state
  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setSeconds(isCountdown ? countdownTarget! : initialSeconds);
    setIsRunning(false);
    setIsPaused(false);
  }, [countdownTarget, initialSeconds, isCountdown]);

  // Start the timer
  const start = useCallback(() => {
    // If we're in countdown mode and we've reached 0, reset first
    if (isCountdown && seconds === 0) {
      setSeconds(countdownTarget!);
    }
    setIsRunning(true);
    setIsPaused(false);
  }, [seconds, countdownTarget, isCountdown]);

  // Pause the timer
  const pause = useCallback(() => {
    setIsRunning(false);
    setIsPaused(true);
  }, []);

  // Resume after pausing
  const resume = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  // Stop the timer
  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(isCountdown ? countdownTarget! : initialSeconds);
  }, [countdownTarget, initialSeconds, isCountdown]);

  // Format time helper
  const formatTime = useCallback(
    (secondsToFormat = seconds) => {
      const hours = Math.floor(secondsToFormat / 3600);
      const minutes = Math.floor((secondsToFormat % 3600) / 60);
      const secs = secondsToFormat % 60;

      return {
        hours,
        minutes,
        seconds: secs,
        formatted:
          hours > 0
            ? `${hours}:${String(minutes).padStart(2, "0")}:${String(
                secs
              ).padStart(2, "0")}`
            : `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
                2,
                "0"
              )}`,
      };
    },
    [seconds]
  );

  const formattedTime = formatTime();
  return {
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    reset,
    stop,
    formatTime,
    ...formattedTime,
  };
};
