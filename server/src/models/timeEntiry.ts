import mongoose, { Document, Schema } from "mongoose";
import { TimeEntry } from "../types/types";

const timeEntrySchema = new Schema<TimeEntry>(
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
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: 0,
    },
    isPomodoro: {
      type: Boolean,
      default: false,
    },
    pomodoroConfig: {
      workDuration: {
        type: Number,
        default: 25, // Default Pomodoro is 25 minutes
      },
      breakDuration: {
        type: Number,
        default: 5, // Default break is 5 minutes
      },
      longBreakDuration: {
        type: Number,
        default: 15, // Default long break is 15 minutes
      },
      cycles: {
        type: Number,
        default: 4, // Default 4 cycles before long break
      },
    },
    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      default: "active",
    },
    pausedDuration: {
      type: Number,
      default: 0,
    },
    lastPausedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);
timeEntrySchema.index({ taskId: 1, userId: 1, startTime: -1 });
timeEntrySchema.index({ userId: 1, startTime: -1 });
timeEntrySchema.index({ status: 1 });

const TimeEntryModel = mongoose.model<TimeEntry>("TimeEntry", timeEntrySchema);

export default TimeEntryModel;
