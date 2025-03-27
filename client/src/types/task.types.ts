export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  DONE = "completed",
  ARCHIVED = "archived",
}

export enum TaskPriority {
LOW = "low",
IN_PROGRESS = "in-progress",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export interface TaskTag {
  _id: string;
  name: string;
  color: string;
  workspaceId: string;
}

export interface TaskComment {
  _id: string;
  content: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAttachment {
  _id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  taskId: string;
  userId: string;
  uploadedAt: string;
}

export interface TaskUserRef {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  isDefault: boolean;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  workspaceId: string;
  parentTaskId?: string;
  creator: TaskUserRef;
  assignee?: TaskUserRef;
  tags: TaskTag[];
  subtasks: Task[];
  commentCount: number;
  attachmentCount: number;
  isCompleted: boolean;
  completedAt?: string;
  categoryId?: string;
  favorites?: boolean;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  workspaceId: string;
  parentTaskId?: string;
  assigneeId?: string;
  tags?: string[];
  categoryId?: string;
  favorites?: boolean;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  workspaceId?: string;
  parentTaskId?: string | null;
  assigneeId?: string | null;
  tags?: string[];
  categoryId?: string;
  favorites?: boolean;
}

export interface TaskFilter {
  workspaceId?: string;
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  assigneeId?: string;
  creatorId?: string;
  parentTaskId?: string;
  tags?: string[];
  dueStartDate?: string;
  dueEndDate?: string;
  search?: string;
  completed?: boolean;
  sort?: string;
  limit?: number;
  page?: number;
  categoryId?: string;
  favorites?: boolean;
}

export interface TaskStats {
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
  dueToday: number;
  dueSoon: number; // Due within next 3 days
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}
