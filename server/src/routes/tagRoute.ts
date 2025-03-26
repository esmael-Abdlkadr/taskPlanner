import express from 'express';
import {
  getWorkspaceTags,
  getTaskTags,
  createTag,
  updateTag,
  deleteTag,
  addTaskTag,
  removeTaskTag,
  searchTasksByTag,
  batchUpdateTaskTags
} from '../controllers/tagController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/workspaces/{workspaceId}/tags:
 *   get:
 *     summary: Get tags for a workspace
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tags with usage count
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 */
router.get('/workspaces/:workspaceId/tags', protect, getWorkspaceTags);

/**
 * @swagger
 * /api/tasks/{taskId}/tags:
 *   get:
 *     summary: Get tags for a task
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of task tags
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.get('/tasks/:taskId/tags', protect, getTaskTags);

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Create a new tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - workspaceId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Bug"
 *               color:
 *                 type: string
 *                 example: "#EF4444"
 *               workspaceId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tag created successfully
 *       400:
 *         description: Invalid input or duplicate tag name
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 */
router.post('/tags', protect, createTag);

/**
 * @swagger
 * /api/tags/{id}:
 *   patch:
 *     summary: Update a tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tag updated successfully
 *       400:
 *         description: Invalid input or duplicate tag name
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tag not found
 */
router.patch('/tags/:id', protect, updateTag);

/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     summary: Delete a tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tag not found
 */
router.delete('/tags/:id', protect, deleteTag);

/**
 * @swagger
 * /api/tasks/{taskId}/tags/{tagId}:
 *   post:
 *     summary: Add a tag to a task
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Tag added to task successfully
 *       400:
 *         description: Invalid input or tag already added
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task or tag not found
 */
router.post('/tasks/:taskId/tags/:tagId', protect, addTaskTag);

/**
 * @swagger
 * /api/tasks/{taskId}/tags/{tagId}:
 *   delete:
 *     summary: Remove a tag from a task
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag removed from task successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task, tag, or association not found
 */
router.delete('/tasks/:taskId/tags/:tagId', protect, removeTaskTag);

/**
 * @swagger
 * /api/tags/{tagId}/tasks:
 *   get:
 *     summary: Search tasks by tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: workspaceId
 *         schema:
 *           type: string
 *         description: Filter by workspace ID
 *     responses:
 *       200:
 *         description: List of tasks with this tag
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tag not found
 */
router.get('/tags/:tagId/tasks', protect, searchTasksByTag);

/**
 * @swagger
 * /api/tasks/{taskId}/tags:
 *   put:
 *     summary: Batch update tags for a task
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tagIds
 *             properties:
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Task tags updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.put('/tasks/:taskId/tags', protect, batchUpdateTaskTags);

export default router;