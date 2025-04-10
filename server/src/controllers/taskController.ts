import { Response, Request, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler";
import HttpError from "../utils/httpError";
import { Task } from "../models/Task";
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
} from "../validators/validatorSchema";
import { Workspace } from "../models/Workspace";
import { ActivityLog } from "../models/ActivityLog";
import notificationService from "../service/notificationService";
import { WorkspaceMember } from "../models/workSpaceMember";

/**
 * Get tasks for a workspace (root level only by default)
 */
export const getTasks = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { workspaceId } = req.params;
    const {
      parentId,
      status,
      priority,
      dueDate,
      search,
      categoryId,
      favorites,
    } = req.query;
    const userId = req.user?._id;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    // Build query conditions
    const conditions: any = { workspaceId };

    // Filter by parent
    if (parentId === "null" || parentId === undefined) {
      conditions.parentId = null; 
    } else if (parentId) {
      conditions.parentId = parentId; 
    }
    if (status) conditions.status = status;
    if (priority) conditions.priority = priority;
    if (categoryId) conditions.categoryId = categoryId;
    if (favorites === "true") conditions.isFavorite = true;
    if (dueDate === "overdue") {
      conditions.dueDate = { $lt: new Date() };
      conditions.status = { $ne: "completed" };
    } else if (dueDate === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      conditions.dueDate = {
        $gte: today,
        $lt: tomorrow,
      };
    } else if (dueDate === "upcoming") {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      conditions.dueDate = {
        $gt: today,
      };
    }

    if (search) {
      conditions.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return next(new HttpError("Workspace not found", 404));
    }

    const isOwner =
      (workspace.ownerId as string).toString() === userId.toString();

    if (!isOwner) {
      const isMember = await WorkspaceMember.findOne({
        workspaceId,
        userId,
      });

      if (!isMember) {
        return next(
          new HttpError("Access denied: Not a member of this workspace", 403)
        );
      }
    }

    // Get sort settings from workspace
    const sortField = workspace.settings?.taskSort || "position";
    const sortDirection =
      workspace.settings?.taskSortDirection === "desc" ? -1 : 1;
    const sortOptions: any = {};
    sortOptions[sortField] = sortDirection;

    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const tasks = await Task.find(conditions)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate("assigneeId", "firstName lastName avatar")
        .lean();

      const total = await Task.countDocuments(conditions);

      res.status(200).json({
        status: "success",
        data: {
          tasks,
          pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return next(new HttpError("Failed to fetch tasks", 500));
    }
  }
);

/**
 * Get all tasks for the current user across all workspaces
 */
export const getAllTasks = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const {
        status,
        priority,
        dueDate,
        search,
        sort = "updatedAt",
        order = "desc",
        page = 1,
        limit = 50,
        workspace,
      } = req.query;

      console.log("req.query", req.query);

 
      const filter: any = {
        $or: [{ ownerId: userId }, { assigneeId: userId }],
      };

      // Apply optional filters
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (workspace) filter.workspaceId = workspace;

      // Due date filters
      if (dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dueDate === "today") {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          filter.dueDate = { $gte: today, $lt: tomorrow };
        } else if (dueDate === "overdue") {
          filter.dueDate = { $lt: today };
          filter.status = { $ne: "completed" };
        } else if (dueDate === "upcoming") {
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);
          filter.dueDate = { $gt: today, $lte: nextWeek };
        }
      }

    
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }


      const skip = (Number(page) - 1) * Number(limit);


      const sortOptions: any = {};
      sortOptions[sort as string] = order === "asc" ? 1 : -1;

      const tasks = await Task.find(filter)
        .populate("workspaceId", "name color isPersonal")
        .populate("assigneeId", "firstName lastName avatar")
        .populate("categoryId", "name color icon")
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit));

      const total = await Task.countDocuments(filter);
      console.log("data", tasks);
      return res.status(200).json({
        status: "success",
        data: tasks,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * Get a specific task with its subtasks
 */
export const getTask = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    try {
      const task = await Task.findById(id)
        .populate("assigneeId", "firstName lastName avatar")
        .populate("categoryId", "name icon color")
        .populate({
          path: "subtasks",
          options: { sort: { position: 1 } },
          populate: [
            {
              path: "assigneeId",
              select: "firstName lastName avatar",
            },
            {
              path: "categoryId",
              select: "name icon color",
            },
          ],
        });

      if (!task) {
        return next(new HttpError("Task not found", 404));
      }
      const workspace = await Workspace.findById(task.workspaceId);

      if (!workspace) {
        return next(new HttpError("Workspace not found", 404));
      }
      const isOwner =
        (workspace.ownerId as string).toString() === userId.toString();

      if (!isOwner) {
        const isMember = await WorkspaceMember.findOne({
          workspaceId: task.workspaceId,
          userId,
        });

        if (!isMember) {
          return next(
            new HttpError("Access denied: Not a member of this workspace", 403)
          );
        }
      }


      let parentTask = null;
      if (task.parentId) {
        parentTask = await Task.findById(task.parentId).select("_id title");
      }

      res.status(200).json({
        status: "success",
        data: {
          task,
          parentTask,
        },
      });
    } catch (error) {
      console.error("Error fetching task:", error);
      return next(new HttpError("Failed to fetch task details", 500));
    }
  }
);

