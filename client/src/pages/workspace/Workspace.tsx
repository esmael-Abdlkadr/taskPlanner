import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Filter, 
  Search, 
  CheckSquare, 
  Clock,
  Settings, 
  ArrowLeft,
  SlidersHorizontal
} from 'lucide-react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useWorkspaceTasks } from '../../hooks/useTask';
import { TaskStatus, TaskPriority } from '../../types/task.types';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import Select from '../../components/ui/select';
import TaskList from '../tasks/components/TaskList';
import { CreateTaskDialog } from '../../features/task/components/CreateTask'; 
import { CircularProgress } from '../../components/ui/CircularProgress'; 
import EmptyState from '../../components/ui/EmptyState';

const WorkspaceTasksPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  
  const { data: workspace, isLoading: workspaceLoading } = useWorkspace(workspaceId || '');
  
  // Build filter object for API call
  const filters = {
    status: statusFilter as TaskStatus || undefined,
    priority: priorityFilter as TaskPriority || undefined,
    search: searchQuery || undefined,
  };
  
  const { data: tasksResponse, isLoading: tasksLoading } = useWorkspaceTasks(
    workspaceId,
    filters
  );
  
  // Extract tasks from response
  const tasks = Array.isArray(tasksResponse) 
    ? tasksResponse 
    : tasksResponse?.tasks || [];
  
  // Status filter options
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'todo', label: 'TODO' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' },
  ];
  
  // Priority filter options
  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];
  
  // Sort options
  const sortOptions = [
    { value: 'updatedAt', label: 'Recently Updated' },
    { value: 'createdAt', label: 'Creation Date' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
  ];
  
  const isLoading = workspaceLoading || tasksLoading;
  
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!workspace) {
    return (
      <div className="container py-8">
        <EmptyState
          title="Workspace not found"
          description="The workspace you're looking for doesn't exist or you don't have access to it."
          icon={<CheckSquare className="h-12 w-12 text-gray-400" />}
          action={
            <Button
              onClick={() => navigate('/workspaces')}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Workspaces
            </Button>
          }
        />
      </div>
    );
  }
  
  const stats = workspace.stats || {
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    completionRate: 0
  };
  
  return (
    <div className="container py-8">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div className="flex items-center">
            <div
              className="h-12 w-12 rounded-lg mr-4 flex items-center justify-center"
              style={{ backgroundColor: workspace.color || '#6366F1' }}
            >
              <CheckSquare className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">{workspace.name}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => navigate(`/workspaces/${workspaceId}/settings`)}
              variant="outline"
              leftIcon={<Settings className="h-4 w-4" />}
            >
              Settings
            </Button>
            <Button
              onClick={() => setShowCreateDialog(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              New Task
            </Button>
          </div>
        </div>
        
        {workspace.description && (
          <p className="text-gray-500 dark:text-gray-400 ml-16 mb-4">
            {workspace.description}
          </p>
        )}
        
        {/* Stats section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-lg p-4 flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Total Tasks</div>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
            </div>
            <CheckSquare className="h-8 w-8 text-indigo-500 opacity-70" />
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg p-4 flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-green-600 dark:text-green-400">Completed</div>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
            </div>
            <div className="w-10 h-10">
              <CircularProgress 
                value={stats.completionRate} 
                maxValue={100} 
                strokeWidth={8}
                textClassName="text-xs font-bold"
                className="text-green-500"
              />
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-lg p-4 flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-red-600 dark:text-red-400">Overdue</div>
              <div className="text-2xl font-bold">{stats.overdueTasks}</div>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
              {stats.overdueTasks} tasks
            </span>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg p-4 flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Members</div>
              <div className="text-2xl font-bold">{stats.memberCount || 1}</div>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300">
              {workspace.role === 'owner' ? 'Owner' : workspace.role}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-40">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Status"
              leftIcon={<Filter className="h-4 w-4" />}
            />
          </div>
          
          <div className="w-full sm:w-40">
            <Select
              options={priorityOptions}
              value={priorityFilter}
              onChange={setPriorityFilter}
              placeholder="Priority"
              leftIcon={<Filter className="h-4 w-4" />}
            />
          </div>
          
          <div className="w-full sm:w-52">
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              placeholder="Sort by"
              leftIcon={<SlidersHorizontal className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>
      
      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description={
            searchQuery || statusFilter || priorityFilter 
              ? "Try adjusting your filters to find tasks" 
              : "Create your first task in this workspace"
          }
          icon={<CheckSquare className="h-12 w-12 text-gray-400" />}
          action={
            <Button
              onClick={() => setShowCreateDialog(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Create Task
            </Button>
          }
        />
      ) : (
        <TaskList 
          tasks={tasks} 
          sortBy={sortBy}
          workspaceId={workspaceId || ''}
        />
      )}
      
      <CreateTaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        defaultWorkspaceId={workspaceId}
      />
    </div>
  );
};

export default WorkspaceTasksPage;