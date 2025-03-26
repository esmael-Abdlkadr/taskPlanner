import { model, Schema, Document } from "mongoose";
import { ITask } from "../types/types";

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Please provide a task title"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed", "archived"],
      default: "not-started",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    path: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
    depth: {
      type: Number,
      default: 0,
    },
    position: {
      type: Number,
      default: 0,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    dueDate: Date,
    startDate: Date,
    completedAt: Date,
    estimatedTime: Number, // minutes
    actualTime: Number, // minutes
    },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
taskSchema.index({ parentId: 1 });
taskSchema.index({ workspaceId: 1 });
taskSchema.index({ ownerId: 1 });
taskSchema.index({ path: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });

// Virtual for getting subtasks
taskSchema.virtual('subtasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'parentId',
  options: { sort: { position: 1 } }
});

// Pre-save middleware to update path and depth
taskSchema.pre<ITask & Document>('save', async function(next) {
  try {
    if (this.isNew || this.isModified('parentId')) {
      if (!this.parentId) {
        // Root task
        this.path = [];
        this.depth = 0;
      } else {
        // Subtask - find parent and update path
        const parentTask = await model('Task').findById(this.parentId);
        if (parentTask) {
          this.path = [...parentTask.path, parentTask._id];
          this.depth = parentTask.path.length + 1;
        }
      }
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Methods
taskSchema.methods.isCompleted = function() {
  return this.status === 'completed';
};

taskSchema.methods.isOverdue = function() {
  return this.dueDate && new Date() > this.dueDate && this.status !== 'completed';
};

export const Task = model<ITask>("Task", taskSchema);