/**
 * Create a new task
 */
export const createTask = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsedResult = createTaskSchema.safeParse(req.body);
    if (!parsedResult.success) {
      const errorMessages = parsedResult.error.errors
        .map((err) => err.message)
        .join(", ");
      return next(new HttpError(errorMessages, 400));
    }

    const userId = req.user?._id;
    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    const {
      title,
      description,
      status = "todo",
      priority = "medium",
      parentId,
      workspaceId,
      position,
      dueDate,
      startDate,
      estimatedTime,
      assigneeId,
    } = parsedResult.data;

    try {
      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        return next(new HttpError("Workspace not found", 404));
      }

      const isOwner =
        (workspace.ownerId as string).toString() === userId.toString();

      if (!isOwner) {
        const isMember = await WorkspaceMember.findOne({
          workspaceId,
          userId,
        });

        if (!isMember) {
          return next(
            new HttpError("Access denied: Not a member of this workspace", 403)
          );
        }
      }

      if (parentId) {
        const parentTask = await Task.findById(parentId);
        if (!parentTask) {
          return next(new HttpError("Parent task not found", 404));
        }
        if (String(parentTask.workspaceId) !== workspaceId) {
          return next(
            new HttpError("Parent task must be in the same workspace", 400)
          );
        }
      }

      // Find max position for ordering if not provided
      let taskPosition = position;
      if (taskPosition === undefined) {
        const lastTask = await Task.findOne({
          workspaceId,
          parentId: parentId || null,
        }).sort({ position: -1 });

        taskPosition = lastTask ? lastTask.position + 1000 : 1000;
      }


      const task = await Task.create({
        title,
        description,
        status,
        priority,
        parentId: parentId || null,
        workspaceId,
        position: taskPosition,
        ownerId: userId,
        assigneeId: assigneeId || userId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        estimatedTime,
      });

  
      await ActivityLog.create({
        entityId: task._id,
        entityType: "task",
        userId,
        action: "create",
        details: { title: task.title },
      });

      const populatedTask = await Task.findById(task._id).populate(
        "assigneeId",
        "firstName lastName avatar"
      );

      res.status(201).json({
        status: "success",
        message: "Task created successfully",
        data: { task: populatedTask },
      });
    } catch (error) {
      console.error("Error creating task:", error);
      return next(new HttpError("Failed to create task", 500));
    }
  }
);

/**
 * Update a task
 */

