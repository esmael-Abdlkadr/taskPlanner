import { model, Schema } from "mongoose";
import { ITemplate } from "../types/types";

const templateSchema = new Schema<ITemplate>(
  {
    name: {
      type: String,
      required: [true, "Please provide a template name"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    structure: {
      type: Schema.Types.Mixed,
      required: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      default: null, // null means global template
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["project", "personal", "meeting", "other"],
      default: "other"
    },
  },
  {
    timestamps: true,
  }
);

templateSchema.index({ workspaceId: 1 });
templateSchema.index({ userId: 1 });
templateSchema.index({ isPublic: 1 });

export const Template = model<ITemplate>("Template", templateSchema);