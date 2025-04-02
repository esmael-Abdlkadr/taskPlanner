import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTask, useUpdateTask, useToggleFavorite } from "../../hooks/useTask";
import { format, isValid } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Star,
  CheckCircle,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import Button from "../../components/ui/button";
import { Avatar } from "../../components/common/Avatar";
import TaskStatusBadge from "../../features/task/components/TaskStatusBadge";
import TaskPriorityBadge from "../../features/task/components/TaskPriotiyBadge";

import { cn } from "../../lib/utils";
import { TaskTree } from "./components/subTaskManager";
import { EditTaskModal } from "./components/EditTasks";
import { DeleteTaskModal } from "./components/DeleteModal";
import { Category, TaskStatus } from "../../types/task.types";
import { CommentsSection } from "../../features/task/components/CommentSection";
import { TaskTimer } from "../../features/promodo/TaskTimer";
import { TimeHistory } from "../../features/promodo/TimeHistory";

const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return null;

  const date = new Date(dateString);
  if (!isValid(date)) return null;

  try {
    return format(date, "PPP");
  } catch (error) {
    console.error("Date formatting error:", error);
    return dateString;
  }
};
function isCategory(category: unknown): category is Category {
  return (
    typeof category === "object" &&
    category !== null &&
    "name" in (category as Category) &&
    "color" in (category as Category) &&
    "icon" in category
  );
}

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [deleteTaskOpen, setDeleteTaskOpen] = useState(false);
  const [showTimeTracking, setShowTimeTracking] = useState(false);

  const { data, isLoading, error } = useTask(taskId || "");
  const task = data?.task;
  const updateTask = useUpdateTask(taskId || "");

  const toggleFavorite = useToggleFavorite();

  // Navigate back if task not found
  useEffect(() => {
    if (!isLoading && !task && error) {
      navigate("/tasks");
    }
  }, [isLoading, task, error, navigate]);

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  const handleToggleFavorite = () => {
    toggleFavorite.mutate(task._id);
  };

  const handleStatusChange = (status: string) => {
    updateTask.mutate({ status: status as TaskStatus });
  };

  const handleDeleteTask = () => {
    setDeleteTaskOpen(true);
  };

  const getCategoryColor = () => {
    if (!task.categoryId) return "#6366F1";
    return isCategory(task.categoryId) ? task.categoryId.color : "#6366F1";
  };

  const getCategoryIcon = () => {
    if (!task.categoryId || !isCategory(task.categoryId)) return null;

    switch (task.categoryId.icon) {
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
      default:
        return "📝";
    }
  };

  const isDueDatePassed = task.dueDate
    ? new Date(task.dueDate) < new Date() && task.status !== "completed"
    : false;

  return (
    <div className="container py-8">
      <div className="mb-6">
        <div className="flex items-center flex-wrap mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>

          {/* Task breadcrumb navigation */}
          {task.path && task.path.length > 0 && (
            <div className="flex items-center flex-wrap text-sm text-gray-500 dark:text-gray-400 ml-2">
              {task.path.map((pathId: string, index: number) => {
                // Find parent task info - in a real app, you'd fetch this data
                // Here we're showing a simplified version
                return (
                  <div key={pathId || index} className="flex items-center">
                    <Link
                      to={`/tasks/${pathId}`}
                      className="hover:text-primary hover:underline truncate max-w-[150px]"
                    >
                      {index === 0 ? "Parent Task" : `Level ${index + 1}`}
                    </Link>
                    <ChevronRight className="h-4 w-4 mx-1" />
                  </div>
                );
              })}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Current Task
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Task header */}
      <div className="flex items-start justify-between mb-6 flex-wrap md:flex-nowrap gap-4">
        <div className="flex items-start space-x-4">
          {task.categoryId && (
            <div
              className="w-12 h-12 flex items-center justify-center rounded-full shrink-0"
              style={{ backgroundColor: getCategoryColor() }}
            >
              <span className="text-white text-lg">{getCategoryIcon()}</span>
            </div>
          )}

          <div>
            <h1
              className={cn(
                "text-2xl font-bold",
                task.status === "completed" &&
                  "line-through text-gray-500 dark:text-gray-400"
              )}
            >
              {task.title}
            </h1>

            <div className="flex items-center mt-2 space-x-3">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />

              {task.categoryId && (
                <div
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: isCategory(task.categoryId)
                      ? `${task.categoryId.color}20`
                      : "#6366F120",
                    color: isCategory(task.categoryId)
                      ? task.categoryId.color
                      : "#6366F1",
                  }}
                >
                  {isCategory(task.categoryId)
                    ? task.categoryId.name
                    : "Category"}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            className={`p-2 ${
              task.isFavorite
                ? "text-yellow-500"
                : "text-gray-400 hover:text-yellow-500"
            }`}
          >
            <Star
              className={`h-5 w-5 ${task.isFavorite ? "fill-current" : ""}`}
            />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditTaskOpen(true)}
            className="p-2"
          >
            <Edit className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteTask}
            className="p-2 text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTimeTracking(!showTimeTracking)}
            className="ml-2"
          >
            <Clock size={16} className="mr-1" />{" "}
            {showTimeTracking ? "Hide Timer" : "Track Time"}
          </Button>
        </div>
      </div>
      {showTimeTracking && task && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <TaskTimer taskId={task._id} taskTitle={task.title} />
          </div>
          <div>
            <TimeHistory taskId={task._id} />
          </div>
        </div>
      )}

      {/* Task details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="font-semibold text-lg mb-2">Description</h2>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              {task.description ? (
                <p className="whitespace-pre-wrap">{task.description}</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  No description provided
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-3">Status</h2>
            <div className="flex flex-wrap gap-2">
              {["not-started", "in-progress", "completed", "archived"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={cn(
                      "px-4 py-2 rounded-md border transition-all",
                      task.status === status
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                    )}
                  >
                    {status === "not-started" && "Not Started"}
                    {status === "in-progress" && "In Progress"}
                    {status === "completed" && "Completed"}
                    {status === "archived" && "Archived"}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
            {task.dueDate && (
              <div className="flex items-start">
                <div className="mr-2 mt-0.5">
                  {isDueDatePassed ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Calendar className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Due date</p>
                  <p
                    className={cn(
                      "text-sm",
                      isDueDatePassed
                        ? "text-red-500 font-medium"
                        : "text-gray-600 dark:text-gray-300"
                    )}
                  >
                    {formatDate(task.dueDate)}
                  </p>
                </div>
              </div>
            )}

            {task.assigneeId && (
              <div className="flex items-start">
                <div className="mr-2 mt-0.5">
                  <Avatar
                    src={task.assigneeId.avatar}
                    name={`${task.assigneeId.firstName} ${task.assigneeId.lastName}`}
                    size="sm"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">Assigned to</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {task.assigneeId.firstName} {task.assigneeId.lastName}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start">
              <div className="mr-2 mt-0.5">
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Hierarchy</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {task.depth > 0 ? `Level ${task.depth} subtask` : "Main task"}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-2 mt-0.5">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {formatDate(task.createdAt)}
                </p>
                {task.updatedAt && task.updatedAt !== task.createdAt && (
                  <>
                    <p className="text-sm font-medium mt-1">Updated</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {formatDate(task.updatedAt)}
                    </p>
                  </>
                )}
              </div>
            </div>

            {task.completedAt && (
              <div className="flex items-start">
                <div className="mr-2 mt-0.5">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Completed</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(task.completedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <TaskTree taskId={task._id} />
      <div className="my-8 border-b border-gray-200 dark:border-gray-700"></div>
      <CommentsSection taskId={task._id} />

      <EditTaskModal
        open={editTaskOpen}
        onOpenChange={setEditTaskOpen}
        taskId={task._id}
      />

      <DeleteTaskModal
        open={deleteTaskOpen}
        onOpenChange={setDeleteTaskOpen}
        taskId={task._id}
        onSuccess={() => {
          navigate("/tasks");
        }}
      />
    </div>
  );
};

export default TaskDetail;
