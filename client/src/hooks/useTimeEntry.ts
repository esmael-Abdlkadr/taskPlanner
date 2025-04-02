import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { timeEntryService } from "../services/timeEntry";
import { TimeEntry, TimeStats } from "../types/timeEntry.types";

// =====================
// Query Hooks
// =====================

export const useActiveTimeEntry = () => {
  return useQuery({
    queryKey: ["active-time-entry"],
    queryFn: () => timeEntryService.getActiveTimeEntry(),
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });
};

export const useTaskTimeEntries = (taskId: string) => {
  return useQuery({
    queryKey: ["task-time-entries", taskId],
    queryFn: () => timeEntryService.getTaskTimeEntries(taskId),
    enabled: !!taskId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUserTimeEntries = (params?: {
  limit?: number;
  offset?: number;
}): UseQueryResult<TimeEntry[], Error> => {
  return useQuery({
    queryKey: ["user-time-entries", params],
    queryFn: () => timeEntryService.getUserTimeEntries(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTimeStats = (period: "day" | "week" | "month") => {
  return useQuery<TimeStats, Error>({
    queryKey: ["time-stats", period],
    queryFn: () => timeEntryService.getTimeStats(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStartTimeEntry = () => {
  const queryClient = useQueryClient();

  interface PomodoroConfig {
    workDuration: number;
    breakDuration: number;
    longBreakDuration: number;
    cycles: number;
  }

  interface StartTimeEntryInput {
    taskId: string;
    isPomodoro: boolean;
    pomodoroConfig?: PomodoroConfig;
  }

  return useMutation<TimeEntry, Error, StartTimeEntryInput>({
    mutationFn: (data: StartTimeEntryInput) =>
      timeEntryService.startTimeEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-time-entry"] });
      queryClient.invalidateQueries({ queryKey: ["task-time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["user-time-entries"] });
    },
  });
};

export const usePauseTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation<TimeEntry, Error, string>({
    mutationFn: (timeEntryId: string) =>
      timeEntryService.pauseTimeEntry(timeEntryId),
    onSuccess: (updatedEntry) => {
      queryClient.invalidateQueries({ queryKey: ["active-time-entry"] });
      queryClient.invalidateQueries({
        queryKey: ["task-time-entries", updatedEntry.taskId],
      });
    },
  });
};

export const useResumeTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation<TimeEntry, Error, string>({
    mutationFn: (timeEntryId: string) =>
      timeEntryService.resumeTimeEntry(timeEntryId),
    onSuccess: (updatedEntry) => {
      queryClient.invalidateQueries({ queryKey: ["active-time-entry"] });
      queryClient.invalidateQueries({
        queryKey: ["task-time-entries", updatedEntry.taskId],
      });
    },
  });
};

export const useStopTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation<TimeEntry, Error, string>({
    mutationFn: (timeEntryId: string) =>
      timeEntryService.stopTimeEntry(timeEntryId),
    onSuccess: (updatedEntry) => {
      queryClient.invalidateQueries({ queryKey: ["active-time-entry"] });
      queryClient.invalidateQueries({
        queryKey: ["task-time-entries", updatedEntry.taskId],
      });
      queryClient.invalidateQueries({ queryKey: ["user-time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["time-stats"] });
    },
  });
};

// =====================
// Timer Helper Functions
// =====================

export const calculateElapsedTime = (timeEntry: TimeEntry): number => {
  if (!timeEntry) return 0;
  if (timeEntry.status === "completed") {
    return timeEntry.duration;
  }
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
};

export const formatTimeDisplay = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
};
