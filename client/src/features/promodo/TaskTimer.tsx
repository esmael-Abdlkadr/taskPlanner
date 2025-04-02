import { useState, useEffect } from "react";
import {
  Clock,
  Play,
  Pause,
  Square,
  History,
  Timer as TimerIcon,
} from "lucide-react";
import { TimeEntry } from "../../types/timeEntry.types";
import { usePomodoroStore } from "../../store/promodoStore";
import { timeEntryService } from "../../services/timeEntry";
import Button from "../../components/ui/button";
import { PomodoroTimer } from "./PromodoTimer";
import { PomodoroSettings } from "./PromodoSetting";

interface TaskTimerProps {
  taskId: string;
  taskTitle: string;
}

export const TaskTimer = ({ taskId, taskTitle }: TaskTimerProps) => {
  const [mode, setMode] = useState<"regular" | "pomodoro">("regular");
  const [activeTimeEntry, setActiveTimeEntry] = useState<TimeEntry | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentElapsed, setCurrentElapsed] = useState(0);
  const pomodoroSettings = usePomodoroStore();

  // Force timer update every second
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (activeTimeEntry && activeTimeEntry.status === "active") {
      interval = setInterval(() => {
        const elapsed = calculateElapsedTime(activeTimeEntry);
        setCurrentElapsed(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimeEntry]);

  // Check for active time entry on component mount
  useEffect(() => {
    const checkActiveTimeEntry = async () => {
      try {
        setIsLoading(true);
        const activeEntry = await timeEntryService.getActiveTimeEntry();

        if (activeEntry && activeEntry.taskId === taskId) {
          setActiveTimeEntry(activeEntry);
          const elapsed = calculateElapsedTime(activeEntry);
          setCurrentElapsed(elapsed);
        }
      } catch (error) {
        console.error("Failed to get active time entry:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkActiveTimeEntry();
  }, [taskId]);

  // Calculate elapsed time for a time entry
  function calculateElapsedTime(timeEntry: TimeEntry): number {
    if (timeEntry.status === "completed") {
      return timeEntry.duration;
    }

    const startTime = new Date(timeEntry.startTime).getTime();
    const now = Date.now();
    let elapsedSeconds = Math.floor((now - startTime) / 1000);

    if (timeEntry.pausedDuration) {
      elapsedSeconds -= timeEntry.pausedDuration;
    }

    // If currently paused, subtract time since last pause
    if (timeEntry.status === "paused" && timeEntry.lastPausedAt) {
      const pausedAt = new Date(timeEntry.lastPausedAt).getTime();
      const pausedSeconds = Math.floor((now - pausedAt) / 1000);
      elapsedSeconds -= pausedSeconds;
    }

    return elapsedSeconds > 0 ? elapsedSeconds : 0;
  }

  // Format time display
  const formatTimeDisplay = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(
        secs
      ).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  // Start tracking time
  const startTracking = async () => {
    try {
      setIsActionLoading(true);

      if (mode === "regular") {
        const newTimeEntry = await timeEntryService.startTimeEntry({
          taskId,
          isPomodoro: false,
        });

        setActiveTimeEntry(newTimeEntry);
        setCurrentElapsed(0);
      } else {
        // Pomodoro mode
        const newTimeEntry = await timeEntryService.startTimeEntry({
          taskId,
          isPomodoro: true,
          pomodoroConfig: {
            workDuration: pomodoroSettings.workDuration,
            breakDuration: pomodoroSettings.breakDuration,
            longBreakDuration: pomodoroSettings.longBreakDuration,
            cycles: pomodoroSettings.cycles,
          },
        });

        setActiveTimeEntry(newTimeEntry);
      }
    } catch (error) {
      console.error("Failed to start time tracking:", error);
      alert("Failed to start timer. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Pause tracking
  const pauseTracking = async () => {
    if (!activeTimeEntry) return;

    try {
      setIsActionLoading(true);
      const updatedEntry = await timeEntryService.pauseTimeEntry(
        activeTimeEntry._id
      );
      setActiveTimeEntry(updatedEntry);
    } catch (error) {
      console.error("Failed to pause time tracking:", error);
      alert("Failed to pause timer. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Resume tracking
  const resumeTracking = async () => {
    if (!activeTimeEntry) return;

    try {
      setIsActionLoading(true);
      const updatedEntry = await timeEntryService.resumeTimeEntry(
        activeTimeEntry._id
      );
      setActiveTimeEntry(updatedEntry);
    } catch (error) {
      console.error("Failed to resume time tracking:", error);
      alert("Failed to resume timer. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Stop tracking
  const stopTracking = async () => {
    if (!activeTimeEntry) return;

    try {
      setIsActionLoading(true);
      await timeEntryService.stopTimeEntry(activeTimeEntry._id);
      setActiveTimeEntry(null);
      setCurrentElapsed(0);
    } catch (error) {
      console.error("Failed to stop time tracking:", error);
      alert("Failed to stop timer. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-20">
        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (mode === "pomodoro") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{taskTitle}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode("regular")}
          >
            <Clock size={16} className="mr-1" /> Switch to Regular Timer
          </Button>
        </div>

        <PomodoroTimer
          taskId={taskId}
          onSettingsClick={() => setShowSettings(true)}
        />

        {showSettings && (
          <PomodoroSettings
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    );
  }

  // Display for regular timer mode
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{taskTitle}</h3>
        <Button variant="outline" size="sm" onClick={() => setMode("pomodoro")}>
          <TimerIcon size={16} className="mr-1" /> Switch to Pomodoro
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="text-4xl font-bold mb-4">
          {formatTimeDisplay(currentElapsed)}
        </div>

        <div className="flex space-x-2">
          {!activeTimeEntry ? (
            <Button
              onClick={startTracking}
              disabled={isActionLoading}
              title="Start tracking time for this task"
              variant="primary"
            >
              <Play size={16} className="mr-1" /> Start Timer
            </Button>
          ) : activeTimeEntry.status === "active" ? (
            <>
              <Button
                onClick={pauseTracking}
                disabled={isActionLoading}
                title="Pause the timer"
                variant="outline"
              >
                <Pause size={16} className="mr-1" /> Pause
              </Button>
              <Button
                onClick={stopTracking}
                disabled={isActionLoading}
                title="Stop and save the time entry"
                variant="destructive"
              >
                <Square size={16} className="mr-1" /> Stop
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={resumeTracking}
                disabled={isActionLoading}
                title="Resume the timer"
                variant="primary"
              >
                <Play size={16} className="mr-1" /> Resume
              </Button>
              <Button
                onClick={stopTracking}
                disabled={isActionLoading}
                title="Stop and save the time entry"
                variant="destructive"
              >
                <Square size={16} className="mr-1" /> Stop
              </Button>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="mt-4"
          title="View time tracking history for this task"
        >
          <History size={14} className="mr-1" /> View Time History
        </Button>
      </div>
    </div>
  );
};
