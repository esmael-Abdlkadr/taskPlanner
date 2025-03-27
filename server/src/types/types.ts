import { Document, Types } from "mongoose";
import { Schema } from "zod";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  isActive: boolean;
  password: string;
  otp?: string;
  otpExpires?: Date;
  avatar?: string;
  preferences: {
    theme: string;
    notifications: boolean;
  };
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
  isResetTokenValid(): boolean;
  isOtpValid(): boolean;
}

export interface ITask extends Document {
  title: string;
  description?: string;
  status: "not-started" | "in-progress" | "completed" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  parentId: ITask["_id"] | null;
  path: ITask["_id"][];
  depth: number;
  position: number;
  ownerId: IUser["_id"];
  assigneeId?: IUser["_id"] | null;
  workspaceId: IWorkspace["_id"];
  dueDate?: Date;
  startDate?: Date;
  completedAt?: Date;
  estimatedTime?: number;
  actualTime?: number;
  isRecurring: boolean;
  categoryId: Types.ObjectId;
  isFavorite: boolean;
  recurringPattern?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    endDate?: Date;
  };
  isCompleted(): boolean;
  isOverdue(): boolean;
}

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  ownerId: IUser["_id"];
  isPersonal: boolean;
  color: string;
  icon: string;
  isArchived: boolean;
  settings: {
    defaultView: "list" | "board" | "calendar" | "timeline" | "mindmap";
    taskSort: "position" | "priority" | "dueDate" | "title" | "createdAt";
    taskSortDirection: "asc" | "desc";
  };
}

export interface IWorkspaceMember extends Document {
  workspaceId: IWorkspace["_id"];
  userId: IUser["_id"];
  role: "owner" | "admin" | "member" | "guest";
  joinedAt: Date;
  invitedBy?: IUser["_id"];
}

export interface IComment extends Document {
  taskId: ITask["_id"];
  userId: IUser["_id"];
  content: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  mentions?: IUser["_id"][];
  parentId?: IComment["_id"] | null;
}

export interface ITag extends Document {
  name: string;
  color: string;
  workspaceId: IWorkspace["_id"];
}

export interface ITaskTag extends Document {
  taskId: ITask["_id"];
  tagId: ITag["_id"];
}

export interface IActivityLog extends Document {
  entityId: Document["_id"];
  entityType: "task" | "workspace" | "user" | "comment";
  userId: IUser["_id"];
  action: string;
  details?: Record<string, any>;
}

export interface ITemplate extends Document {
  name: string;
  description?: string;
  structure: any;
  workspaceId?: IWorkspace["_id"] | null;
  isPublic: boolean;
  userId: IUser["_id"];
  category: "project" | "personal" | "meeting" | "other";
}

export interface ICategory extends Document {
  name: string;
  icon: string; // Icon identifier or name
  color: string; // HEX color code
  description?: string;
  isDefault: boolean; // Pre-defined vs user-created
  ownerId: Types.ObjectId; // Who created this category (null for pre-defined)
  createdAt: Date;
  updatedAt: Date;
}
