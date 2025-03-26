import { model, Schema, Document } from "mongoose";
import { IComment } from "../types/types";

const commentSchema = new Schema<IComment>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Comment cannot be empty"],
      trim: true,
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // null means top-level comment
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

commentSchema.index({ taskId: 1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ parentId: 1 });

// Virtual for replies
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentId'
});

export const Comment = model<IComment>("Comment", commentSchema);