export const toggleFavorite = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    try {
 
      const task = await Task.findById(id);
      if (!task) {
        return next(new HttpError("Task not found", 404));
      }

      const workspace = await Workspace.findById(task.workspaceId);

      if (!workspace) {
        return next(new HttpError("Workspace not found", 404));
      }

      const isOwner =
        (workspace.ownerId as string).toString() === userId.toString();

      if (!isOwner) {

        const isMember = await WorkspaceMember.findOne({
          workspaceId: task.workspaceId,
          userId,
        });

        if (!isMember) {
          return next(
            new HttpError("Access denied: Not a member of this workspace", 403)
          );
        }
      }

  
      const isFavorite = !task.isFavorite;

      const updatedTask = await Task.findByIdAndUpdate(
        id,
        { isFavorite },
        { new: true, runValidators: true }
      )
        .populate("assigneeId", "firstName lastName avatar")
        .populate("categoryId", "name icon color");

      await ActivityLog.create({
        entityId: task._id,
        entityType: "task",
        userId,
        action: isFavorite ? "favorite" : "unfavorite",
        details: { title: task.title },
      });

      res.status(200).json({
        status: "success",
        message: isFavorite
          ? "Task added to favorites"
          : "Task removed from favorites",
        data: { task: updatedTask },
      });
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      return next(new HttpError("Failed to update favorite status", 500));
    }
  }
);

export const updateTask = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const parsedResult = updateTaskSchema.safeParse(req.body);
    if (!parsedResult.success) {
      const errorMessages = parsedResult.error.errors
        .map((err) => err.message)
        .join(", ");
      return next(new HttpError(errorMessages, 400));
    }

    const userId = req.user?._id;
    const user = req.user;

    if (!userId || !user) {
      return next(new HttpError("Authentication required", 401));
    }

    try {
      const task = await Task.findById(id);
      if (!task) {
        return next(new HttpError("Task not found", 404));
      }

      const workspace = await Workspace.findById(task.workspaceId);

      if (!workspace) {
        return next(new HttpError("Workspace not found", 404));
      }

      const isOwner =
        (workspace.ownerId as string).toString() === userId.toString();

      if (!isOwner) {

        const isMember = await WorkspaceMember.findOne({
          workspaceId: task.workspaceId,
          userId,
        });

        if (!isMember) {
          return next(
            new HttpError("Access denied: Not a member of this workspace", 403)
          );
        }
      }

      const isBeingCompleted =
        parsedResult.data.status === "completed" && task.status !== "completed";

      const isBeingReopened =
        parsedResult.data.status !== "completed" && task.status === "completed";

      const updateData: any = { ...parsedResult.data };

      if (isBeingCompleted) {
        updateData.completedAt = new Date();
      } else if (isBeingReopened) {
        updateData.completedAt = null;
      }

      if (
        updateData.parentId &&
        updateData.parentId !== task.parentId?.toString()
      ) {
        if (updateData.parentId === String(task._id)) {
          return next(new HttpError("A task cannot be its own parent", 400));
        }

        const parentTask = await Task.findById(updateData.parentId);
        if (!parentTask) {
          return next(new HttpError("Parent task not found", 404));
        }
        if (String(parentTask.workspaceId) !== String(task.workspaceId)) {
          return next(
            new HttpError("Parent task must be in the same workspace", 400)
          );
        }
      }

      const updatedTask = await Task.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate("assigneeId", "firstName lastName avatar");

      if (!updatedTask) {
        return next(new HttpError("Failed to update task", 500));
      }

      await ActivityLog.create({
        entityId: task._id,
        entityType: "task",
        userId,
        action: "update",
        details: { title: task.title, changes: updateData },
      });

      const authorName = `${user.firstName} ${user.lastName}`;

      // 1. Assignment Change Notification
      if (
        updateData.assigneeId &&
        (!task.assigneeId ||
          updateData.assigneeId !== task.assigneeId.toString())
      ) {
        // Send email notification to the new assignee
        notificationService.sendTaskAssignmentNotification(
          id,
          updateData.assigneeId,
          authorName
        );
      }

      // 2. Due Date Change Notification (if made shorter/more urgent)
      if (
        updateData.dueDate &&
        (!task.dueDate || new Date(updateData.dueDate) < task.dueDate) &&
        updatedTask.assigneeId &&
        updatedTask.assigneeId &&
        typeof updatedTask.assigneeId === "object" &&
        "._id" in updatedTask.assigneeId &&
        (
          updatedTask.assigneeId as unknown as { _id: string }
        )._id.toString() !== userId.toString()
      ) {
        // Send due date change notification to assignee
        const daysRemaining = Math.ceil(
          (new Date(updateData.dueDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysRemaining <= 7) {
          // Only notify if due soon
          notificationService.sendDueDateReminder(
            id,
            (
              updatedTask.assigneeId as unknown as { _id: string }
            )._id.toString(),
            daysRemaining
          );
        }
      }

      // 3. Status Change Notification
      if (
        updateData.status &&
        updateData.status !== task.status &&
        String(task.ownerId) !== userId.toString() &&
        String(task.ownerId) !==
          (task.assigneeId ? task.assigneeId.toString() : null)
      ) {
        // Add status change notification logic here
      }

      res.status(200).json({
        status: "success",
        message: "Task updated successfully",
        data: { task: updatedTask },
      });
    } catch (error) {
      console.error("Error updating task:", error);
      return next(new HttpError("Failed to update task", 500));
    }
  }
);

