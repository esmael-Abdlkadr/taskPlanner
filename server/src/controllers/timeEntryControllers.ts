import TimeEntryModel from "../models/timeEntiry";
import asyncHandler from "../utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
import HttpError from "../utils/httpError";
import mongoose from "mongoose";

export const startTime = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { taskId, isPomodoro, pomodoroConfig } = req.body;
      if (!req.user) {
        return next(
          new HttpError("You need to be logged in to start a time entry", 401)
        );
      }
      const activeEntry = await TimeEntryModel.findOne({
        userId: req.user._id,
        status: { $in: ["active", "paused"] },
      });
      if (activeEntry) {
        return next(
          new HttpError(
            "You already have an active time entry. Please stop it first.",
            400
          )
        );
      }

      const newTimeEntry = new TimeEntryModel({
        taskId,
        userId: req.user._id,
        startTime: new Date(),
        isPomodoro,
        pomodoroConfig: isPomodoro ? pomodoroConfig : undefined,
        status: "active",
      });

      await newTimeEntry.save();

      return res.status(201).json({
        status: "success",
        data: {
          timeEntry: newTimeEntry,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export const pauseTimeEntry = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { timeEntryId } = req.params;

      const timeEntry = await TimeEntryModel.findOne({
        _id: timeEntryId,
        userId: req.user?._id,
        status: "active",
      });

      if (!timeEntry) {
        return next(new HttpError("Time entry not found", 404));
      }

      timeEntry.status = "paused";
      timeEntry.lastPausedAt = new Date();
      await timeEntry.save();

      return res.status(200).json({
        status: "success",
        data: {
          timeEntry,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export const resumeTimeEntry = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { timeEntryId } = req.params;

      const timeEntry = await TimeEntryModel.findOne({
        _id: timeEntryId,
        userId: req.user?._id,
        status: "paused",
      });

      if (!timeEntry) {
        return next(new HttpError("Time entry not found", 404));
      }

      if (timeEntry.lastPausedAt) {
        const pausedDuration = Math.floor(
          (new Date().getTime() - timeEntry.lastPausedAt.getTime()) / 1000
        );
        timeEntry.pausedDuration += pausedDuration;
      }

      timeEntry.status = "active";
      timeEntry.lastPausedAt = null;
      await timeEntry.save();

      return res.status(200).json({
        status: "success",
        data: {
          timeEntry,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export const stopTimeEntry = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { timeEntryId } = req.params;

      const timeEntry = await TimeEntryModel.findOne({
        _id: timeEntryId,
        userId: req.user?._id,
        status: { $in: ["active", "paused"] },
      });

      if (!timeEntry) {
        return next(new HttpError("Time entry not found", 404));
      }

      // Calculate additional paused duration if currently paused
      if (timeEntry.status === "paused" && timeEntry.lastPausedAt) {
        const pausedDuration = Math.floor(
          (new Date().getTime() - timeEntry.lastPausedAt.getTime()) / 1000
        );
        timeEntry.pausedDuration += pausedDuration;
      }

      const endTime = new Date();
      timeEntry.endTime = endTime;
      timeEntry.status = "completed";

      // Calculate total duration excluding pauses
      const totalDurationInSeconds = Math.floor(
        (endTime.getTime() - timeEntry.startTime.getTime()) / 1000
      );
      timeEntry.duration = totalDurationInSeconds - timeEntry.pausedDuration;

      await timeEntry.save();

      return res.status(200).json({
        status: "success",
        data: {
          timeEntry,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export const getTaskTimeEntries = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { taskId } = req.params;

      const timeEntries = await TimeEntryModel.find({
        taskId,
        userId: req.user?._id,
      })
        .sort({ startTime: -1 })
        .exec();

      return res.status(200).json({
        status: "success",
        data: {
          timeEntries,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get all time entries for a user
export const getUserTimeEntries = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit = 20, offset = 0 } = req.query;

      const timeEntries = await TimeEntryModel.find({
        userId: req.user?._id,
      })
        .sort({ startTime: -1 })
        .skip(Number(offset))
        .limit(Number(limit))
        .populate("taskId", "title")
        .exec();

      const total = await TimeEntryModel.countDocuments({
        userId: req.user?._id,
      });

      return res.status(200).json({
        status: "success",
        data: {
          timeEntries,
          pagination: {
            total,
            limit: Number(limit),
            offset: Number(offset),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get user's active time entry if any
export const getActiveTimeEntry = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activeEntry = await TimeEntryModel.findOne({
        userId: req.user?._id,
        status: { $in: ["active", "paused"] },
      }).populate("taskId", "title");

      return res.status(200).json({
        status: "success",
        data: {
          activeTimeEntry: activeEntry,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get time stats/analytics
export const getTimeStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { period = "week" } = req.query;

      let startDate = new Date();

      // Calculate start date based on period
      switch (period) {
        case "day":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(startDate.getDate() - startDate.getDay());
          startDate.setHours(0, 0, 0, 0);
          break;
        case "month":
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      // Aggregate total time spent by task
      const taskStats = await TimeEntryModel.aggregate([
        {
          $match: {
            userId: req.user?._id,
            status: "completed",
            startTime: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: "$taskId",
            totalTime: { $sum: "$duration" },
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "tasks",
            localField: "_id",
            foreignField: "_id",
            as: "taskDetails",
          },
        },
        {
          $unwind: "$taskDetails",
        },
        {
          $project: {
            taskId: "$_id",
            title: "$taskDetails.title",
            totalTime: 1,
            count: 1,
          },
        },
        {
          $sort: { totalTime: -1 },
        },
      ]);

      // Calculate daily totals
      const dailyStats = await TimeEntryModel.aggregate([
        {
          $match: {
            userId: req.user?._id,
            status: "completed",
            startTime: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$startTime" },
            },
            totalTime: { $sum: "$duration" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      return res.status(200).json({
        status: "success",
        data: {
          taskStats,
          dailyStats,
          period,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
