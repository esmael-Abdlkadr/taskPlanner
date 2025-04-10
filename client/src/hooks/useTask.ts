import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { taskService } from "../services/taskService";
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilter,
} from "../types/task.types";
import { toast } from "react-hot-toast";

export const useWorkspaceTasks = (
  workspaceId: string | undefined,
  filter: Omit<TaskFilter, "workspaceId"> = {},
  options: { enabled?: boolean } = {}
) => {
  return useQuery({
    queryKey: ["workspace-tasks", workspaceId, filter],
    queryFn: () => {
      if (!workspaceId) {
        throw new Error("Workspace ID is required");
      }
      return taskService.getWorkspaceTasks(workspaceId, filter);
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!workspaceId && options.enabled !== false,
  });
};

export const useTask = (taskId: string) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => taskService.getTaskById(taskId),
    enabled: !!taskId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useSubtasks = (parentId: string) => {
  return useQuery({
    queryKey: ["subtasks", parentId],
    queryFn: () => taskService.getSubtasks(parentId),
    enabled: !!parentId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData: CreateTaskDto) => taskService.createTask(taskData),
    onSuccess: (data, variables) => {
      console.log("data", data);
      queryClient.invalidateQueries({
        queryKey: ["workspace-tasks", variables.workspaceId],
      });

      if (variables.parentId) {
        queryClient.invalidateQueries({
          queryKey: ["subtasks", variables.parentId],
        });
      }

      toast.success("Task created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create task");
    },
  });
};

export const useUpdateTask = (taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData: UpdateTaskDto) =>
      taskService.updateTask(taskId, taskData),
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });

      const task = queryClient.getQueryData<{ task: Task }>(["task", taskId]);

      if (variables.workspaceId || task?.task?.workspaceId) {
        queryClient.invalidateQueries({
          queryKey: [
            "workspace-tasks",
            variables.workspaceId || task?.task?.workspaceId,
          ],
        });
      }

      // If parent task changed, invalidate both old and new parent's subtasks
      const oldParentId = task?.task?.parentId;
      const newParentId = variables.parentId;

      if (oldParentId && oldParentId !== newParentId) {
        queryClient.invalidateQueries({
          queryKey: ["subtasks", oldParentId],
        });
      }

      if (newParentId && newParentId !== oldParentId) {
        queryClient.invalidateQueries({
          queryKey: ["subtasks", newParentId],
        });
      }

      toast.success("Task updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update task");
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    onSuccess: (_, taskId) => {
      const taskData = queryClient.getQueryData<{ task: Task }>([
        "task",
        taskId,
      ]);

      if (taskData?.task) {
        // Invalidate workspace tasks
        if (taskData.task.workspaceId) {
          queryClient.invalidateQueries({
            queryKey: ["workspace-tasks", taskData.task.workspaceId],
          });
        }

        // Invalidate parent's subtasks if this was a subtask
        if (taskData.task.parentId) {
          queryClient.invalidateQueries({
            queryKey: ["subtasks", taskData.task.parentId],
          });
        }
      }

      // Remove task from cache
      queryClient.removeQueries({ queryKey: ["task", taskId] });

      toast.success("Task deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete task");
    },
  });
};

export const useToggleTaskCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      completed,
    }: {
      taskId: string;
      completed: boolean;
    }) => taskService.toggleTaskCompletion(taskId, completed),
    onSuccess: (updatedTask, { taskId }) => {
      // Update task in cache
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });

      // If we know the workspace, invalidate workspace tasks
      if (updatedTask.workspaceId) {
        queryClient.invalidateQueries({
          queryKey: ["workspace-tasks", updatedTask.workspaceId],
        });
      }

      // If it's a subtask, invalidate parent's subtasks
      if (updatedTask.parentId) {
        queryClient.invalidateQueries({
          queryKey: ["subtasks", updatedTask.parentId],
        });
      }

      toast.success(
        updatedTask.status === "completed" ? "Task completed" : "Task reopened"
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update task status");
    },
  });
};

export const useCompleteTask = () => {
  const toggleMutation = useToggleTaskCompletion();

  return {
    ...toggleMutation,
    mutate: (taskId: string) =>
      toggleMutation.mutate({ taskId, completed: true }),
    mutateAsync: async (taskId: string) =>
      toggleMutation.mutateAsync({ taskId, completed: true }),
  };
};

