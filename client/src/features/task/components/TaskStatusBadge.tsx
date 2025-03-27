import { cn } from "../../../lib/utils"; 

type TaskStatus = "not-started" | "in-progress" | "completed" | "archived";

interface TaskStatusBadgeProps {
  status: TaskStatus;
  size?: "sm" | "md";
  className?: string;
}

const TaskStatusBadge = ({ status, size = "md", className }: TaskStatusBadgeProps) => {
  // Define styling based on status
  const getStatusConfig = () => {
    switch (status) {
      case "not-started":
        return {
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
          label: "Not Started",
        };
      case "in-progress":
        return {
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
          label: "In Progress",
        };
      case "completed":
        return {
          color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
          label: "Completed",
        };
      case "archived":
        return {
          color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
          label: "Archived",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
          label: "Unknown",
        };
    }
  };

  const { color, label } = getStatusConfig();
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span className={cn("rounded-full font-medium", color, sizeClasses, className)}>
      {label}
    </span>
  );
};

export default TaskStatusBadge;