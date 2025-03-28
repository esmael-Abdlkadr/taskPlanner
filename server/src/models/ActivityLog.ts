import { model, Schema } from "mongoose";
import { IActivityLog } from "../types/types";

const activityLogSchema = new Schema<IActivityLog>(
  {
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    entityType: {
      type: String,
      enum: ["task", "workspace", "user", "comment"],
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "create",
        "update",
        "delete",
        "complete",
        "reopen",
        "move",
        "assign",
        "comment",
        "add_tag",
        "remove_tag",
        "join",
        "leave",
        "favorite",
        "unfavorite",
        "add_member", 
        "remove_member", 
        "update_member", 
      ],

      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ entityId: 1, entityType: 1 });
activityLogSchema.index({ userId: 1 });
activityLogSchema.index({ createdAt: -1 });

export const ActivityLog = model<IActivityLog>(
  "ActivityLog",
  activityLogSchema
);