import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { 
  Star, 
  Clock, 
  AlertCircle, 
  Calendar, 
  CheckCircle, 
  ArrowUp,
  Flame as FlameIcon
} from 'lucide-react';

import { useWorkspaces } from '../hooks/useWorkspace'; 
import { useWorkspaceTasks } from '../hooks/useTask'; 
import { Task, TaskPriority } from '../types/task.types';  
import Select from '../components/ui/select';
import Button from '../components/ui/button';
import { Avatar } from '../components/common/Avatar'; 
import TaskStatusBadge from '../features/task/components/TaskStatusBadge';
import TaskPriorityBadge from '../features/task/components/TaskPriotiyBadge';
import EmptyState from '../components/ui/EmptyState';

// Animation variants for cards
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07
    }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  },
  hover: {
    y: -5,
    scale: 1.02,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    transition: { type: 'spring', stiffness: 400, damping: 17 }
  },
  tap: { scale: 0.98 }
};

// Extended task interface with our custom fields
interface EnhancedTask extends Task {
  favoriteReason?: 'starred' | 'urgent' | 'overdue' | 'dueSoon';
}

const FavoritesPage = () => {
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const [filterType, setFilterType] = useState<string>('all');
  const [combinedTasks, setCombinedTasks] = useState<EnhancedTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { data: workspaces, isLoading: workspacesLoading } = useWorkspaces();
  
  // Get default workspace if none selected
  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(workspaces[0]._id);
    }
  }, [workspaces, selectedWorkspace]);

  // Fetch different types of priority tasks
  const { data: favoritesResponse, isLoading: favoritesLoading, error: favoritesError } = useWorkspaceTasks(
    selectedWorkspace || undefined,
    { favorites: true },
    { enabled: !!selectedWorkspace }
  );
  
  const { data: urgentResponse, isLoading: urgentLoading } = useWorkspaceTasks(
    selectedWorkspace || undefined,
    { priority: 'urgent' as TaskPriority },
    { enabled: !!selectedWorkspace }
  );
  
  const { data: highPriorityResponse, isLoading: highPriorityLoading } = useWorkspaceTasks(
    selectedWorkspace || undefined,
    { priority: 'high' as TaskPriority },
    { enabled: !!selectedWorkspace }
  );
  
  const { data: allTasksResponse, isLoading: allTasksLoading } = useWorkspaceTasks(
    selectedWorkspace || undefined,
    {},
    { enabled: !!selectedWorkspace }
  );

  // Debugging logs for API responses
  useEffect(() => {
    console.log("Favorites Response:", favoritesResponse);
    console.log("Urgent Response:", urgentResponse);
    console.log("All Tasks Response:", allTasksResponse);
  }, [favoritesResponse, urgentResponse, allTasksResponse]);

  // Extract tasks from responses with proper structure handling
  const favoriteTasks = useMemo(() => 
      Array.isArray(favoritesResponse) 
        ? favoritesResponse 
        : (favoritesResponse && 'tasks' in favoritesResponse ? (favoritesResponse as { tasks: EnhancedTask[] }).tasks : []), 
      [favoritesResponse]
    );
  
  const urgentTasks = useMemo(() => 
    Array.isArray(urgentResponse) 
      ? urgentResponse 
      : ((urgentResponse as unknown) as { tasks?: EnhancedTask[] })?.tasks || [], 
    [urgentResponse]
  );
  
  const highPriorityTasks = useMemo(() => 
    Array.isArray(highPriorityResponse) 
      ? highPriorityResponse 
      : (highPriorityResponse && 'tasks' in highPriorityResponse ? (highPriorityResponse as { tasks: EnhancedTask[] }).tasks : []), 
    [highPriorityResponse]
  );
  
  const allWorkspaceTasks = useMemo(() => 
    Array.isArray(allTasksResponse) 
      ? allTasksResponse 
      : (allTasksResponse && 'tasks' in allTasksResponse ? (allTasksResponse as { tasks: EnhancedTask[] }).tasks : []), 
    [allTasksResponse]
  );

  // Log any issues with API calls
  useEffect(() => {
    if (favoritesError) {
      console.error("Error fetching favorites:", favoritesError);
      setError("Failed to fetch favorite tasks. Please try again.");
    } else {
      setError(null);
    }
  }, [favoritesError]);

  // Combine and deduplicate tasks
  useEffect(() => {
    if (!selectedWorkspace) return;
    
    try {
      console.log("Processing workspace tasks...");
      console.log("- Favorites:", favoriteTasks?.length || 0);
      console.log("- Urgent:", urgentTasks?.length || 0);
      console.log("- All tasks:", allWorkspaceTasks?.length || 0);

      const taskMap = new Map<string, EnhancedTask>();
      
      // Add favorites to map
      favoriteTasks.forEach(task => {
        taskMap.set(task._id, { ...task, favoriteReason: 'starred' });
      });
      
      // Add urgent tasks that aren't already in the list
      urgentTasks.forEach(task => {
        if (!taskMap.has(task._id)) {
          taskMap.set(task._id, { ...task, favoriteReason: 'urgent' });
        }
      });
      
      // Add overdue tasks
      const now = new Date();
      allWorkspaceTasks.forEach(task => {
        // Skip completed tasks
        if (task.status === 'completed') return;
        
        // Check if task is overdue
        if (task.dueDate && isBefore(new Date(task.dueDate), now)) {
          if (!taskMap.has(task._id)) {
            taskMap.set(task._id, { ...task, favoriteReason: 'overdue' });
          }
        }
        
        // Add tasks due soon (next 24 hours)
        if (task.dueDate && 
            isAfter(new Date(task.dueDate), now) && 
            isBefore(new Date(task.dueDate), addDays(now, 1))) {
          if (!taskMap.has(task._id)) {
            taskMap.set(task._id, { ...task, favoriteReason: 'dueSoon' });
          }
        }
      });
      
      // Convert map back to array
      const combined = Array.from(taskMap.values());
      console.log("Combined tasks:", combined.length);
      setCombinedTasks(combined);
    } catch (err) {
      console.error("Error processing tasks:", err);
      setError("An error occurred while processing tasks.");
    }
  }, [favoriteTasks, urgentTasks, highPriorityTasks, allWorkspaceTasks, selectedWorkspace]);

  // Apply filters
  const filteredTasks = combinedTasks.filter(task => {
    if (filterType === 'all') return true;
    return task.favoriteReason === filterType;
  });
  
  // Apply sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        // Sort by due date, with null dates at the end
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority': {
        // Sort by priority (urgent > high > medium > low)
        const priorityOrder: Record<string, number> = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 };
        const aPriority = a.priority as string;
        const bPriority = b.priority as string;
        return priorityOrder[aPriority] - priorityOrder[bPriority];
      }
      case 'status': {
        // Put "in progress" first, then "todo", then "completed"
        const statusOrder: Record<string, number> = { 'in-progress': 0, 'todo': 1, 'completed': 2, 'archived': 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      default:
        return 0;
    }
  });
  
  // Prepare workspace selection options
  const workspaceOptions = workspaces?.map(workspace => ({
    value: workspace._id,
    label: workspace.name
  })) || [];
  

  const isLoading = workspacesLoading || favoritesLoading || urgentLoading || highPriorityLoading || allTasksLoading;
  
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">⭐ Favorites & Priorities</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Important tasks requiring your attention
          </p>
        </div>
        
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Get count of each type for the stats
  const overdueTasks = sortedTasks.filter(task => task.favoriteReason === 'overdue').length;
  const dueSoonTasks = sortedTasks.filter(task => task.favoriteReason === 'dueSoon').length;
  const starredTasks = sortedTasks.filter(task => task.favoriteReason === 'starred').length;
  const urgentCount = sortedTasks.filter(task => task.favoriteReason === 'urgent').length;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <Star className="text-yellow-400 mr-2 h-8 w-8" />
          Favorites & Priorities
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Stay on top of your most important tasks and upcoming deadlines
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      
      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl border border-red-200 dark:border-red-800/30 flex items-center justify-between">
          <div>
            <p className="text-sm text-red-500 dark:text-red-400 font-medium">Overdue</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-300">{overdueTasks}</p>
          </div>
          <div className="bg-red-100 dark:bg-red-800/30 p-3 rounded-lg">
            <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
          </div>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800/30 flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-500 dark:text-amber-400 font-medium">Due Soon</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-300">{dueSoonTasks}</p>
          </div>
          <div className="bg-amber-100 dark:bg-amber-800/30 p-3 rounded-lg">
            <Clock className="h-6 w-6 text-amber-500 dark:text-amber-400" />
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-xl border border-purple-200 dark:border-purple-800/30 flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-500 dark:text-purple-400 font-medium">Urgent</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">{urgentCount}</p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-800/30 p-3 rounded-lg">
            <FlameIcon className="h-6 w-6 text-purple-500 dark:text-purple-400" />
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800/30 flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-500 dark:text-blue-400 font-medium">Starred</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{starredTasks}</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-800/30 p-3 rounded-lg">
            <Star className="h-6 w-6 text-blue-500 dark:text-blue-400" />
          </div>
        </div>
      </div>
      
      {/* Filters and workspace selector */}
      <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="w-64">
            <Select
              options={workspaceOptions}
              value={selectedWorkspace || ''}
              onChange={(value) => setSelectedWorkspace(value)}
              placeholder="Select workspace"
              disabled={workspacesLoading}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2 border rounded-lg p-1 bg-white dark:bg-gray-800">
            <Button
              variant={filterType === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            <Button
              variant={filterType === 'overdue' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('overdue')}
              leftIcon={<AlertCircle className="h-3.5 w-3.5" />}
            >
              Overdue
            </Button>
            <Button
              variant={filterType === 'dueSoon' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('dueSoon')}
              leftIcon={<Clock className="h-3.5 w-3.5" />}
            >
              Due Soon
            </Button>
            <Button
              variant={filterType === 'urgent' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('urgent')}
              leftIcon={<ArrowUp className="h-3.5 w-3.5" />}
            >
              Urgent
            </Button>
            <Button
              variant={filterType === 'starred' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('starred')}
              leftIcon={<Star className="h-3.5 w-3.5" />}
            >
              Starred
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">Sort by</span>
            <Select
              options={[
                { value: 'dueDate', label: 'Due Date' },
                { value: 'priority', label: 'Priority' },
                { value: 'status', label: 'Status' },
              ]}
              value={sortBy}
              onChange={(value) => setSortBy(value)}
              placeholder="Sort by"
            />
          </div>
        </div>
      </div>
      
      {/* Task cards */}
      {sortedTasks.length === 0 ? (
        <EmptyState
          title="No priority tasks found"
          description="You don't have any favorite, urgent, or upcoming tasks in this workspace."
          icon={<Star className="w-12 h-12 text-gray-400" />}
        />
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sortedTasks.map(task => (
            <motion.div
              key={task._id}
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => navigate(`/tasks/${task._id}`)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer group"
            >
              <div className="relative">
                {/* Colorful header based on task type */}
                <div 
                  className={`h-2 w-full ${
                    task.favoriteReason === 'overdue' ? 'bg-red-500' :
                    task.favoriteReason === 'dueSoon' ? 'bg-amber-500' :
                    task.favoriteReason === 'urgent' ? 'bg-purple-500' :
                    'bg-blue-500'
                  }`}
                />
                
                {/* Status icon */}
                <div className="absolute top-5 right-4">
                  {task.favoriteReason === 'overdue' && (
                    <div className="bg-red-100 dark:bg-red-900/30 p-1.5 rounded-md">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                  {task.favoriteReason === 'dueSoon' && (
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-md">
                      <Clock className="h-4 w-4 text-amber-500" />
                    </div>
                  )}
                  {task.favoriteReason === 'urgent' && (
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-md">
                      <ArrowUp className="h-4 w-4 text-purple-500" />
                    </div>
                  )}
                  {task.favoriteReason === 'starred' && (
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-md">
                      <Star className="h-4 w-4 text-blue-500 fill-current" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-5">
                <h3 className={`font-medium text-lg mb-2 group-hover:text-primary transition-colors ${
                  task.status === 'completed' ? 'line-through text-gray-500' : ''
                }`}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {task.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <TaskStatusBadge status={task.status} size="sm" />
                  <TaskPriorityBadge priority={task.priority} size="sm" />
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  {/* Due date */}
                  {task.dueDate ? (
                    <div className={`flex items-center ${
                      task.favoriteReason === 'overdue' ? 'text-red-500 font-medium' : ''
                    }`}>
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                    </div>
                  ) : (
                    <div />
                  )}
                  
                  {/* Assignee - fix property name from assignee to assigneeId */}
                  {task.assigneeId ? (
                    <div className="flex items-center">
                      <Avatar
                        src={task.assigneeId.avatar}
                        name={`${task.assigneeId.firstName} ${task.assigneeId.lastName}`}
                        size="sm"
                      />
                      <span className="ml-1">{task.assigneeId.firstName}</span>
                    </div>
                  ) : (
                    <div />
                  )}
                </div>
              </div>
              
              <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                {/* Category if available */}
                {task.categoryId && typeof task.categoryId === 'object' && task.categoryId !== null ? (
                  <div 
                    className="inline-flex items-center px-2 py-1 text-xs rounded-full"
                    style={{ 
                      backgroundColor: `${(task.categoryId as { color: string, name: string }).color}20`,
                      color: (task.categoryId as { color: string, name: string }).color
                    }}
                  >
                    {(task.categoryId as { color: string, name: string }).name}
                  </div>
                ) : (
                  <div />
                )}
                
                {/* Check completion button */}
                <div className="flex items-center">
                  {task.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 fill-current" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-primary transition-colors" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default FavoritesPage;