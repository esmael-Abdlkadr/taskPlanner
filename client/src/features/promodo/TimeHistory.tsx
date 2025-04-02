import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Clock, Calendar } from "lucide-react";
import { TimeEntry } from "../../types/timeEntry.types";
import { timeEntryService } from "../../services/timeEntry";

interface TimeHistoryProps {
  taskId: string;
}

export const TimeHistory = ({ taskId }: TimeHistoryProps) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    const fetchTimeEntries = async () => {
      try {
        setIsLoading(true);
        const entries = await timeEntryService.getTaskTimeEntries(taskId);
        setTimeEntries(entries);

        const total = entries.reduce((sum, entry) => sum + entry.duration, 0);
        setTotalTime(total);
      } catch (error) {
        console.error("Failed to load time entries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeEntries();
  }, [taskId]);

  const formatDuration = (seconds: number) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-20">
        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (timeEntries.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Clock size={24} className="mx-auto mb-2 opacity-50" />
        <p>No time entries yet for this task.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <Clock size={18} className="mr-2" />
        Time History
      </h3>

      <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-3 mb-4 flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Total Time:
          </span>
          <span className="ml-2 font-medium">{formatDuration(totalTime)}</span>
        </div>
        <div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Sessions:
          </span>
          <span className="ml-2 font-medium">{timeEntries.length}</span>
        </div>
      </div>

      <div className="space-y-3">
        {timeEntries.map((entry) => (
          <div key={entry._id} className="border-l-4 border-primary pl-3 py-1">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">
                {entry.isPomodoro ? "🍅 Pomodoro" : "⏱️ Timer"} Session
              </div>
              <div className="text-sm text-gray-500">
                {formatDuration(entry.duration)}
              </div>
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Calendar size={12} className="mr-1" />
              {format(new Date(entry.startTime), "MMM d, yyyy h:mm a")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
