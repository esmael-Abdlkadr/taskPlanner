import { Response, Request, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler";
import HttpError from "../utils/httpError";
import { Tag } from "../models/Tag";
import { TaskTag } from "../models/TaskTag";
import { Workspace } from "../models/Workspace";
import { Task } from "../models/Task";
import { ActivityLog } from "../models/ActivityLog";
import { createTagSchema, updateTagSchema } from "../validators/validatorSchema";

/**
 * Get tags for a workspace
 */
export const getWorkspaceTags = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { workspaceId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    try {
      // Check workspace access
      const workspace = await Workspace.findOne({ 
        _id: workspaceId,
        $or: [
          { ownerId: userId },
          // Would add a check for workspace members here
        ]
      });

      if (!workspace) {
        return next(new HttpError("Workspace not found or access denied", 404));
      }

      // Get tags
      const tags = await Tag.find({ workspaceId })
        .sort({ name: 1 });

      // Get usage count for each tag
      const tagCounts = await Promise.all(
        tags.map(async (tag) => {
          const count = await TaskTag.countDocuments({ tagId: tag._id });
          return {
            ...tag.toObject(),
            usageCount: count
          };
        })
      );

      res.status(200).json({
        status: 'success',
        data: { tags: tagCounts }
      });
    } catch (error) {
      console.error('Error fetching tags:', error);
      return next(new HttpError("Failed to fetch tags", 500));
    }
  }
);

/**
 * Get tags for a specific task
 */
export const getTaskTags = asyncHandler(
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

      // Get task tags
      const taskTags = await TaskTag.find({ taskId })
        .populate('tagId');

      // Format the response
      const tags = taskTags.map(tt => tt.tagId);

      res.status(200).json({
        status: 'success',
        data: { tags }
      });
    } catch (error) {
      console.error('Error fetching task tags:', error);
      return next(new HttpError("Failed to fetch task tags", 500));
    }
  }
);

/**
 * Create a tag
 */
export const createTag = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsedResult = createTagSchema.safeParse(req.body);
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

    const { name, color = "#3B82F6", workspaceId } = parsedResult.data;

    try {
      // Check workspace access
      const workspace = await Workspace.findOne({ 
        _id: workspaceId,
        $or: [
          { ownerId: userId },
          // Would add a check for workspace members here
        ]
      });

      if (!workspace) {
        return next(new HttpError("Workspace not found or access denied", 404));
      }

      // Check for duplicate tag name in this workspace
      const existingTag = await Tag.findOne({ 
        name,
        workspaceId
      });

      if (existingTag) {
        return next(new HttpError("A tag with this name already exists in the workspace", 400));
      }

      // Create the tag
      const tag = await Tag.create({
        name,
        color,
        workspaceId
      });

      // Log activity
      await ActivityLog.create({
        entityId: tag._id,
        entityType: 'tag',
        userId,
        action: 'create',
        details: { name: tag.name }
      });

      res.status(201).json({
        status: 'success',
        message: 'Tag created successfully',
        data: { tag }
      });
    } catch (error) {
      console.error('Error creating tag:', error);
      return next(new HttpError("Failed to create tag", 500));
    }
  }
);

/**
 * Update a tag
 */
export const updateTag = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const parsedResult = updateTagSchema.safeParse(req.body);
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

    const { name, color } = parsedResult.data;

    try {
      // Find the tag
      const tag = await Tag.findById(id);
      if (!tag) {
        return next(new HttpError("Tag not found", 404));
      }

      // Check workspace access
      const workspace = await Workspace.findOne({ 
        _id: tag.workspaceId,
        $or: [
          { ownerId: userId },
          // Would add a check for workspace members here
        ]
      });

      if (!workspace) {
        return next(new HttpError("Access denied", 403));
      }

      // Check for duplicate name if changing name
      if (name && name !== tag.name) {
        const existingTag = await Tag.findOne({ 
          name,
          workspaceId: tag.workspaceId,
          _id: { $ne: id }
        });

        if (existingTag) {
          return next(new HttpError("A tag with this name already exists in the workspace", 400));
        }
      }

      // Update the tag
      if (name) tag.name = name;
      if (color) tag.color = color;
      await tag.save();

      // Log activity
      await ActivityLog.create({
        entityId: tag._id,
        entityType: 'tag',
        userId,
        action: 'update',
        details: { name: tag.name }
      });

      res.status(200).json({
        status: 'success',
        message: 'Tag updated successfully',
        data: { tag }
      });
    } catch (error) {
      console.error('Error updating tag:', error);
      return next(new HttpError("Failed to update tag", 500));
    }
  }
);

