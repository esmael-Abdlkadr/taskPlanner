import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PomodoroMode = "work" | "break" | "longBreak";

interface PomodoroState {
  // Timer settings
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  cycles: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  alarmSound: string;
  alarmVolume: number;

  // Active session state
  isActive: boolean;
  currentMode: PomodoroMode;
  timeRemaining: number;
  completedPomodoros: number;
  taskId: string | null;
  timeEntryId: string | null;
  lastUpdatedAt: number;

  setSettings: (
    settings: Partial<{
      workDuration: number;
      breakDuration: number;
      longBreakDuration: number;
      cycles: number;
      autoStartBreaks: boolean;
      autoStartPomodoros: boolean;
      alarmSound: string;
      alarmVolume: number;
    }>
  ) => void;

  startSession: (taskId: string, timeEntryId: string | null) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  completeWorkPhase: (nextMode: PomodoroMode) => void;
  completeBreakPhase: () => void;
  updateTimeRemaining: (seconds: number) => void;
  setTimeEntryId: (id: string | null) => void;

  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  cycles: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  alarmSound: "bell",
  alarmVolume: 80,

  isActive: false,
  currentMode: "work" as PomodoroMode,
  timeRemaining: 25 * 60,
  completedPomodoros: 0,
  taskId: null,
  timeEntryId: null,
  lastUpdatedAt: 0,
};
export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      ...DEFAULT_SETTINGS,

      setSettings: (newSettings) =>
        set((state) => ({
          ...state,
          ...newSettings,
          // If in work mode, adjust timeRemaining if workDuration changes
          timeRemaining:
            state.currentMode === "work" && newSettings.workDuration
              ? newSettings.workDuration * 60
              : state.currentMode === "break" && newSettings.breakDuration
              ? newSettings.breakDuration * 60
              : state.currentMode === "longBreak" &&
                newSettings.longBreakDuration
              ? newSettings.longBreakDuration * 60
              : state.timeRemaining,
        })),

      startSession: (taskId, timeEntryId) =>
        set((state) => ({
          ...state,
          isActive: true,
          taskId,
          timeEntryId,
          lastUpdatedAt: Date.now(),
          timeRemaining:
            state.currentMode === "work"
              ? state.workDuration * 60
              : state.currentMode === "break"
              ? state.breakDuration * 60
              : state.longBreakDuration * 60,
        })),

      pauseSession: () =>
        set((state) => ({
          ...state,
          isActive: false,
          lastUpdatedAt: Date.now(),
        })),

      resumeSession: () =>
        set((state) => ({
          ...state,
          isActive: true,
          lastUpdatedAt: Date.now(),
        })),

      stopSession: () =>
        set((state) => ({
          ...state,
          isActive: false,
          timeEntryId: null,
          lastUpdatedAt: 0,
          currentMode: "work",
          timeRemaining: state.workDuration * 60,
        })),

      completeWorkPhase: (nextMode) =>
        set((state) => ({
          ...state,
          isActive: state.autoStartBreaks,
          currentMode: nextMode,
          timeRemaining:
            nextMode === "break"
              ? state.breakDuration * 60
              : state.longBreakDuration * 60,
          completedPomodoros: state.completedPomodoros + 1,
          timeEntryId: null, // Clear time entry as we finished work phase
          lastUpdatedAt: Date.now(),
        })),

      completeBreakPhase: () =>
        set((state) => ({
          ...state,
          isActive: state.autoStartPomodoros,
          currentMode: "work",
          timeRemaining: state.workDuration * 60,
          lastUpdatedAt: Date.now(),
        })),

      updateTimeRemaining: (seconds) =>
        set((state) => ({
          ...state,
          timeRemaining: seconds,
          lastUpdatedAt: Date.now(),
        })),

      setTimeEntryId: (id) =>
        set({
          timeEntryId: id,
        }),

      resetToDefaults: () =>
        set((state) => ({
          ...DEFAULT_SETTINGS,
          // Keep user settings but reset session state
          workDuration: state.workDuration,
          breakDuration: state.breakDuration,
          longBreakDuration: state.longBreakDuration,
          cycles: state.cycles,
          autoStartBreaks: state.autoStartBreaks,
          autoStartPomodoros: state.autoStartPomodoros,
          alarmSound: state.alarmSound,
          alarmVolume: state.alarmVolume,
        })),
    }),
    {
      name: "pomodoro-store",
      partialize: (state) => ({
        // Only persist these fields
        workDuration: state.workDuration,
        breakDuration: state.breakDuration,
        longBreakDuration: state.longBreakDuration,
        cycles: state.cycles,
        autoStartBreaks: state.autoStartBreaks,
        autoStartPomodoros: state.autoStartPomodoros,
        alarmSound: state.alarmSound,
        alarmVolume: state.alarmVolume,
        isActive: state.isActive,
        currentMode: state.currentMode,
        timeRemaining: state.timeRemaining,
        completedPomodoros: state.completedPomodoros,
        taskId: state.taskId,
        timeEntryId: state.timeEntryId,
        lastUpdatedAt: state.lastUpdatedAt,
      }),
    }
  )
);
