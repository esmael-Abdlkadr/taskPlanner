import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  CheckCircle,
  Clock,
  Calendar,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  AlertCircle,
  MoreVertical,
  Star,
  Trash2,
  Edit,
  Copy
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Task } from '../../../types/task.types';
import { Avatar } from '../../../components/ui/avatar';
import Button from '../../../components/ui/button';
import { Dropdown } from '../../../components/ui/dropdown';
import { useToggleFavorite } from '../../../hooks/useTask';
import TaskStatusBadge from '../../../features/task/components/TaskStatusBadge';
import TaskPriorityBadge from '../../../features/task/components/TaskPriotiyBadge';

interface TaskListProps {
  tasks: Task[];
  sortBy?: string;
  workspaceId: string;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  sortBy = 'updatedAt', 
  workspaceId,
  onEditTask,
  onDeleteTask
}) => {
  const navigate = useNavigate();
  const toggleFavorite = useToggleFavorite();

  // Apply sorting (this happens client-side for already fetched tasks)
  const sortedTasks = [...tasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        // Sort by due date, with null dates at the end
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'updatedAt':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'priority': {
        // Sort by priority (urgent > high > medium > low)
        const priorityOrder: Record<string, number> = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 };
        const aPriority = a.priority as string;
        const bPriority = b.priority as string;
        return priorityOrder[aPriority] - priorityOrder[bPriority];
      }
      default:
        return 0;
    }
  });

  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleToggleFavorite = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation(); // Prevent task click
    toggleFavorite.mutate(taskId);
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'urgent': return <ArrowUp className="h-3.5 w-3.5 text-red-500" />;
      case 'high': return <ArrowUp className="h-3.5 w-3.5 text-orange-500" />;
      case 'medium': return <ArrowRight className="h-3.5 w-3.5 text-blue-500" />;
      case 'low': return <ArrowDown className="h-3.5 w-3.5 text-green-500" />;
      default: return null;
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <motion.div
      className="space-y-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {sortedTasks.map(task => (
        <motion.div
          key={task._id}
          variants={itemVariants}
          className={`
            bg-white dark:bg-gray-800 rounded-lg border p-4 
            ${task.status === 'completed' ? 'border-gray-200 dark:border-gray-700' : 'border-gray-200 dark:border-gray-700'} 
            hover:border-primary/50 hover:shadow-md transition-all cursor-pointer
          `}
          onClick={() => handleTaskClick(task._id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Status indicator */}
              <div className="flex-shrink-0">
                {task.status === 'completed' ? (
                  <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                ) : task.status === 'in-progress' ? (
                  <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                )}
              </div>
              
              {/* Task title */}
              <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                {task.title}
              </h3>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Favorite button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => handleToggleFavorite(e, task._id)}
                title={task.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star 
                  className={`h-4 w-4 ${task.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                />
              </Button>

              {/* Task actions dropdown */}
              <Dropdown
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                }
                items={[
                  {
                    label: 'Edit Task',
                    icon: <Edit className="mr-2 h-4 w-4" />,
                    onClick: () => {
                      if (onEditTask) onEditTask(task);
                    }
                  },
                  {
                    label: 'Duplicate',
                    icon: <Copy className="mr-2 h-4 w-4" />,
                    onClick: () => {
                      // Handle duplicate action
                      console.log('Duplicate task:', task._id);
                    }
                  },
                  {
                    label: 'Delete Task',
                    icon: <Trash2 className="mr-2 h-4 w-4" />,
                    onClick: () => {
                      if (onDeleteTask) onDeleteTask(task._id);
                    },
                    className: 'text-red-500'
                  }
                ]}
              />
            </div>
          </div>

          {/* Task details */}
          <div className="ml-8 mt-2">
            {task.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Task metadata */}
            <div className="flex flex-wrap gap-3 items-center text-sm">
              <TaskStatusBadge status={task.status} size="sm" />
              <TaskPriorityBadge priority={task.priority} size="sm" />

              {/* Due date */}
              {task.dueDate && (
                <div className={`flex items-center ${
                  new Date(task.dueDate) < new Date() && task.status !== 'completed'
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>
                    {format(new Date(task.dueDate), 'MMM d')}
                  </span>
                </div>
              )}

              {/* Assigned to */}
              {task.assigneeId && (
                <div className="flex items-center text-gray-500 dark:text-gray-400 ml-auto">
                  <Avatar
                    src={task.assigneeId.avatar}
                    name={`${task.assigneeId.firstName} ${task.assigneeId.lastName || ''}`}
                    size="xs"
                  />
                  <span className="ml-1">{task.assigneeId.firstName}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default TaskList;