/**
 * Delete a tag
 */
export const deleteTag = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    try {
      // Find the tag
      const tag = await Tag.findById(id);
      if (!tag) {
        return next(new HttpError("Tag not found", 404));
      }

      // Check workspace access
      const workspace = await Workspace.findOne({ 
        _id: tag.workspaceId,
        $or: [
          { ownerId: userId },
          // Would add a check for workspace members here
        ]
      });

      if (!workspace) {
        return next(new HttpError("Access denied", 403));
      }

      // Store tag info for activity log
      const tagInfo = {
        name: tag.name,
        workspaceId: tag.workspaceId
      };

      // Delete all task associations
      await TaskTag.deleteMany({ tagId: tag._id });

      // Delete the tag
      await Tag.findByIdAndDelete(id);

      // Log activity
      await ActivityLog.create({
        entityId: tag.workspaceId,
        entityType: 'workspace',
        userId,
        action: 'delete_tag',
        details: tagInfo
      });

      res.status(200).json({
        status: 'success',
        message: 'Tag deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting tag:', error);
      return next(new HttpError("Failed to delete tag", 500));
    }
  }
);

/**
 * Add tag to task
 */
export const addTaskTag = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { taskId, tagId } = req.params;
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

      // Check if tag exists
      const tag = await Tag.findById(tagId);
      if (!tag) {
        return next(new HttpError("Tag not found", 404));
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

      // Check if tag and task are in the same workspace
      if (String(tag.workspaceId) !== String(task.workspaceId)) {
        return next(new HttpError("Tag and task must be in the same workspace", 400));
      }

      // Check if tag is already added to task
      const existingTaskTag = await TaskTag.findOne({
        taskId,
        tagId
      });

      if (existingTaskTag) {
        return next(new HttpError("Tag already added to this task", 400));
      }

      // Add tag to task
      const taskTag = await TaskTag.create({
        taskId,
        tagId
      });

      // Log activity
      await ActivityLog.create({
        entityId: task._id,
        entityType: 'task',
        userId,
        action: 'add_tag',
        details: { 
          taskTitle: task.title,
          tagName: tag.name
        }
      });

      res.status(201).json({
        status: 'success',
        message: 'Tag added to task successfully',
        data: {
          taskTag,
          tag
        }
      });
    } catch (error) {
      console.error('Error adding tag to task:', error);
      return next(new HttpError("Failed to add tag to task", 500));
    }
  }
);

/**
 * Remove tag from task
 */
export const removeTaskTag = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { taskId, tagId } = req.params;
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

      // Check if tag exists
      const tag = await Tag.findById(tagId);
      if (!tag) {
        return next(new HttpError("Tag not found", 404));
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

      // Find and delete the task tag association
      const taskTag = await TaskTag.findOneAndDelete({
        taskId,
        tagId
      });

      if (!taskTag) {
        return next(new HttpError("Tag is not assigned to this task", 404));
      }

      // Log activity
      await ActivityLog.create({
        entityId: task._id,
        entityType: 'task',
        userId,
        action: 'remove_tag',
        details: { 
          taskTitle: task.title,
          tagName: tag.name
        }
      });

      res.status(200).json({
        status: 'success',
        message: 'Tag removed from task successfully'
      });
    } catch (error) {
      console.error('Error removing tag from task:', error);
      return next(new HttpError("Failed to remove tag from task", 500));
    }
  }
);

