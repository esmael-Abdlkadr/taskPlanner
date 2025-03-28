import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  List, Grid, Search, Plus, MoreHorizontal, 
  Clock, X, AlertCircle, Trash2, Edit
} from "lucide-react";
import { format, isToday } from "date-fns";

import { useAllTasks } from "../../hooks/useTask";
import { useWorkspaces } from "../../hooks/useWorkspace";
import { Task, TaskStatus, TaskPriority } from "../../types/task.types";

import Button from "../../components/ui/button";
import Input from "../../components/ui/input";
import { Avatar } from "../../components/common/Avatar";
import TaskStatusBadge from "../../features/task/components/TaskStatusBadge";
import TaskPriorityBadge from "../../features/task/components/TaskPriotiyBadge";
import { CreateTaskDialog } from "../../features/task/components/CreateTask";
import { DeleteTaskModal } from "./components/DeleteModal";
import { EditTaskModal } from "./components/EditTasks";
import Select from "../../components/ui/select";
import { cn } from "../../lib/utils";
import { Workspace } from "../../services/workspaceService";

interface TaskActionMenuProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskActionMenu: React.FC<TaskActionMenuProps> = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
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
      <Button
        variant="ghost"
        size="sm"
        className="p-1"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <MoreHorizontal size={16} />
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 w-48 rounded-md bg-white shadow-lg dark:bg-gray-800 overflow-hidden">
          <div className="py-1">
            <button
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
                setIsOpen(false);
              }}
            >
              <Edit size={14} className="mr-2" />
              Edit Task
            </button>
            
            <button
              className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setIsOpen(false);
              }}
            >
              <Trash2 size={14} className="mr-2" />
              Delete Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const TasksList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Query parameters
  const initialWorkspace = searchParams.get("workspace") || "all";
  const initialStatus = searchParams.get("status") || "all";
  const initialPriority = searchParams.get("priority") || "all";
  const initialDueDate = searchParams.get("due") || "all";
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "updatedAt";
  const initialOrder = searchParams.get("order") || "desc";
  const initialView = searchParams.get("view") || "list";
  
  // Local state
  const [filters, setFilters] = useState({
    workspace: initialWorkspace,
    status: initialStatus, 
    priority: initialPriority,
    dueDate: initialDueDate,
    search: initialSearch,
    sort: initialSort,
    order: initialOrder as 'asc' | 'desc',
  });
  
  const [view, setView] = useState(initialView);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  
  // Fetch data
  const { data: workspacesResponse } = useWorkspaces();
  const tasksResult = useAllTasks(filters);
  console.log("Tasks result:", tasksResult);
  
  // Extract the tasks array correctly from the nested data property
  const tasks = tasksResult?.data || [];
  

  
  const workspaces = useMemo(() => {
      if (!workspacesResponse) return [];
      return Array.isArray(workspacesResponse) ? workspacesResponse : (workspacesResponse as { data?: any[] })?.data ?? [];
    }, [workspacesResponse])
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.workspace !== "all") params.set("workspace", filters.workspace);
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.priority !== "all") params.set("priority", filters.priority);
    if (filters.dueDate !== "all") params.set("due", filters.dueDate);
    if (filters.search) params.set("search", filters.search);
    if (filters.sort !== "updatedAt") params.set("sort", filters.sort);
    if (filters.order !== "desc") params.set("order", filters.order);
    if (view !== "list") params.set("view", view);
    
    setSearchParams(params);
  }, [filters, view, setSearchParams]);
  
  // Update filters with debounce for search
  const updateFilters = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      workspace: "all",
      status: "all",
      priority: "all", 
      dueDate: "all",
      search: "",
      sort: "updatedAt",
      order: "desc",
    });
  };
  
  // Handle task click
  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };
  
  // Get workspace name by ID
  const getWorkspaceName = (workspace: Workspace | string) => {
    if (!workspace) return "Unknown Workspace";
    if (typeof workspace === 'string') {
      const found = workspaces.find(w => w._id === workspace);
      return found?.name || "Unknown Workspace";
    }
    return workspace.name || "Unknown Workspace";
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            {tasks?.length || 0} tasks {filters.workspace !== 'all' ? `in ${getWorkspaceName(filters.workspace)}` : 'across all workspaces'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView(view === "list" ? "grid" : "list")}
            title={view === "list" ? "Switch to grid view" : "Switch to list view"}
          >
            {view === "list" ? <Grid size={16} /> : <List size={16} />}
          </Button>
          
          <Button
            onClick={() => setIsCreateTaskOpen(true)}
            leftIcon={<Plus size={16} />}
          >
            New Task
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => updateFilters('search', e.target.value)}
              leftIcon={<Search size={16} />}
              className="w-full"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 md:flex-nowrap">
            {/* Workspace filter */}
            <Select
              options={[
                { label: "All Workspaces", value: "all" },
                ...workspaces.map(w => ({ label: w.name, value: w._id }))
              ]}
              value={filters.workspace}
              onChange={(value) => updateFilters('workspace', value)}
              placeholder="Workspace"
              className="w-40"
            />
            
            {/* Status filter */}
            <Select
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Not Started", value: "todo" },
                { label: "In Progress", value: "in-progress" },
                { label: "Completed", value: "completed" },
                { label: "Archived", value: "archived" }
              ]}
              value={filters.status}
              onChange={(value) => updateFilters('status', value)}
              placeholder="Status"
              className="w-40"
            />
            
            {/* Priority filter */}
            <Select
              options={[
                { label: "All Priorities", value: "all" },
                { label: "Urgent", value: "urgent" },
                { label: "High", value: "high" },
                { label: "Medium", value: "medium" },
                { label: "Low", value: "low" }
              ]}
              value={filters.priority}
              onChange={(value) => updateFilters('priority', value)}
              placeholder="Priority"
              className="w-40"
            />
            
            {/* Due date filter */}
            <Select
              options={[
                { label: "All Dates", value: "all" },
                { label: "Overdue", value: "overdue" },
                { label: "Today", value: "today" },
                { label: "Upcoming (7 days)", value: "upcoming" }
              ]}
              value={filters.dueDate}
              onChange={(value) => updateFilters('dueDate', value)}
              placeholder="Due Date"
              className="w-40"
            />
            
            {/* Sort filter */}
            <Select
              options={[
                { label: "Last Updated", value: "updatedAt" },
                { label: "Name", value: "title" },
                { label: "Due Date", value: "dueDate" },
                { label: "Priority", value: "priority" },
                { label: "Date Created", value: "createdAt" }
              ]}
              value={filters.sort}
              onChange={(value) => updateFilters('sort', value)}
              placeholder="Sort By"
              className="w-40"
            />
          </div>
        </div>
        
        {/* Active filters summary */}
        {(filters.workspace !== "all" || filters.status !== "all" || filters.priority !== "all" || filters.dueDate !== "all" || filters.search) && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
            
            {filters.workspace !== "all" && (
              <div className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-700">
                Workspace: {getWorkspaceName(filters.workspace)}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 p-0 h-auto"
                  onClick={() => updateFilters('workspace', 'all')}
                >
                  <X size={12} />
                </Button>
              </div>
            )}
            
            {filters.status !== "all" && (
              <div className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-700">
                Status: {filters.status}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 p-0 h-auto"
                  onClick={() => updateFilters('status', 'all')}
                >
                  <X size={12} />
                </Button>
              </div>
            )}
            
            {filters.priority !== "all" && (
              <div className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-700">
                Priority: {filters.priority}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 p-0 h-auto"
                  onClick={() => updateFilters('priority', 'all')}
                >
                  <X size={12} />
                </Button>
              </div>
            )}
            
            {filters.dueDate !== "all" && (
              <div className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-700">
                Due date: {filters.dueDate}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 p-0 h-auto"
                  onClick={() => updateFilters('dueDate', 'all')}
                >
                  <X size={12} />
                </Button>
              </div>
            )}
            
            {filters.search && (
              <div className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-700">
                Search: {filters.search}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 p-0 h-auto"
                  onClick={() => updateFilters('search', '')}
                >
                  <X size={12} />
                </Button>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-xs"
              onClick={resetFilters}
            >
              Reset filters
            </Button>
          </div>
        )}
      </div>
      
      {/* Tasks List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Simple header without bulk actions */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm font-medium">All Tasks</div>
          <div className="text-sm text-gray-500">
            {tasks?.length || 0} {(tasks?.length || 0) === 1 ? "task" : "tasks"}
          </div>
        </div>
        
        {/* Tasks */}
        {tasksResult.isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (!tasks || tasks.length === 0) ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {(filters.workspace !== "all" || filters.status !== "all" || filters.priority !== "all" || 
               filters.dueDate !== "all" || filters.search) ? 
                "Try adjusting your filters or search query" : 
                "Start by creating your first task"
              }
            </p>
            <Button
              onClick={() => setIsCreateTaskOpen(true)}
              leftIcon={<Plus size={16} />}
            >
              New Task
            </Button>
          </div>
        ) : view === "list" ? (
          // List view
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workspace</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                  <th className="w-10 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {Array.isArray(tasks) && tasks.map((task) => (
                  <tr 
                    key={task._id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                    onClick={() => handleTaskClick(task._id)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className={cn(
                            "font-medium", 
                            task.status === "completed" && "line-through text-gray-400"
                          )}>
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                              {task.description.length > 100 ? 
                                `${task.description.substring(0, 100)}...` : 
                                task.description
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <TaskStatusBadge status={task.status as TaskStatus} />
                    </td>
                    <td className="px-4 py-4">
                      <TaskPriorityBadge priority={task.priority as TaskPriority} />
                    </td>
                    <td className="px-4 py-4">
                      {task.dueDate ? (
                        <div className="flex items-center">
                          <Clock size={14} className={cn(
                            "mr-2", 
                            isToday(new Date(task.dueDate)) ? "text-blue-500" :
                            new Date(task.dueDate) < new Date() && task.status !== "completed" ? 
                              "text-red-500" : "text-gray-400"
                          )} />
                          <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {task.workspaceId ? (
                        <div className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-opacity-20" 
                             style={{ 
                               backgroundColor: `${typeof task.workspaceId === 'object' ? (task.workspaceId as Workspace).color : '#6366F1'}20`,
                               color: typeof task.workspaceId === 'object' ? (task.workspaceId as Workspace).color : '#6366F1'
                             }}>
                          {getWorkspaceName(task.workspaceId)}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {task.assigneeId ? (
                        <div className="flex items-center">
                          <Avatar 
                            src={task.assigneeId.avatar} 
                            name={`${task.assigneeId.firstName} ${task.assigneeId.lastName}`}
                            size="sm"
                          />
                          <span className="ml-2 text-sm">
                            {task.assigneeId.firstName} {task.assigneeId.lastName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-4 w-10">
                      {/* Actions menu */}
                      <TaskActionMenu 
                        task={task}
                        onEdit={() => setEditTaskId(task._id)}
                        onDelete={() => setDeleteTaskId(task._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Grid view
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(tasks) && tasks.map((task) => (
              <div 
                key={task._id} 
                className="border rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200"
                onClick={() => handleTaskClick(task._id)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className={cn(
                      "font-medium truncate max-w-[300px]", 
                      task.status === "completed" && "line-through text-gray-400"
                    )}>
                      {task.title}
                    </div>
                    <div className="flex items-center">
                      <TaskActionMenu 
                        task={task}
                        onEdit={() => setEditTaskId(task._id)}
                        onDelete={() => setDeleteTaskId(task._id)}
                      />
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <TaskStatusBadge status={task.status as TaskStatus} size="sm" />
                    <TaskPriorityBadge priority={task.priority as TaskPriority} size="sm" />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      {task.dueDate ? (
                        <div className="flex items-center">
                          <Clock size={12} className="mr-1" />
                          <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                        </div>
                      ) : (
                        <span>No due date</span>
                      )}
                    </div>
                    
                    <div>
                      {task.assigneeId ? (
                        <Avatar 
                          src={task.assigneeId.avatar} 
                          name={`${task.assigneeId.firstName} ${task.assigneeId.lastName}`}
                          size="sm"
                        />
                      ) : (
                        <span>Unassigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Dialogs and modals */}
      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        defaultWorkspaceId={filters.workspace !== "all" ? filters.workspace : undefined}
        onSuccess={() => {
          setFilters({...filters});
        }}
      />
      
      {editTaskId && (
        <EditTaskModal
          open={!!editTaskId}
          onOpenChange={() => setEditTaskId(null)}
          taskId={editTaskId}
          onSuccess={() => {
            setFilters({...filters});
            setEditTaskId(null);
          }}
        />
      )}
      
      {deleteTaskId && (
        <DeleteTaskModal
          open={!!deleteTaskId}
          onOpenChange={() => setDeleteTaskId(null)}
          taskId={deleteTaskId}
          onSuccess={() => {
            setFilters({...filters});
            setDeleteTaskId(null);
          }}
        />
      )}
    </div>
  );
};

export default TasksList;