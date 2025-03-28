import { useState } from "react";
import { Task, TaskStatus } from "../../../types/task.types"; 
import { format } from "date-fns";
import { 
  Star, 
  AlertCircle, 
  ChevronRight,
  Calendar
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { useTaskPath, useToggleFavorite } from "../../../hooks/useTask"
import { Link } from "react-router-dom";
import TaskStatusBadge from "./TaskStatusBadge";
import TaskPriorityBadge from "./TaskPriotiyBadge";
import { Avatar } from "../../../components/common/Avatar";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  showWorkspace?: boolean;
  className?: string;
}

export const TaskCard = ({
  task,
  onClick,
  className,
}: TaskCardProps) => {
  const { data: pathData } = useTaskPath(task._id);
  const toggleFavorite = useToggleFavorite();
  const [isHovered, setIsHovered] = useState(false);
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite.mutate(task._id);
  };
  
  // Get the right icon color based on the category
  const getCategoryColor = () => {
    return (task.categoryId as { color?: string })?.color ?? "#6366F1";
  };
  
  // Get the right icon based on the category
  const getCategoryIcon = () => {
    if (!task.categoryId || typeof task.categoryId === "string") return "📝";
    
    // Map category icons to lucide or emoji representations
    switch ((task.categoryId as { icon?: string }).icon) {
      case "user":
        return "👤";
      case "briefcase":
        return "💼";
      case "heart":
        return "❤️";
      case "dollar-sign":
        return "💰";
      case "shopping-cart":
        return "🛒";
      case "book":
        return "📚";
      case "home":
        return "🏠";
      case "map-pin":
        return "📍";
      // Add more mappings as needed
      default:
        return "📝"; // Default icon
    }
  };
  
  return (
    <Link
      to={`/tasks/${task._id}`}
      className={cn(
        "block p-4 rounded-lg border hover:border-primary transition-all",
        task.status === TaskStatus.DONE && "bg-muted/50",
        className
      )}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {/* Category icon if available */}
          {task.categoryId && (
            <div 
              className="w-8 h-8 flex items-center justify-center rounded-full shrink-0"
              style={{ backgroundColor: getCategoryColor() }}
            >
              <span className="text-white text-sm">
                {getCategoryIcon()}
              </span>
            </div>
          )}
          
          <div>
            <h3 
              className={cn(
                "text-base font-medium line-clamp-2",
                task.status === "completed" && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </h3>
            
            {/* Parent path if it's a subtask */}
            {pathData && pathData.length > 0 && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span>
                  {pathData[0]} 
                  {pathData.length > 1 && ` +${pathData.length - 1}`}
                </span>
                <ChevronRight className="h-3 w-3 mx-1" />
              </div>
            )}
            
            {/* Task metadata row */}
            <div className="flex flex-wrap gap-2 mt-2">
              <TaskStatusBadge status={task.status} size="sm" />
              <TaskPriorityBadge priority={task.priority} size="sm" />
              
              {/* Due date if available */}
              {task.dueDate && (
                <div 
                  className={cn(
                    "flex items-center text-xs px-2 py-1 rounded-full",
                    new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE 
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  )}
                >
                  {new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE
                    ? <AlertCircle className="h-3 w-3 mr-1" />
                    : <Calendar className="h-3 w-3 mr-1" />
                  }
                  {format(new Date(task.dueDate), "MMM d")}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          {/* Favorite star icon */}
          <button
            onClick={handleFavoriteClick}
            className={cn(
              "p-1 rounded-full transition-all",
              task.isFavorite 
                ? "text-yellow-500 hover:text-yellow-600" 
                : "text-muted-foreground opacity-0 hover:opacity-100 focus:opacity-100",
              isHovered && !task.isFavorite && "opacity-50"
            )}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
          
          {/* Assignee avatar if available */}
          {task.assigneeId && (
            <div className="mt-auto pt-2">
              <Avatar 
                src={task.assigneeId.avatar} 
                name={`${task.assigneeId.firstName} ${task.assigneeId.lastName}`}
                size="sm"
                className="mt-1"
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};