/**
 * Delete a task and all its subtasks
 */
export const deleteTask = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    try {
      const task = await Task.findById(id);
      if (!task) {
        return next(new HttpError("Task not found", 404));
      }

      const workspace = await Workspace.findById(task.workspaceId);

      if (!workspace) {
        return next(new HttpError("Workspace not found", 404));
      }

      const isOwner =
        (workspace.ownerId as string).toString() === userId.toString();

      if (!isOwner) {
        const isMember = await WorkspaceMember.findOne({
          workspaceId: task.workspaceId,
          userId,
        });

        if (!isMember) {
          return next(
            new HttpError("Access denied: Not a member of this workspace", 403)
          );
        }
      }

      if (!workspace) {
        return next(new HttpError("Access denied", 403));
      }
      async function deleteTaskAndChildren(taskId: string) {
        const childTasks = await Task.find({ parentId: taskId });
        for (const childTask of childTasks) {
          await deleteTaskAndChildren(String(childTask._id));
        }

    
        await Task.findByIdAndDelete(taskId);

        await ActivityLog.create({
          entityId: taskId,
          entityType: "task",
          userId,
          action: "delete",
          details: { title: task!.title },
        });
      }

 
      await deleteTaskAndChildren(id);

      res.status(200).json({
        status: "success",
        message: "Task and all subtasks deleted successfully",
      });
    } catch  {

      return next(new HttpError("Failed to delete task", 500));
    }
  }
);

/**
 * Move a task (change parent or position)
 */
export const moveTask = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const parsedResult = moveTaskSchema.safeParse(req.body);
    if (!parsedResult.success) {
      const errorMessages = parsedResult.error.errors
        .map((err) => err.message)
        .join(", ");
      return next(new HttpError(errorMessages, 400));
    }

    const userId = req.user?._id;
    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    const { parentId, position, workspaceId } = parsedResult.data;

    try {
      const task = await Task.findById(id);
      if (!task) {
        return next(new HttpError("Task not found", 404));
      }

      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        return next(new HttpError("Workspace not found", 404));
      }

      const isOwner =
        (workspace.ownerId as string).toString() === userId.toString();

      if (!isOwner) {

        const isMember = await WorkspaceMember.findOne({
          workspaceId,
          userId,
        });

        if (!isMember) {
          return next(
            new HttpError("Access denied: Not a member of this workspace", 403)
          );
        }
      }


      if (workspaceId && workspaceId !== String(task.workspaceId)) {
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
          return next(new HttpError("Workspace not found", 404));
        }
  
        const isOwner =
          (workspace.ownerId as string).toString() === userId.toString();
  
        if (!isOwner) {
  
          const isMember = await WorkspaceMember.findOne({
            workspaceId,
            userId,
          });
  
          if (!isMember) {
            return next(
              new HttpError("Access denied: Not a member of this workspace", 403)
            );
          }
        }
  
      }


      if (parentId && parentId !== "null") {
        // Prevent circular references
        if (parentId === String(task._id)) {
          return next(new HttpError("A task cannot be its own parent", 400));
        }

        const parentTask = await Task.findById(parentId);
        if (!parentTask) {
          return next(new HttpError("Parent task not found", 404));
        }

 
        if (
          String(parentTask.workspaceId) !== String(task.workspaceId) &&
          !workspaceId
        ) {
          return next(
            new HttpError("Parent task is in a different workspace", 400)
          );
        }
      }


      const updateData: any = {};


      if (parentId === "null") {
        updateData.parentId = null;
      } else if (parentId) {
        updateData.parentId = parentId;
      }


      if (position !== undefined) {
        updateData.position = position;
      }


      if (workspaceId) {
        updateData.workspaceId = workspaceId;
      }


      const updatedTask = await Task.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updatedTask) {
        return next(new HttpError("Failed to move task", 500));
      }


      await ActivityLog.create({
        entityId: task._id,
        entityType: "task",
        userId,
        action: "move",
        details: { title: task.title, updateData },
      });

      res.status(200).json({
        status: "success",
        message: "Task moved successfully",
        data: { task: updatedTask },
      });
    } catch (error) {
      console.error("Error moving task:", error);
      return next(new HttpError("Failed to move task", 500));
    }
  }
);

