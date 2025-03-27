import { z } from "zod";

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Task Schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z
    .enum(["not-started", "in-progress", "completed", "archived"])
    .optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  parentId: z.string().optional().nullable(),
  position: z.number().optional(),
  dueDate: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  estimatedTime: z.number().optional(),
  assigneeId: z.string().optional().nullable(),
  workspaceId: z.string(),
  categoryId: z.string().optional(),
  isFavorite: z.boolean().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  status: z
    .enum(["not-started", "in-progress", "completed", "archived"])
    .optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  parentId: z.string().optional().nullable(),
  position: z.number().optional(),
  dueDate: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  completedAt: z.string().optional().nullable(),
  estimatedTime: z.number().optional(),
  actualTime: z.number().optional(),
  assigneeId: z.string().optional().nullable(),
  isRecurring: z.boolean().optional(),
  recurringPattern: z
    .object({
      frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
      interval: z.number(),
      endDate: z.string().optional(),
    })
    .optional(),
  categoryId: z.string().optional(),
  isFavorite: z.boolean().optional(),
});

export const moveTaskSchema = z.object({
  parentId: z.string().optional().nullable(),
  position: z.number().optional(),
  workspaceId: z.string().optional(),
});

// Workspace Schemas
export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isPersonal: z.boolean().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  settings: z
    .object({
      defaultView: z
        .enum(["list", "board", "calendar", "timeline", "mindmap"])
        .optional(),
      taskSort: z
        .enum(["position", "priority", "dueDate", "title", "createdAt"])
        .optional(),
      taskSortDirection: z.enum(["asc", "desc"]).optional(),
    })
    .optional(),
});

// Member Schemas
export const addWorkspaceMemberSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.enum(["admin", "member", "guest"]).optional(),
});

export const updateWorkspaceMemberSchema = z.object({
  role: z.enum(["admin", "member", "guest"]),
});

// Comment Schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
  taskId: z.string(),
  parentId: z.string().optional().nullable(),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        type: z.string(),
        size: z.number(),
      })
    )
    .optional(),
  mentions: z.array(z.string()).optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        type: z.string(),
        size: z.number(),
      })
    )
    .optional(),
  mentions: z.array(z.string()).optional(),
});

// Tag Schemas
export const createTagSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  color: z.string().optional(),
  workspaceId: z.string(),
});

export const updateTagSchema = z.object({
  name: z.string().min(1, "Tag name is required").optional(),
  color: z.string().optional(),
});
