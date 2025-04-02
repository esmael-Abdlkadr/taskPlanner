import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw, Check, Settings, Bell } from "lucide-react";
import { usePomodoroStore } from "../../store/promodoStore";
import Button from "../../components/ui/button";
import { timeEntryService } from "../../services/timeEntry";
import { formatTimeDisplay } from "../../hooks/useTimeEntry";

interface PomodoroTimerProps {
  taskId: string;
  onComplete?: () => void;
  onSettingsClick?: () => void;
}

export const PomodoroTimer = ({
  taskId,
  onComplete,
  onSettingsClick,
}: PomodoroTimerProps) => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get pomodoro state from store
  const {
    // Settings
    workDuration,
    breakDuration,
    longBreakDuration,
    cycles,
    autoStartPomodoros,
    alarmSound,
    alarmVolume,

    // Current state
    isActive,
    currentMode,
    timeRemaining,
    completedPomodoros,
    timeEntryId,
    lastUpdatedAt,

    // Actions
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    completeWorkPhase,
    completeBreakPhase,
    updateTimeRemaining,
    setTimeEntryId,
  } = usePomodoroStore();

  // For UI to show paused state
  const [isPaused, setIsPaused] = useState(false);

  // Check for existing Pomodoro when component mounts
  useEffect(() => {
    const checkActivePomodoro = async () => {
      try {
        const activeEntry = await timeEntryService.getActiveTimeEntry();
        if (
          activeEntry &&
          activeEntry.taskId === taskId &&
          activeEntry.isPomodoro
        ) {
          // If we have an active server entry but no local state
          // (or the stored entry ID doesn't match)
          if (!timeEntryId || timeEntryId !== activeEntry._id) {
            setTimeEntryId(activeEntry._id);

            // If task is active, start the timer
            if (activeEntry.status === "active") {
              setIsPaused(false);
              startSession(taskId, activeEntry._id);
            } else {
              setIsPaused(true);
              pauseSession();
            }
          }
        }
      } catch (error) {
        console.error("Failed to check active pomodoro:", error);
      }
    };

    // Only try to sync if we don't already have an active session for this task
    if (taskId !== usePomodoroStore.getState().taskId) {
      checkActivePomodoro();
    }
  }, [taskId]);

  // Timer effect - runs the countdown
  useEffect(() => {
    if (!isActive) {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    // Start a timer that decrements every second
    timerRef.current = setInterval(() => {
      // Calculate elapsed time since last update
      const elapsedSeconds = Math.floor((Date.now() - lastUpdatedAt) / 1000);
      const newRemaining = Math.max(0, timeRemaining - elapsedSeconds);

      updateTimeRemaining(newRemaining);

      if (newRemaining <= 0) {
        // Timer complete!
        clearInterval(timerRef.current!);
        handleTimerComplete();
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, lastUpdatedAt]);

  // Play sound helper function
  const playSound = useCallback(() => {
    if (alarmSound === "none") return;

    try {
      const audio = new Audio(`/sounds/${alarmSound}.mp3`);
      audio.volume = alarmVolume / 100;
      audio.play().catch((error) => console.error("Sound error:", error));
    } catch (error) {
      console.error("Failed to play sound:", error);
    }
  }, [alarmSound, alarmVolume]);

  // Show notification helper function
  const showMessage = useCallback((message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  }, []);

  // Timer completion handler
  const handleTimerComplete = async () => {
    console.log("Timer completed! Mode:", currentMode);
    playSound();

    if (currentMode === "work") {
      // Work session complete - stop the time entry
      if (timeEntryId) {
        try {
          await timeEntryService.stopTimeEntry(timeEntryId);

          // Create a "continuous" time entry for the next work phase if auto-start is enabled
          if (autoStartPomodoros) {
            // Set up a timeout to create a new time entry after break
            setTimeout(async () => {
              console.log("Auto-creating next pomodoro time entry after break");
              // This will be created when the break is complete
              // We'll handle it in the break completion handler below
            }, 1000);
          }
        } catch (error) {
          console.error("Failed to stop time entry:", error);
        }
      }

      // Determine if it's time for a short break or long break
      const nextMode =
        (completedPomodoros + 1) % cycles === 0 ? "longBreak" : "break";

      if (nextMode === "longBreak") {
        showMessage("🎉 Work session complete! Time for a long break.");
      } else {
        showMessage("🎉 Work session complete! Time for a short break.");
      }

      // Update store state for break phase
      completeWorkPhase(nextMode);
    } else {
      // Break complete - transition to work phase
      showMessage("⏰ Break time is over! Ready to focus again?");

      // Start a new time entry for the work phase if auto-start is enabled
      if (autoStartPomodoros) {
        try {
          const newTimeEntry = await timeEntryService.startTimeEntry({
            taskId,
            isPomodoro: true,
            pomodoroConfig: {
              workDuration,
              breakDuration,
              longBreakDuration,
              cycles,
            },
          });

          setTimeEntryId(newTimeEntry._id);
        } catch (error) {
          console.error("Failed to auto-start new work session:", error);
        }
      }

      // Update store state for work phase
      completeBreakPhase();
    }

    if (onComplete) onComplete();
  };

  // Start the timer
  const handleStart = async () => {
    // Only create a new time entry if we're in work mode and don't have an active one
    if (currentMode === "work" && !timeEntryId) {
      try {
        const newTimeEntry = await timeEntryService.startTimeEntry({
          taskId,
          isPomodoro: true,
          pomodoroConfig: {
            workDuration,
            breakDuration,
            longBreakDuration,
            cycles,
          },
        });

        // Store the time entry ID
        setTimeEntryId(newTimeEntry._id);

        // Start the session in the store
        startSession(taskId, newTimeEntry._id);
        setIsPaused(false);
      } catch (error) {
        console.error("Failed to start pomodoro:", error);
        return;
      }
    } else {
      // For breaks, just start the timer without creating an entry
      startSession(taskId, null);
      setIsPaused(false);
    }
  };

  // Pause the timer
  const handlePause = async () => {
    pauseSession();
    setIsPaused(true);

    // If this is a work session, pause the time entry
    if (currentMode === "work" && timeEntryId) {
      try {
        await timeEntryService.pauseTimeEntry(timeEntryId);
      } catch (error) {
        console.error("Failed to pause time entry:", error);
      }
    }
  };

  // Resume the timer
  const handleResume = async () => {
    resumeSession();
    setIsPaused(false);

    // If this is a work session, resume the time entry
    if (currentMode === "work" && timeEntryId) {
      try {
        await timeEntryService.resumeTimeEntry(timeEntryId);
      } catch (error) {
        console.error("Failed to resume time entry:", error);
      }
    }
  };

  // Reset the timer
  const handleReset = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // If this is a work session and we have an active entry, stop it
    if (currentMode === "work" && timeEntryId) {
      try {
        await timeEntryService.stopTimeEntry(timeEntryId);
      } catch (error) {
        console.error("Failed to stop time entry:", error);
      }
    }

    stopSession();
    setIsPaused(false);
  };

  // Skip to next phase
  const handleSkip = async () => {
    if (currentMode === "work") {
      // Stop current time entry if it exists
      if (timeEntryId) {
        try {
          await timeEntryService.stopTimeEntry(timeEntryId);
        } catch (error) {
          console.error("Failed to stop time entry:", error);
        }
      }

      // Determine next mode and complete work phase
      const nextMode =
        (completedPomodoros + 1) % cycles === 0 ? "longBreak" : "break";
      completeWorkPhase(nextMode);
    } else {
      // Move from break to work - if auto-starting, create a new time entry
      if (autoStartPomodoros) {
        try {
          const newTimeEntry = await timeEntryService.startTimeEntry({
            taskId,
            isPomodoro: true,
            pomodoroConfig: {
              workDuration,
              breakDuration,
              longBreakDuration,
              cycles,
            },
          });
          setTimeEntryId(newTimeEntry._id);
        } catch (error) {
          console.error("Failed to start new work session:", error);
        }
      }

      completeBreakPhase();
    }

    setIsPaused(false);
  };

  // UI helpers
  const getModeLabel = () => {
    switch (currentMode) {
      case "work":
        return "Focus Time";
      case "break":
        return "Short Break";
      case "longBreak":
        return "Long Break";
    }
  };

  const getModeColor = () => {
    switch (currentMode) {
      case "work":
        return "bg-red-500";
      case "break":
        return "bg-green-500";
      case "longBreak":
        return "bg-blue-500";
    }
  };

  // Calculate target duration for progress bar
  const getTargetDuration = () => {
    switch (currentMode) {
      case "work":
        return workDuration * 60;
      case "break":
        return breakDuration * 60;
      case "longBreak":
        return longBreakDuration * 60;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
      {/* Mode indicator that changes color based on current mode */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${getModeColor()}`}
      ></div>

      <div className="flex items-center justify-between w-full mb-4 mt-2">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${getModeColor()} mr-2`}></div>
          <span className="text-lg font-medium">{getModeLabel()}</span>
        </div>

        <div className="text-sm text-gray-500">
          {completedPomodoros} / {cycles} pomodoros
        </div>
      </div>

      <div className="text-5xl font-bold mb-8">
        {formatTimeDisplay(timeRemaining)}
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-6 overflow-hidden">
        <div
          className={`h-full ${getModeColor()} transition-all duration-1000`}
          style={{
            width: `${(timeRemaining / getTargetDuration()) * 100}%`,
          }}
        ></div>
      </div>

      <div className="flex items-center justify-center space-x-4">
        {isActive ? (
          <Button onClick={handlePause} variant="outline" size="lg">
            <Pause size={20} className="mr-1" /> Pause
          </Button>
        ) : isPaused ? (
          <Button onClick={handleResume} variant="primary" size="lg">
            <Play size={20} className="mr-1" /> Resume
          </Button>
        ) : (
          <Button onClick={handleStart} variant="primary" size="lg">
            <Play size={20} className="mr-1" /> Start{" "}
            {currentMode === "work" ? "Working" : "Break"}
          </Button>
        )}

        <Button
          onClick={handleReset}
          variant="outline"
          size="lg"
          title="Reset timer"
        >
          <RotateCcw size={18} />
        </Button>

        <Button
          onClick={handleSkip}
          variant="outline"
          size="lg"
          title="Skip to next phase"
        >
          <Check size={18} />
        </Button>
      </div>

      <Button
        onClick={onSettingsClick}
        variant="ghost"
        className="mt-6"
        title="Pomodoro settings"
      >
        <Settings size={16} className="mr-1" /> Settings
      </Button>

      {/* Sound test button */}
      <button
        onClick={playSound}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1"
        title="Test notification sound"
      >
        <Bell size={16} />
      </button>

      {/* Notification */}
      {showNotification && (
        <div className="fixed bottom-20 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 max-w-xs z-50 animate-fade-in">
          <p>{notificationMessage}</p>
        </div>
      )}

      {/* Phase info */}
      <div className="mt-8 text-sm text-gray-500 w-full">
        <div className="grid grid-cols-3 gap-2">
          <div
            className={`p-2 rounded ${
              currentMode === "work" ? "bg-red-100 dark:bg-red-900/20" : ""
            }`}
          >
            <p className="font-medium">Work</p>
            <p>{workDuration} min</p>
          </div>
          <div
            className={`p-2 rounded ${
              currentMode === "break" ? "bg-green-100 dark:bg-green-900/20" : ""
            }`}
          >
            <p className="font-medium">Break</p>
            <p>{breakDuration} min</p>
          </div>
          <div
            className={`p-2 rounded ${
              currentMode === "longBreak"
                ? "bg-blue-100 dark:bg-blue-900/20"
                : ""
            }`}
          >
            <p className="font-medium">Long Break</p>
            <p>{longBreakDuration} min</p>
          </div>
        </div>
      </div>
    </div>
  );
};