/**
 * Get task hierarchy (path from root to task)
 */
export const getTaskPath = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    try {
      const task = await Task.findById(id);
      if (!task) {
        return next(new HttpError("Task not found", 404));
      }
      const workspace = await Workspace.findById(task.workspaceId);

      if (!workspace) {
        return next(new HttpError("Workspace not found", 404));
      }


      const isOwner =
        (workspace.ownerId as string).toString() === userId.toString();

      if (!isOwner) {
  
        const isMember = await WorkspaceMember.findOne({
          workspaceId: task.workspaceId,
          userId,
        });

        if (!isMember) {
          return next(
            new HttpError("Access denied: Not a member of this workspace", 403)
          );
        }
      }


      const pathTasks = await Task.find({
        _id: { $in: task.path },
      }).select("_id title");


      const fullPath = [...pathTasks, { _id: task._id, title: task.title }];

      res.status(200).json({
        status: "success",
        data: {
          path: fullPath,
        },
      });
    } catch (error) {
      console.error("Error fetching task path:", error);
      return next(new HttpError("Failed to fetch task path", 500));
    }
  }
);

export const toggleTaskCompletion = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { completed } = req.body;

    if (completed === undefined) {
      return next(new HttpError("Completed status is required", 400));
    }

    const userId = req.user?._id;
    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    try {

      const task = await Task.findById(id);
      if (!task) {
        return next(new HttpError("Task not found", 404));
      }

      const workspace = await Workspace.findById(task.workspaceId);

      if (!workspace) {
        return next(new HttpError("Workspace not found", 404));
      }

 
      const isOwner =
        (workspace.ownerId as string).toString() === userId.toString();

      if (!isOwner) {

        const isMember = await WorkspaceMember.findOne({
          workspaceId: task.workspaceId,
          userId,
        });

        if (!isMember) {
          return next(
            new HttpError("Access denied: Not a member of this workspace", 403)
          );
        }
      }

      const status = completed ? "completed" : "in-progress";
      const completedAt = completed ? new Date() : null;

      const updatedTask = await Task.findByIdAndUpdate(
        id,
        {
          status,
          completedAt,
        },
        { new: true, runValidators: true }
      ).populate("assigneeId", "firstName lastName avatar");

  
      await ActivityLog.create({
        entityId: task._id,
        entityType: "task",
        userId,
        action: completed ? "complete" : "reopen",
        details: { title: task.title },
      });

      res.status(200).json({
        status: "success",
        message: completed ? "Task marked as complete" : "Task reopened",
        data: { task: updatedTask },
      });
    } catch (error) {
      console.error("Error updating task completion status:", error);
      return next(new HttpError("Failed to update task", 500));
    }
  }
);

export const getSubtasks = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { parentId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    if (!parentId) {
      return next(new HttpError("Parent task ID is required", 400));
    }

    try {
   
      const subtasks = await Task.find({ parentId })
        .sort({ position: 1 })
        .populate("assigneeId", "firstName lastName avatar");

      res.status(200).json({
        status: "success",
        data: subtasks,
      });
    } catch (error) {
      console.error("Error fetching subtasks:", error);
      return next(new HttpError("Failed to fetch subtasks", 500));
    }
  }
);
