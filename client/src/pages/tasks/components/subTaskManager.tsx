import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  MoreHorizontal, 
  CheckCircle,
  Edit,
  Trash2,
  Clock,
  MoveVertical,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

import Button from "../../../components/ui/button";
import { Avatar } from "../../../components/common/Avatar";
import TaskStatusBadge from "../../../features/task/components/TaskStatusBadge";
import TaskPriorityBadge from "../../../features/task/components/TaskPriotiyBadge";
import { CreateTaskDialog } from "../../../features/task/components/CreateTask";
import { useTask, useSubtasks, useUpdateTask } from "../../../hooks/useTask";
import { EditTaskModal } from "./EditTasks";
import { DeleteTaskModal } from "./DeleteModal";
import { Task, TaskPriority, TaskStatus } from "../../../types/task.types";

interface TaskTreeProps {
  taskId: string;
}


const nodeVariants = {
  hidden: {
    opacity: 0,
    y: -10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.15,
    }
  }
};

// Type definition for the TaskMenu props
interface TaskMenuProps {
  task: Task;
  onAddSubtask: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskMenu: React.FC<TaskMenuProps> = ({ 
  onAddSubtask,
  onEdit,
  onDelete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative" ref={menuRef}>
      <button 
        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal size={16} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700"
          >
            <div className="py-1 divide-y divide-gray-200 dark:divide-gray-700">
              <div>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    onAddSubtask();
                  }}
                  className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Plus size={15} className="mr-2" />
                  Add Subtask
                </button>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    onEdit();
                  }}
                  className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit size={15} className="mr-2" />
                  Edit Task
                </button>
              </div>
              
              <div>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    onDelete();
                  }}
                  className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Trash2 size={15} className="mr-2" />
                  Delete Task
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TaskProgress = ({ completedTasks, totalTasks }: { completedTasks: number, totalTasks: number }) => {
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const getColorClass = () => {
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 70) return "bg-blue-500";
    if (percentage >= 30) return "bg-yellow-500";
    return "bg-gray-300 dark:bg-gray-600";
  };
  
  return (
    <div className="w-full mt-2">
      <div className="flex items-center justify-between mb-1 text-xs text-gray-500 dark:text-gray-400">
        <span>{`Progress: ${completedTasks}/${totalTasks} tasks`}</span>
        <span>{`${percentage}%`}</span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${getColorClass()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Due date indicator with status
const DueDate = ({ date, status }: { date: string, status: string }) => {
  if (!date) return null;
  
  try {
    const dueDate = new Date(date);
    const isOverdue = dueDate < new Date() && status !== "completed";
    
    return (
      <div className={`flex items-center text-xs ${
        isOverdue ? "text-red-500" : "text-gray-500 dark:text-gray-400"
      }`}>
        <Clock size={12} className="mr-1" />
        {isOverdue ? (
          <span className="font-medium flex items-center">
            <AlertCircle size={12} className="mr-1" /> Overdue: {format(dueDate, "MMM d")}
          </span>
        ) : (
          <span>Due {format(dueDate, "MMM d")}</span>
        )}
      </div>
    );
  } catch {
    return <div className="text-xs text-gray-400">Invalid date</div>;
  }
};

interface TaskNodeProps {
  task: Task;
  isParent?: boolean;
  level?: number;
  isLastChild?: boolean;
  refreshHierarchy: () => void;
}

const TaskNode: React.FC<TaskNodeProps> = ({ 
  task, 
  isParent = false,
  level = 0,
  isLastChild = false,
  refreshHierarchy,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [showingDetails, setShowingDetails] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [deleteTaskOpen, setDeleteTaskOpen] = useState(false);
  const { data: subtasksData, isLoading, refetch } = useSubtasks(task._id);
  const updateTask = useUpdateTask(task._id);
  
  // Extract subtasks from the response and compute stats
  const subtasks = Array.isArray(subtasksData) ? subtasksData : (subtasksData?.data || []);

  const hasChildren = subtasks.length > 0;
  const completedSubtasks = subtasks.filter(t => t.status === "completed").length;
  
  // Depth-based styling
  const depthColors = [
    "from-blue-50 to-blue-50/50 dark:from-blue-900/10 dark:to-blue-900/5",
    "from-purple-50 to-purple-50/50 dark:from-purple-900/10 dark:to-purple-900/5",
    "from-green-50 to-green-50/50 dark:from-green-900/10 dark:to-green-900/5",
    "from-amber-50 to-amber-50/50 dark:from-amber-900/10 dark:to-amber-900/5",
    "from-pink-50 to-pink-50/50 dark:from-pink-900/10 dark:to-pink-900/5",
  ];
  
  const depthColor = depthColors[level % depthColors.length];
  
  // Helper function to get the connection line color based on task status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed": return "border-green-500";
      case "in-progress": return "border-blue-500";
      case "archived": return "border-gray-400";
      default: return "border-gray-300 dark:border-gray-600";
    }
  };
  
  const statusColor = getStatusColor(task.status);
  
  // Handle quick status update
  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTask.mutate(
      { status: newStatus },
      {
        onSuccess: () => {
          refreshHierarchy();
          refetch();
        }
      }
    );
  };
  
  // Handle subtask creation success
  const handleSubtaskAdded = () => {
    refetch(); // Refresh subtasks
    refreshHierarchy(); // Refresh the entire hierarchy
    setAddingSubtask(false);
  };

  // Get relative time for dates
  const getRelativeTimeString = (dateString: string) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return "Today";
      if (diffInDays === 1) return "Yesterday";
      if (diffInDays < 7) return `${diffInDays} days ago`;
      
      return format(date, "MMM d, yyyy");
    } catch {
      return null;
    }
  };
  
  // Safe access to assignee properties
  const getAssigneeName = () => {
    if (!task.assigneeId) return null;
    
    if (typeof task.assigneeId === 'object') {
      return {
        firstName: task.assigneeId.firstName || 'Unknown',
        lastName: task.assigneeId.lastName || '',
        avatar: task.assigneeId.avatar || ''
      };
    }
    
    return null;
  };
  
  const assignee = getAssigneeName();

  return (
    <motion.div 
      className={`relative ${level > 0 ? "ml-8 pl-0" : ""}`}
      variants={nodeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Connection lines for non-parent tasks */}
      {level > 0 && (
        <>
          {/* Vertical line */}
          <div 
            className={`absolute left-0 top-0 w-0 -ml-4 ${
              isLastChild ? "h-[22px]" : "h-full"
            } ${statusColor}`}
            style={{ borderLeftWidth: "2px" }}
          />
          
          {/* Horizontal line */}
          <div 
            className={`absolute left-0 top-[22px] w-4 h-0 -ml-4 ${statusColor}`}
            style={{ borderTopWidth: "2px" }}
          />
        </>
      )}
      
      {/* Task card with gradient background based on depth */}
      <div 
        className={`
          mb-3 border rounded-lg overflow-hidden shadow-sm
          bg-gradient-to-r ${depthColor}
          ${task.status === "completed" ? "border-green-300 dark:border-green-700/30" : "border-gray-200 dark:border-gray-700"} 
          ${isParent ? "border-l-4 border-l-blue-500" : ""}
          transition-all duration-200
        `}
      >
        <div className="flex items-start p-3 gap-2">
          {/* Expand/collapse button */}
          <button 
            onClick={() => setExpanded(!expanded)} 
            disabled={isLoading}
            className={`
              p-1.5 rounded-md hover:bg-white/70 dark:hover:bg-gray-700/50 mt-0.5
              ${hasChildren ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-600"}
            `}
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-t-transparent border-gray-300 rounded-full animate-spin"></div>
            ) : hasChildren ? (
              expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            ) : (
              <MoveVertical size={14} opacity={0.5} />
            )}
          </button>
          
          {/* Task content */}
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              {/* Task title */}
              <Link 
                to={`/tasks/${task._id}`}
                className={`
                  font-medium hover:text-primary text-base
                  ${task.status === "completed" ? "line-through text-gray-500" : "text-gray-800 dark:text-gray-100"}
                `}
              >
                {task.title}
              </Link>
              
              {/* Task badges and actions */}
              <div className="flex items-center gap-2">
                {/* Due date indicator */}
                {task.dueDate && (
                  <DueDate date={task.dueDate} status={task.status} />
                )}
                
                {/* Quick status change buttons */}
                <div className="flex items-center">
                  {task.status !== "completed" ? (
                    <button 
                      onClick={() => handleStatusChange("completed" as TaskStatus)}
                      className="p-1.5 rounded-full hover:bg-green-100 hover:text-green-600 text-gray-400 dark:hover:bg-green-900/30"
                      title="Mark as completed"
                    >
                      <CheckCircle size={15} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStatusChange("todo" as TaskStatus)}
                      className="p-1.5 rounded-full hover:bg-gray-100 text-green-500 dark:hover:bg-gray-800"
                      title="Mark as incomplete"
                    >
                      <CheckCircle size={15} className="fill-current" />
                    </button>
                  )}
                </div>
                
                {/* Actions menu */}
                <TaskMenu 
                  task={task} 
                  onAddSubtask={() => setAddingSubtask(true)}
                  onEdit={() => setEditTaskOpen(true)}
                  onDelete={() => setDeleteTaskOpen(true)}
                />
              </div>
            </div>
            
            {/* Task metadata */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <TaskStatusBadge status={task.status as TaskStatus} size="sm" />
              <TaskPriorityBadge priority={task.priority as TaskPriority} size="sm" />
              
              {/* Task depth indicator */}
              <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-white/70 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                {isParent ? "Main Task" : `Level ${level}`}
              </span>
              
              {/* Assignee */}
              {assignee && (
                <div className="flex items-center gap-1 ml-auto">
                  <Avatar 
                    src={assignee.avatar}
                    name={`${assignee.firstName} ${assignee.lastName}`}
                    size="sm"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {assignee.firstName}
                  </span>
                </div>
              )}
            </div>
            
            {/* Show task progress when there are subtasks */}
            {hasChildren && (
              <TaskProgress 
                completedTasks={completedSubtasks} 
                totalTasks={subtasks.length} 
              />
            )}
            
            {/* Task description preview */}
            {task.description && (
              <div 
                className={`
                  mt-2 text-sm text-gray-500 dark:text-gray-400
                  ${showingDetails ? "" : "line-clamp-1"}
                `}
              >
                {task.description}
                {task.description.length > 100 && !showingDetails && (
                  <button 
                    onClick={() => setShowingDetails(true)}
                    className="ml-1 text-xs text-blue-500 hover:text-blue-600"
                  >
                    more
                  </button>
                )}
              </div>
            )}
            
            {/* Additional details row (only shown when expanded) */}
            {showingDetails && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 grid grid-cols-2 gap-3">
                <div>
                  <span className="font-medium">Created:</span> {getRelativeTimeString(task.createdAt)}
                </div>
                {task.updatedAt && task.updatedAt !== task.createdAt && (
                  <div>
                    <span className="font-medium">Updated:</span> {getRelativeTimeString(task.updatedAt)}
                  </div>
                )}
                {task.completedAt && (
                  <div>
                    <span className="font-medium">Completed:</span> {getRelativeTimeString(task.completedAt)}
                  </div>
                )}
                <div className="col-span-2 mt-1">
                  <button 
                    onClick={() => setShowingDetails(false)}
                    className="text-xs text-blue-500 hover:text-blue-600"
                  >
                    Show less
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Subtasks */}
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div 
            className="subtasks ml-0"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {subtasks.map((subtask: Task, index: number) => (
              <TaskNode 
                key={subtask._id}
                task={subtask}
                level={level + 1}
                isLastChild={index === subtasks.length - 1}
                refreshHierarchy={refreshHierarchy}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add subtask dialog */}
      <CreateTaskDialog
        open={addingSubtask}
        onOpenChange={setAddingSubtask}
        parentTaskId={task._id}
        defaultWorkspaceId={typeof task.workspaceId === 'object' ? (task.workspaceId as { _id: string })._id : task.workspaceId}
        onSuccess={handleSubtaskAdded}
      />

      <EditTaskModal
        open={editTaskOpen}
        onOpenChange={setEditTaskOpen}
        taskId={task._id}
        onSuccess={() => {
          refetch();
          refreshHierarchy();
        }}
      />

      {/* Delete task modal */}
      <DeleteTaskModal
        open={deleteTaskOpen}
        onOpenChange={setDeleteTaskOpen}
        taskId={task._id}
        onSuccess={() => {
          refreshHierarchy();
        }}
      />
    </motion.div>
  );
};

export const TaskTree = ({ taskId }: TaskTreeProps) => {
  const { data, isLoading, refetch } = useTask(taskId);
  
  if (isLoading) {
    return (
      <div className="mt-10 space-y-4">
        <h2 className="font-semibold text-lg">Task Hierarchy</h2>
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded opacity-70"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded opacity-50"></div>
        </div>
      </div>
    );
  }
  
  // Extract task with simplified approach
  const task = data?.task;
  
  if (!task) {
    return null;
  }
  
  return (
    <div className="mt-10 pb-16">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-lg">Task Hierarchy</h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          leftIcon={<Clock className="h-3.5 w-3.5" />}
        >
          Refresh
        </Button>
      </div>
      
      <div className="task-tree">
        <TaskNode 
          task={task} 
          isParent={true} 
          refreshHierarchy={refetch}
        />
      </div>
    </div>
  );
};

export default TaskTree;