import { TimeEntry, TimeStats } from "../types/timeEntry.types";
import { apiRequest } from "./api";

export const timeEntryService = {
  startTimeEntry: async (data: {
    taskId: string;
    isPomodoro: boolean;
    pomodoroConfig?: {
      workDuration: number;
      breakDuration: number;
      longBreakDuration: number;
      cycles: number;
    };
  }) => {
    const response = await apiRequest<{
      status: string;
      data: { timeEntry: TimeEntry };
    }>({
      method: "POST",
      url: "/time-entries",
      data,
    });
    return response.data.timeEntry;
  },

  pauseTimeEntry: async (timeEntryId: string) => {
    const response = await apiRequest<{
      status: string;
      data: { timeEntry: TimeEntry };
    }>({
      method: "PATCH",
      url: `/time-entries/${timeEntryId}/pause`,
    });
    return response.data.timeEntry;
  },

  resumeTimeEntry: async (timeEntryId: string) => {
    const response = await apiRequest<{
      status: string;
      data: { timeEntry: TimeEntry };
    }>({
      method: "PATCH",
      url: `/time-entries/${timeEntryId}/resume`,
    });
    return response.data.timeEntry;
  },

  stopTimeEntry: async (timeEntryId: string) => {
    const response = await apiRequest<{
      status: string;
      data: { timeEntry: TimeEntry };
    }>({
      method: "PATCH",
      url: `/time-entries/${timeEntryId}/stop`,
    });
    return response.data.timeEntry;
  },

  getTaskTimeEntries: async (taskId: string) => {
    const response = await apiRequest<{
      status: string;
      data: { timeEntries: TimeEntry[] };
    }>({
      method: "GET",
      url: `/time-entries/task/${taskId}`,
    });
    return response.data.timeEntries;
  },

  getUserTimeEntries: async (params?: { limit?: number; offset?: number }) => {
    const response = await apiRequest<{
      status: string;
      data: {
        timeEntries: TimeEntry[];
        pagination: { total: number; limit: number; offset: number };
      };
    }>({
      method: "GET",
      url: "/time-entries/user",
      params,
    });
    return {
      timeEntries: response.data.timeEntries,
      pagination: response.data.pagination,
    };
  },

  getActiveTimeEntry: async () => {
    const response = await apiRequest<{
      status: string;
      data: { activeTimeEntry: TimeEntry | null };
    }>({
      method: "GET",
      url: "/time-entries/active",
    });
    return response.data.activeTimeEntry;
  },

  getTimeStats: async (period: "day" | "week" | "month") => {
    const response = await apiRequest<{ status: string; data: TimeStats }>({
      method: "GET",
      url: "/time-entries/stats",
      params: { period },
    });
    return response.data;
  },
};
