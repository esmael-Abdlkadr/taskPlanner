import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Play, Pause, Square, Coffee } from "lucide-react";
import {
  useActiveTimeEntry,
  usePauseTimeEntry,
  useResumeTimeEntry,
  useStopTimeEntry,
  formatTimeDisplay,
} from "../../hooks/useTimeEntry";
import { usePomodoroStore } from "../../store/promodoStore";

export const ActiveTimerWidget = () => {
  const navigate = useNavigate();
  const { data: activeEntry, isLoading } = useActiveTimeEntry();
  const pauseTimeEntry = usePauseTimeEntry();
  const resumeTimeEntry = useResumeTimeEntry();
  const stopTimeEntry = useStopTimeEntry();

  const [isVisible, setIsVisible] = useState(false);
  const [, setCurrentTime] = useState(0);

  const {
    isActive: pomodoroIsActive,
    currentMode: pomodoroMode,
    timeRemaining: pomodoroTimeRemaining,
    taskId: pomodoroTaskId,
  } = usePomodoroStore();

  useEffect(() => {
    if (activeEntry || (pomodoroIsActive && pomodoroTaskId)) {
      setIsVisible(true);

      const timeString = activeEntry
        ? formatTimeDisplay(calculateElapsedTime(activeEntry))
        : formatTimeDisplay(pomodoroTimeRemaining);
      document.title = `${timeString} - TaskVerse`;
    } else {
      setIsVisible(false);
      document.title = "TaskVerse";
    }
  }, [activeEntry, pomodoroIsActive, pomodoroTaskId]);

  useEffect(() => {
    if (!activeEntry) return;

    const initialTime = calculateElapsedTime(activeEntry);
    setCurrentTime(initialTime);

    if (activeEntry.status !== "active") return;

    const interval = setInterval(() => {
      setCurrentTime(calculateElapsedTime(activeEntry));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEntry]);

  useEffect(() => {
    if (
      !pomodoroIsActive ||
      (pomodoroMode !== "break" && pomodoroMode !== "longBreak")
    )
      return;

    const interval = setInterval(() => {
      setCurrentTime(pomodoroTimeRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [pomodoroIsActive, pomodoroTimeRemaining, pomodoroMode]);

  function calculateElapsedTime(timeEntry: any): number {
    if (!timeEntry) return 0;

    const startTime = new Date(timeEntry.startTime).getTime();
    const now = Date.now();
    let elapsedSeconds = Math.floor((now - startTime) / 1000);

    if (timeEntry.pausedDuration) {
      elapsedSeconds -= timeEntry.pausedDuration;
    }

    if (timeEntry.status === "paused" && timeEntry.lastPausedAt) {
      const pausedAt = new Date(timeEntry.lastPausedAt).getTime();
      const pausedSeconds = Math.floor((now - pausedAt) / 1000);
      elapsedSeconds -= pausedSeconds;
    }

    return elapsedSeconds > 0 ? elapsedSeconds : 0;
  }

  const handlePlayPause = async () => {
    if (!activeEntry) return;

    try {
      if (activeEntry.status === "active") {
        await pauseTimeEntry.mutateAsync(activeEntry._id);
      } else {
        await resumeTimeEntry.mutateAsync(activeEntry._id);
      }
    } catch (error) {
      console.error("Error toggling timer:", error);
    }
  };

  const handleStop = async () => {
    if (!activeEntry) return;
    try {
      await stopTimeEntry.mutateAsync(activeEntry._id);
    } catch (error) {
      console.error("Error stopping timer:", error);
    }
  };

  const handleNavigateToTask = () => {
    if (activeEntry) {
      const taskId =
        typeof activeEntry.taskId === "string"
          ? activeEntry.taskId
          : (activeEntry.taskId as { _id: string })._id;
      navigate(`/tasks/${taskId}`);
    } else if (pomodoroTaskId) {
      navigate(`/tasks/${pomodoroTaskId}`);
    }
  };

  if (!isVisible || (isLoading && !pomodoroIsActive)) {
    return null;
  }

  const inPomodoroBreak =
    !activeEntry &&
    pomodoroIsActive &&
    (pomodoroMode === "break" || pomodoroMode === "longBreak");

  const timeDisplay = inPomodoroBreak
    ? formatTimeDisplay(pomodoroTimeRemaining)
    : activeEntry
    ? formatTimeDisplay(calculateElapsedTime(activeEntry))
    : "00:00";

  const taskTitle = activeEntry
    ? typeof activeEntry.taskId !== "string"
      ? (activeEntry.taskId as { title: string }).title
      : "Current Task"
    : "Pomodoro Break";

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 z-50 w-64">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {inPomodoroBreak ? (
            <>
              <Coffee size={16} className="mr-2 text-green-500" />
              <span className="text-sm font-medium">
                {pomodoroMode === "break" ? "Break Time" : "Long Break"}
              </span>
            </>
          ) : (
            <>
              <Clock size={16} className="mr-2 text-primary" />
              <span className="text-sm font-medium">
                {activeEntry?.isPomodoro ? "Pomodoro" : "Timer Running"}
              </span>
            </>
          )}
        </div>
        <div
          className={`h-2 w-2 rounded-full ${
            inPomodoroBreak
              ? "bg-green-500 animate-pulse"
              : activeEntry?.status === "active"
              ? "bg-red-500 animate-pulse"
              : "bg-amber-500"
          }`}
        ></div>
      </div>

      <div
        className="text-sm font-medium mb-2 cursor-pointer hover:underline truncate"
        onClick={handleNavigateToTask}
        title="Click to open task"
      >
        {taskTitle}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xl font-bold">{timeDisplay}</div>

        {!inPomodoroBreak && activeEntry && (
          <div className="flex space-x-2">
            <button
              onClick={handlePlayPause}
              title={
                activeEntry.status === "active" ? "Pause timer" : "Resume timer"
              }
              className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full"
            >
              {activeEntry.status === "active" ? (
                <Pause size={16} />
              ) : (
                <Play size={16} />
              )}
            </button>

            <button
              onClick={handleStop}
              title="Stop timer"
              className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-red-500"
            >
              <Square size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
