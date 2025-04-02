export interface TimeEntry {
  _id: string;
  taskId: string;
  userId: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  isPomodoro: boolean;
  pomodoroConfig?: {
    workDuration: number;
    breakDuration: number;
    longBreakDuration: number;
    cycles: number;
  };
  status: "active" | "paused" | "completed";
  pausedDuration: number;
  lastPausedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimeStats {
  taskStats: {
    taskId: string;
    title: string;
    totalTime: number;
    count: number;
  }[];
  dailyStats: {
    _id: string; // date in YYYY-MM-DD format
    totalTime: number;
    count: number;
  }[];
  period: string;
}
