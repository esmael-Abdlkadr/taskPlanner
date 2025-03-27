import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Task, TaskStatus } from "../../../types/task.types";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";

interface RecentTasksProps {
  tasks: Task[];
}

const RecentTasks = ({ tasks }: RecentTasksProps) => {
  return (
    <div className="space-y-4">
      {tasks.map((task, index) => (
        <TaskCard key={task._id} task={task} index={index} />
      ))}
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  index: number;
}

const TaskCard = ({ task, index }: TaskCardProps) => {
  // Get status badge style based on task status
  const badgeVariant: "default" | "secondary" | "outline" | "destructive" =
    "outline";
  let className = "";

  switch (task.status) {
    case TaskStatus.TODO:
      className = "text-blue-600 dark:text-blue-400";
      break;
    case TaskStatus.IN_PROGRESS:
      className = "text-amber-600 dark:text-amber-400";
      break;
    case TaskStatus.DONE:
      className = "text-green-600 dark:text-green-400";
      break;
    default:
      className = "";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Link to={`/tasks/${task._id}`}>
        <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium line-clamp-1">{task.title}</h3>
              <Badge variant={badgeVariant} className={className}>
                {task.status === TaskStatus.IN_PROGRESS
                  ? "In Progress"
                  : task.status}
              </Badge>
            </div>

            {task.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1 mt-1">
                {task.description}
              </p>
            )}

            <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
              <div>
                {task.workspaceId && (
                  <span>
                    {task.creator?.firstName} {task.creator?.lastName}
                  </span>
                )}
              </div>
              <span>
                Created {format(new Date(task.createdAt), "MMM d, yyyy")}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default RecentTasks;
