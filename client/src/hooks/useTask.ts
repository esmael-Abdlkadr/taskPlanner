import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
      // Double-check that workspaceId is valid before making the API call
      if (!workspaceId) {
        throw new Error("Workspace ID is required");
      }
      return taskService.getWorkspaceTasks(workspaceId, filter);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!workspaceId && options.enabled !== false, // Only run when we have a workspaceId
  });
};
export const useTask = (taskId: string) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => taskService.getTaskById(taskId),
    enabled: !!taskId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSubtasks = (parentId: string) => {
  return useQuery({
    queryKey: ["subtasks", parentId],
    queryFn: () => taskService.getSubtasks(parentId),
    enabled: !!parentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData: CreateTaskDto) => taskService.createTask(taskData),
    onSuccess: (data, variables) => {
      // Invalidate workspace tasks
      queryClient.invalidateQueries({
        queryKey: ["workspace-tasks", variables.workspaceId],
      });

      // If it's a subtask, invalidate parent's subtasks
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
    onSuccess: (updatedTask, variables) => {
      // Update the task in the cache
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });

      // Get the current task data to check if parentId changed
      const task = queryClient.getQueryData<{ task: Task }>(["task", taskId]);

      // If workspaceId is provided or we know the task's workspace,
      // invalidate workspace tasks
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

// Helper hooks that use the toggle hook internally
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
    onSuccess: (updatedTask, { taskId, options }) => {
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
        updatedTask.favorites
          ? "Task added to favorites"
          : "Task removed from favorites"
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update favorite status");
    },
  });
};

// Get favorite tasks
export const useFavoriteTasks = (workspaceId: string) => {
  return useWorkspaceTasks(
    workspaceId,
    { favorites: true },
    { enabled: !!workspaceId }
  );
};
