export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in-progress",
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

export interface Category {
  _id: string;
  name: string;
  color: string;
  icon: string;
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
  parentId?: string;
  creator: TaskUserRef;
  assigneeId?: TaskUserRef;
  tags: TaskTag[];
  subtasks: Task[];
  depth: number;
  position: number;
  commentCount: number;
  attachmentCount: number;
  isCompleted: boolean;
  completedAt?: string;
  categoryId: Category | string | null;
  isFavorite?: boolean;
  path: string[];
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
  isFavorite?: boolean;
  parentId?: string;
  position?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
  workspaceId?: string;
  parentTaskId?: string | null;
  assigneeId?: string | null;
  tags?: string[];
  categoryId?: string | null; // Allow null values
  isFavorite?: boolean;
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

export interface CommentPayload {
  content: string;
  taskId: string;
  parentId?: string | null;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  mentions?: string[];
}
