import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { Task, TaskPriority } from "../../../types/task.types";
import { Badge } from "../../../components/ui/badge";
import { AlertTriangle, ArrowRight, Clock } from "lucide-react";
import { useCompleteTask } from "../../../hooks/useTask";
import Checkbox from "../../../components/ui/checkbox";
import { cn } from "../../../lib/utils";

interface DueSoonTasksProps {
  tasks: Task[];
}

const DueSoonTasks = ({ tasks }: DueSoonTasksProps) => {
  const completeTask = useCompleteTask();

  // Process and sort tasks by due date
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks]);

  const handleTaskComplete = (taskId: string) => {
    completeTask.mutate(taskId);
  };

  return (
    <div className="space-y-4">
      {sortedTasks.map((task, index) => (
        <motion.div
          key={task._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={cn(
            "p-4 border rounded-lg bg-card flex items-start gap-3",
            task.dueDate &&
              isPast(new Date(task.dueDate)) &&
              !task.isCompleted &&
              "border-red-200 dark:border-red-900/50"
          )}
        >
          <Checkbox
            checked={task.isCompleted}
            onChange={() =>
              !task.isCompleted && handleTaskComplete(task._id)
            }
            className="mt-1"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Link
                to={`/tasks/${task._id}`}
                className="text-lg font-medium line-clamp-1 hover:text-primary transition-colors"
              >
                {task.title}
              </Link>

              {task.priority === TaskPriority.HIGH ||
              task.priority === TaskPriority.URGENT ? (
                <Badge
                  variant={
                    task.priority === TaskPriority.URGENT
                      ? "destructive"
                      : "outline"
                  }
                  className="ml-auto"
                >
                  {task.priority === TaskPriority.URGENT ? (
                    <AlertTriangle className="mr-1 h-3 w-3" />
                  ) : null}
                  {task.priority}
                </Badge>
              ) : null}
            </div>

            {task.description && (
              <p className="text-muted-foreground text-sm line-clamp-1 mt-1">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-4 mt-2">
              {task.dueDate && (
                <div
                  className={cn(
                    "flex items-center text-xs",
                    isPast(new Date(task.dueDate)) && !task.isCompleted
                      ? "text-red-500 dark:text-red-400"
                      : "text-muted-foreground"
                  )}
                >
                  <Clock className="mr-1 h-3 w-3" />
                  <DueDateLabel dueDate={task.dueDate} />
                </div>
              )}

              {task.workspaceId && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="font-medium">
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        {task.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag._id}
                            variant="secondary"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              color: tag.color,
                              borderColor: `${tag.color}40`,
                            }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {task.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{task.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Link
            to={`/tasks/${task._id}`}
            className="self-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

const DueDateLabel = ({ dueDate }: { dueDate: string }) => {
  const date = new Date(dueDate);

  if (isToday(date)) {
    return (
      <span className="font-medium">Due today at {format(date, "h:mm a")}</span>
    );
  } else if (isTomorrow(date)) {
    return <span>Due tomorrow at {format(date, "h:mm a")}</span>;
  } else if (isPast(date)) {
    return (
      <span className="font-medium">Overdue - {format(date, "MMM d")}</span>
    );
  } else {
    return <span>Due {format(date, "MMM d")}</span>;
  }
};

export default DueSoonTasks;