/**
 * Search tasks by tag
 */
export const searchTasksByTag = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tagId } = req.params;
    const { workspaceId } = req.query;
    const userId = req.user?._id;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    try {
      // Check if tag exists
      const tag = await Tag.findById(tagId);
      if (!tag) {
        return next(new HttpError("Tag not found", 404));
      }

      // Check workspace access if specified
      if (workspaceId) {
        const workspace = await Workspace.findOne({ 
          _id: workspaceId,
          $or: [
            { ownerId: userId },
            // Would add a check for workspace members here
          ]
        });

        if (!workspace) {
          return next(new HttpError("Workspace not found or access denied", 404));
        }
      }

      // Find all task-tag associations with this tag
      const query: any = { tagId };
      
      // Add workspace filter if provided
      if (workspaceId) {
        // We need to first find all tasks in this workspace
        const workspaceTasks = await Task.find({ workspaceId }).select('_id');
        const workspaceTaskIds = workspaceTasks.map(task => task._id);
        
        // Then find tag associations only for these tasks
        query.taskId = { $in: workspaceTaskIds };
      }
      
      const taskTags = await TaskTag.find(query);
      
      // Get the task IDs
      const taskIds = taskTags.map(tt => tt.taskId);
      
      // Get the actual tasks
      const tasks = await Task.find({
        _id: { $in: taskIds }
      }).populate('assigneeId', 'firstName lastName avatar');
      
      res.status(200).json({
        status: 'success',
        data: {
          tag,
          tasks,
          count: tasks.length
        }
      });
    } catch (error) {
      console.error('Error searching tasks by tag:', error);
      return next(new HttpError("Failed to search tasks by tag", 500));
    }
  }
);

/**
 * Batch add/remove tags for a task
 */
export const batchUpdateTaskTags = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { taskId } = req.params;
    const { tagIds } = req.body;
    
    if (!tagIds || !Array.isArray(tagIds)) {
      return next(new HttpError("Tag IDs array is required", 400));
    }
    
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

      // Get current tag associations
      const currentTaskTags = await TaskTag.find({ taskId });
      const currentTagIds = currentTaskTags.map(tt => String(tt.tagId));
      
      // Identify tags to add and remove
      const tagsToAdd = tagIds.filter(id => !currentTagIds.includes(id));
      const tagsToRemove = currentTagIds.filter(id => !tagIds.includes(id));
      
      // Process tags to add
      const addPromises = tagsToAdd.map(async (tagId) => {
        // Verify tag exists and is in same workspace
        const tag = await Tag.findById(tagId);
        if (!tag) return null;
        if ( String( tag.workspaceId) !== String(task.workspaceId)) return null;
        
        // Create new association
        return TaskTag.create({ taskId, tagId });
      });
      
      // Process tags to remove
      const removePromises = tagsToRemove.map(tagId => {
        return TaskTag.findOneAndDelete({ taskId, tagId });
      });
      
      // Execute all operations
      await Promise.all([...addPromises, ...removePromises]);
      
      // Log activity
      await ActivityLog.create({
        entityId: task._id,
        entityType: 'task',
        userId,
        action: 'update_tags',
        details: { 
          taskTitle: task.title,
          added: tagsToAdd.length,
          removed: tagsToRemove.length
        }
      });
      
      // Get updated tag list
      const updatedTaskTags = await TaskTag.find({ taskId })
        .populate('tagId');
        
      const tags = updatedTaskTags.map(tt => tt.tagId);
      
      res.status(200).json({
        status: 'success',
        message: 'Task tags updated successfully',
        data: {
          tags,
          added: tagsToAdd.length,
          removed: tagsToRemove.length
        }
      });
    } catch (error) {
      console.error('Error updating task tags:', error);
      return next(new HttpError("Failed to update task tags", 500));
    }
  }
);