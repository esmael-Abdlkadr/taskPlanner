import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PieChart, Activity, Clock } from "lucide-react";
import { TimeStats } from "../../types/timeEntry.types";
import { timeEntryService } from "../../services/timeEntry";
import Button from "../../components/ui/button";

export const TimeAnalytics = () => {
  const [timeStats, setTimeStats] = useState<TimeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");

  useEffect(() => {
    const fetchTimeStats = async () => {
      try {
        setIsLoading(true);
        const stats = await timeEntryService.getTimeStats(period);
        setTimeStats(stats);
      } catch (error) {
        console.error("Failed to load time statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeStats();
  }, [period]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!timeStats) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Activity size={24} className="mx-auto mb-2 opacity-50" />
        <p>No time data available.</p>
      </div>
    );
  }

  const dailyChartData = timeStats.dailyStats.map((day) => ({
    date: day._id,
    hours: Number((day.totalTime / 3600).toFixed(2)),
  }));

  const taskChartData = timeStats.taskStats.slice(0, 5).map((task) => ({
    name:
      task.title.length > 20 ? task.title.substring(0, 20) + "..." : task.title,
    hours: Number((task.totalTime / 3600).toFixed(2)),
  }));

  // Calculate total hours
  const totalHours =
    timeStats.taskStats.reduce((sum, task) => sum + task.totalTime, 0) / 3600;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <Activity size={20} className="mr-2" />
          Time Analytics
        </h2>

        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={period === "day" ? "primary" : "outline"}
            onClick={() => setPeriod("day")}
          >
            Day
          </Button>
          <Button
            size="sm"
            variant={period === "week" ? "primary" : "outline"}
            onClick={() => setPeriod("week")}
          >
            Week
          </Button>
          <Button
            size="sm"
            variant={period === "month" ? "primary" : "outline"}
            onClick={() => setPeriod("month")}
          >
            Month
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Clock size={18} className="mr-2" />
            Total Time
          </h3>
          <div className="text-3xl font-bold">
            {totalHours.toFixed(1)} hours
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {timeStats.taskStats.reduce((sum, task) => sum + task.count, 0)}{" "}
            sessions
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <PieChart size={18} className="mr-2" />
            Time Distribution
          </h3>
          <div className="space-y-2">
            {taskChartData.slice(0, 3).map((task, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: `hsl(${index * 60}, 70%, 60%)` }}
                ></div>
                <div className="text-sm truncate flex-1">{task.name}</div>
                <div className="text-sm font-medium">{task.hours}h</div>
              </div>
            ))}
            {timeStats.taskStats.length > 3 && (
              <div className="text-xs text-gray-500 italic mt-1">
                +{timeStats.taskStats.length - 3} more tasks
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Daily Breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyChartData}>
              <XAxis dataKey="date" />
              <YAxis unit="h" />
              <Tooltip
                formatter={(value) => [`${value} hours`, "Time Spent"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Top Tasks</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskChartData} layout="vertical">
              <XAxis type="number" unit="h" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip
                formatter={(value) => [`${value} hours`, "Time Spent"]}
                labelFormatter={(label) => `Task: ${label}`}
              />
              <Bar dataKey="hours" fill="#4f46e5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
