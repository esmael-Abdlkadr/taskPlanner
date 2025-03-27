import { apiRequest } from "./api";
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilter,
} from "../types/task.types";

export const taskService = {
  getWorkspaceTasks: async (
    workspaceId: string,
    filter: Omit<TaskFilter, "workspaceId"> = {}
  ) => {
    const queryParams = new URLSearchParams();

    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await apiRequest<{ data: Task[] }>({
      method: "GET",
      url: `/workspaces/${workspaceId}/tasks?${queryParams.toString()}`,
    });
    return response.data;
  },

  // Get a specific task by ID
  getTaskById: async (taskId: string) => {
    const response = (await apiRequest<{ data: { data: Task } }>({
      method: "GET",
      url: `/tasks/${taskId}`,
    })) as { data: { data: Task } };

    return response.data;
  },
  toggleFavorite: async (taskId: string) => {
    const response = await apiRequest<{ data: { task: Task  } }>({
      method: "POST",
      url: `/tasks/${taskId}/favorite`,
    });

    return response.data.task;
  },

  // Get subtasks of a task
  getSubtasks: async (parentId: string) => {
    const response = await apiRequest<{ data: { data: Task[] } }>({
      method: "GET",
      url: `/tasks/${parentId}/subtasks`,
    });

    return response.data;
  },

  // Create a new task
  createTask: async (taskData: CreateTaskDto) => {
    const response = await apiRequest<{ data: { data: { task: Task } } }>({
      method: "POST",
      url: "/tasks",
      data: taskData,
    });

    return response.data.data?.task;
  },

  // Update an existing task
  updateTask: async (taskId: string, taskData: UpdateTaskDto) => {
    const response = await apiRequest<{ data:  { task: Task  } }>({
      method: "PUT",
      url: `/tasks/${taskId}`,
      data: taskData,
    });
    console.log("taskid",taskId)

    return response.data.task;
  },

  // Delete a task
  deleteTask: async (taskId: string) => {
    await apiRequest({
      method: "DELETE",
      url: `/tasks/${taskId}`,
    });

    // No need to return anything for successful deletion
  },

  // Move a task
  moveTask: async (
    taskId: string,
    options: {
      workspaceId?: string;
      parentId?: string | null;
      position?: number;
    }
  ) => {
    const response = await apiRequest<{ data: { task: Task  } }>({
      method: "POST",
      url: `/tasks/${taskId}/move`,
      data: options,
    });

    return response.data.task;
  },

  // Get the path for a task (breadcrumb hierarchy)
  getTaskPath: async (taskId: string) => {
    const response = await apiRequest<{ data: { data: { path: string[] } } }>({
      method: "GET",
      url: `/tasks/${taskId}/path`,
    });

    return response.data.data.path;
  },

  // Toggle task completion status
  toggleTaskCompletion: async (taskId: string, completed: boolean) => {
    const response = await apiRequest<{ data: { data: { task: Task } } }>({
      method: "POST",
      url: `/tasks/${taskId}/complete`,
      data: { completed },
    });

    return response.data.data.task;
  },

  // Helper methods that use toggleTaskCompletion internally
  completeTask: async (taskId: string) => {
    return taskService.toggleTaskCompletion(taskId, true);
  },

  reopenTask: async (taskId: string) => {
    return taskService.toggleTaskCompletion(taskId, false);
  },

  getTaskHierarchy: async (taskId: string) => {
    const response = await apiRequest<{ data: any }>({
      method: "GET",
      url: `/tasks/${taskId}/hierarchy`,
    });
    return response.data;
  },
  

};
