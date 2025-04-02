import { useState } from "react";
import { format } from "date-fns";
import { Clock, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useUserTimeEntries } from "../hooks/useTimeEntry";
import { TimeAnalytics } from "../features/promodo/TimeAnalaytics";
import Button from "../components/ui/button";

const TimePromodoDashbaord = () => {
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Using only standard query flags
  const { data, isLoading, isFetching } = useUserTimeEntries({
    limit: pageSize,
    offset: page * pageSize,
  });

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

  // Handle the case where data is undefined
  const timeEntries = data || [];
  const totalEntries = timeEntries.length;
  const hasNextPage = totalEntries > pageSize; // Simplified check for next page

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Clock size={24} className="mr-2" />
        Time Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimeAnalytics />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : timeEntries.length > 0 ? (
            <>
              <div className="space-y-4">
                {timeEntries.map((entry) => (
                  <div
                    key={entry._id}
                    className="border-l-4 border-primary pl-3 py-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {entry.taskId && typeof entry.taskId !== "string"
                            ? (entry.taskId as { title: string }).title
                            : "Unknown Task"}
                        </div>
                        <div className="text-sm text-gray-500 mt-1 flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {format(
                            new Date(entry.startTime),
                            "MMM d, yyyy h:mm a"
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatDuration(entry.duration)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {entry.isPomodoro ? "🍅 Pomodoro" : "⏱️ Regular"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Showing {page * pageSize + 1}-
                  {Math.min((page + 1) * pageSize, totalEntries)} of{" "}
                  {totalEntries}
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((old) => Math.max(0, old - 1))}
                    disabled={page === 0 || isFetching}
                  >
                    <ChevronLeft size={16} />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!isFetching && hasNextPage) {
                        setPage((old) => old + 1);
                      }
                    }}
                    disabled={!hasNextPage || isFetching}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock size={24} className="mx-auto mb-2 opacity-50" />
              <p>No time entries yet.</p>
              <p className="text-sm mt-2">
                Start tracking time on tasks to see your activity here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default TimePromodoDashbaord;
