import { cn } from "../../../lib/utils"; 
import { TaskStatus } from "../../../types/task.types";

type TaskPriority = "low" | "medium" | "high" | "urgent";

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  size?: "sm" | "md";
  className?: string;
  status: TaskStatus;
}

const TaskPriorityBadge = ({ priority, size = "md", className }: TaskPriorityBadgeProps) => {

  const getPriorityConfig = () => {
    switch (priority) {
      case "low":
        return {
          color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
          label: "Low",
        };
      case "medium":
        return {
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
          label: "Medium",
        };
      case "high":
        return {
          color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
          label: "High",
        };
      case "urgent":
        return {
          color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
          label: "Urgent",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
          label: "Unknown",
        };
    }
  };

  const { color, label } = getPriorityConfig();
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span className={cn("rounded-full font-medium", color, sizeClasses, className)}>
      {label}
    </span>
  );
};

export default TaskPriorityBadge;