import { Response, Request, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler";
import HttpError from "../utils/httpError";
import { Comment } from "../models/Comment";
import { Task } from "../models/Task";
import { Workspace } from "../models/Workspace";
import { ActivityLog } from "../models/ActivityLog";
import { User } from "../models/User";
import { createCommentSchema, updateCommentSchema } from "../validators/validatorSchema";
import notificationService from "../service/notificationService";

/**
 * Get comments for a task
 */
export const getTaskComments = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { taskId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    try {
      // Check if task exists
      const task = await Task.findById(taskId);
      if (!task) {
        return next(new HttpError("Task not found", 404));
      }

      // Check workspace access
      const workspace = await Workspace.findOne({ 
        _id: task.workspaceId,
        $or: [
          { ownerId: userId },
          // Would add a check for workspace members here
        ]
      });

      if (!workspace) {
        return next(new HttpError("Access denied", 403));
      }

      // Get top-level comments
      const comments = await Comment.find({ 
        taskId,
        parentId: null
      })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName avatar')
      .populate({
        path: 'replies',
        options: { sort: { createdAt: 1 } },
        populate: { 
          path: 'userId',
          select: 'firstName lastName avatar'
        }
      });

      res.status(200).json({
        status: 'success',
        data: { comments }
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      return next(new HttpError("Failed to fetch comments", 500));
    }
  }
);

/**
 * Create a comment
 */
export const createComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsedResult = createCommentSchema.safeParse(req.body);
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

    const { content, taskId, parentId, attachments, mentions } = parsedResult.data;

    try {
      // Check if task exists
      const task = await Task.findById(taskId);
      if (!task) {
        return next(new HttpError("Task not found", 404));
      }

      // Check workspace access
      const workspace = await Workspace.findOne({ 
        _id: task.workspaceId,
        $or: [
          { ownerId: userId },
          // Would add a check for workspace members here
        ]
      });

      if (!workspace) {
        return next(new HttpError("Access denied", 403));
      }

      // If it's a reply, check parent exists
      if (parentId) {
        const parentComment = await Comment.findById(parentId);
        if (!parentComment) {
          return next(new HttpError("Parent comment not found", 404));
        }
        if ((parentComment.taskId as any).toString() !== taskId) {
          return next(new HttpError("Parent comment doesn't belong to this task", 400));
        }
      }

      // Create the comment
      const comment = await Comment.create({
        content,
        taskId,
        userId,
        parentId: parentId || null,
        attachments,
        mentions
      });

      // Get populated comment
      const populatedComment = await Comment.findById(comment._id)
        .populate('userId', 'firstName lastName avatar');

      // Log activity
      await ActivityLog.create({
        entityId: task._id,
        entityType: 'task',
        userId,
        action: 'comment',
        details: { 
          taskTitle: task.title,
          commentId: comment._id,
          isReply: !!parentId
        }
      });

      // Send mention notifications if there are mentions
      if (mentions && mentions.length > 0) {
        const authorName = `${user.firstName} ${user.lastName}`;
        
        // Process in background - don't wait for email sending to complete
        notificationService.sendMentionNotifications(
          mentions, 
          content, 
          taskId, 
          authorName
        );
      }

      // Send notification about new comment to task assignee
      if (task.assigneeId && task.assigneeId.toString() !== userId.toString()) {
        const authorName = `${user.firstName} ${user.lastName}`;
        
        // Process in background
        notificationService.sendNewCommentNotification(
          taskId,
          content,
          userId.toString(),
          authorName
        );
      }

      res.status(201).json({
        status: 'success',
        message: 'Comment added successfully',
        data: { comment: populatedComment }
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      return next(new HttpError("Failed to add comment", 500));
    }
  }
);

/**
 * Update a comment
 */
export const updateComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const parsedResult = updateCommentSchema.safeParse(req.body);
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

    const { content, attachments, mentions } = parsedResult.data;

    try {
      // Check if comment exists and belongs to user
      const comment = await Comment.findOne({
        _id: id,
        userId
      });

      if (!comment) {
        return next(new HttpError("Comment not found or you don't have permission to edit it", 404));
      }
      
      // Store original mentions for comparison
      const originalMentions = comment.mentions || [];
      
      // Update the comment
      comment.content = content;
      if (attachments) comment.attachments = attachments;
      if (mentions) comment.mentions = mentions;
      await comment.save();

      // Find new mentions that weren't in the original comment
      const newMentions = mentions ? mentions.filter(m => !originalMentions.includes(m)) : [];

      // Send notifications for new mentions if any
      if (newMentions.length > 0) {
        const authorName = `${user.firstName} ${user.lastName}`;
        
        // Process in background
        notificationService.sendMentionNotifications(
          newMentions, 
          content, 
          String(comment.taskId),
          authorName
        );
      }

      // Get populated comment
      const populatedComment = await Comment.findById(comment._id)
        .populate('userId', 'firstName lastName avatar');

      res.status(200).json({
        status: 'success',
        message: 'Comment updated successfully',
        data: { comment: populatedComment }
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      return next(new HttpError("Failed to update comment", 500));
    }
  }
);

/**
 * Delete a comment
 */
export const deleteComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    try {
      // Check if comment exists and belongs to user
      const comment = await Comment.findOne({
        _id: id,
        userId
      });

      if (!comment) {
        return next(new HttpError("Comment not found or you don't have permission to delete it", 404));
      }

      // If it's a parent comment, delete all replies
      if (!comment.parentId) {
        await Comment.deleteMany({ parentId: comment._id });
      }

      // Delete the comment
      await Comment.findByIdAndDelete(id);

      res.status(200).json({
        status: 'success',
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      return next(new HttpError("Failed to delete comment", 500));
    }
  }
);