import { model, Schema } from "mongoose";
import { ITaskTag } from "../types/types";

const taskTagSchema = new Schema<ITaskTag>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    tagId: {
      type: Schema.Types.ObjectId,
      ref: "Tag",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

taskTagSchema.index({ taskId: 1, tagId: 1 }, { unique: true });
taskTagSchema.index({ taskId: 1 });
taskTagSchema.index({ tagId: 1 });

export const TaskTag = model<ITaskTag>("TaskTag", taskTagSchema);