import { model, Schema, Document } from "mongoose";
import { IWorkspace } from "../types/types";

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: [true, "Please provide a workspace name"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPersonal: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: "#6366F1", // Default color - indigo
    },
    icon: {
      type: String,
      default: "folder",
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    settings: {
      defaultView: {
        type: String,
        enum: ["list", "board", "calendar", "timeline", "mindmap"],
        default: "list",
      },
      taskSort: {
        type: String,
        enum: ["position", "priority", "dueDate", "title", "createdAt"],
        default: "position",
      },
      taskSortDirection: {
        type: String,
        enum: ["asc", "desc"],
        default: "asc", 
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

workspaceSchema.index({ ownerId: 1 });
workspaceSchema.index({ name: 1, ownerId: 1 }, { unique: true });

// Virtual for members
workspaceSchema.virtual('members', {
  ref: 'WorkspaceMember',
  localField: '_id',
  foreignField: 'workspaceId'
});

// Virtual for tasks
workspaceSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'workspaceId',
  match: { parentId: null } // Only root tasks
});

export const Workspace = model<IWorkspace>("Workspace", workspaceSchema);