export const useReopenTask = () => {
  const toggleMutation = useToggleTaskCompletion();

  return {
    ...toggleMutation,
    mutate: (taskId: string) =>
      toggleMutation.mutate({ taskId, completed: false }),
    mutateAsync: async (taskId: string) =>
      toggleMutation.mutateAsync({ taskId, completed: false }),
  };
};

export const useTaskPath = (taskId: string) => {
  return useQuery({
    queryKey: ["task-path", taskId],
    queryFn: () => taskService.getTaskPath(taskId),
    enabled: !!taskId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMoveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      options,
    }: {
      taskId: string;
      options: {
        workspaceId?: string;
        parentId?: string | null;
        position?: number;
      };
    }) => taskService.moveTask(taskId, options),
    onSuccess: (_, { taskId, options }) => {
      // Update the specific task
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });

      // Get the task data to know its original workspace/parent
      const taskData = queryClient.getQueryData<{ task: Task }>([
        "task",
        taskId,
      ]);
      const oldWorkspaceId = taskData?.task?.workspaceId;
      const oldParentId = taskData?.task?.parentId;

      // If workspace changed, invalidate both old and new workspace tasks
      if (
        options.workspaceId &&
        oldWorkspaceId &&
        options.workspaceId !== oldWorkspaceId
      ) {
        queryClient.invalidateQueries({
          queryKey: ["workspace-tasks", oldWorkspaceId],
        });
        queryClient.invalidateQueries({
          queryKey: ["workspace-tasks", options.workspaceId],
        });
      } else if (oldWorkspaceId) {
        // Same workspace, just invalidate it
        queryClient.invalidateQueries({
          queryKey: ["workspace-tasks", oldWorkspaceId],
        });
      }

      // If parent changed, invalidate both old and new parent's subtasks
      if (
        options.parentId !== undefined &&
        oldParentId &&
        options.parentId !== oldParentId
      ) {
        queryClient.invalidateQueries({
          queryKey: ["subtasks", oldParentId],
        });
        if (options.parentId) {
          // Not moving to root level
          queryClient.invalidateQueries({
            queryKey: ["subtasks", options.parentId],
          });
        }
      } else if (oldParentId) {
        // Same parent, just invalidate it
        queryClient.invalidateQueries({
          queryKey: ["subtasks", oldParentId],
        });
      }

      toast.success("Task moved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to move task");
    },
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => taskService.toggleFavorite(taskId),
    onSuccess: (updatedTask) => {
      // Update task in cache
      queryClient.invalidateQueries({ queryKey: ["task", updatedTask._id] });

      // Update in workspace tasks lists
      queryClient.invalidateQueries({
        queryKey: ["workspace-tasks", updatedTask.workspaceId],
      });

      // Update favorites list if we implement one
      queryClient.invalidateQueries({ queryKey: ["favorite-tasks"] });

      toast.success(
        updatedTask.isFavorite
          ? "Task added to favorites"
          : "Task removed from favorites"
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update favorite status");
    },
  });
};

export const useFavoriteTasks = (workspaceId: string) => {
  return useWorkspaceTasks(
    workspaceId,
    { favorites: true },
    { enabled: !!workspaceId }
  );
};

export function useAllTasks(filters?: any) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setIsLoading(true);
      try {
        // Ensure we have page and limit
        const queryFilters = {
          ...filters,
          page: filters?.page || 1,
          limit: filters?.limit || 50,
        };
        console.log("Query filters:", queryFilters);
        const response = await taskService.getAllTasks(queryFilters);

        if (isMounted) {
          if (response && response.data) {
            setTasks(Array.isArray(response.data) ? response.data : []);
            setPagination(response.pagination || null);
          } else {
            setTasks([]);
            console.warn("Unexpected response format:", response);
          }
          setError(null);
        }
      } catch (err) {
        console.error("Error in useAllTasks:", err);
        if (isMounted) {
          setError(
            err instanceof Error
              ? err
              : new Error("Unknown error fetching tasks")
          );
          setTasks([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  return {
    data: tasks,
    pagination,
    isLoading,
    error,
  };
}

export const useTaskComments = (taskId: string) => {
  return useQuery<Comment[]>({
    queryKey: ["comments", taskId],
    queryFn: () => taskService.getTaskComments(taskId),
    enabled: !!taskId,
  });
};
