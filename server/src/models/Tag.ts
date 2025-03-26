import { model, Schema } from "mongoose";
import { ITag } from "../types/types";

const tagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: [true, "Please provide a tag name"],
      trim: true,
    },
    color: {
      type: String,
      default: "#3B82F6", // Default color - blue
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

tagSchema.index({ name: 1, workspaceId: 1 }, { unique: true });
tagSchema.index({ workspaceId: 1 });

export const Tag = model<ITag>("Tag", tagSchema);