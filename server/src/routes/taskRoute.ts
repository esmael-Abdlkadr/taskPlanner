import express from "express";
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  getTaskPath,
  toggleTaskCompletion,
  toggleFavorite,
  getSubtasks,
} from "../controllers/taskController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();
router.get("/workspaces/:workspaceId/tasks", protect, getTasks);
router.post("/tasks", protect, createTask);
router.get("/tasks/:id", protect, getTask);
router.put("/tasks/:id", protect, updateTask);
router.delete("/tasks/:id", protect, deleteTask);

router.post("/tasks/:id/move", protect, moveTask);
router.get("/tasks/:id/path", protect, getTaskPath);
router.post("/tasks/:id/complete", protect, toggleTaskCompletion);

router.post("/tasks/:id/favorite", protect, toggleFavorite);

router.get("/tasks/:parentId/subtasks", protect, getSubtasks);
/**
 * @swagger
 * /api/workspaces/{workspaceId}/tasks:
 *   get:
 *     summary: Get tasks for a workspace
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *         description: Filter by parent task ID (use 'null' for root tasks)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [not-started, in-progress, completed, archived]
 *         description: Filter by task status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by task priority
 *       - in: query
 *         name: dueDate
 *         schema:
 *           type: string
 *           enum: [overdue, today, upcoming]
 *         description: Filter by due date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: favorites
 *         schema:
 *           type: string
 *         description: Filter for favorite tasks if set to "true"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of tasks
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - workspaceId
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Implement API"
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [not-started, in-progress, completed, archived]
 *                 default: not-started
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               parentId:
 *                 type: string
 *                 nullable: true
 *               position:
 *                 type: number
 *               workspaceId:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               estimatedTime:
 *                 type: number
 *               assigneeId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
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
 *         description: Task details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */

/**
 * @swagger
 * /api/tasks/{id}:
 *   patch:
 *     summary: Update a task
 *     tags: [Tasks]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [not-started, in-progress, completed, archived]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               parentId:
 *                 type: string
 *                 nullable: true
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               estimatedTime:
 *                 type: number
 *               actualTime:
 *                 type: number
 *               assigneeId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task and all its subtasks
 *     tags: [Tasks]
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
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */

/**
 * @swagger
 * /api/tasks/{parentId}/subtasks:
 *   get:
 *     summary: Get subtasks for a task
 *     tags: [Tasks]
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
 *         description: List of subtasks
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */

/**
 * @swagger
 * /api/tasks/{id}/move:
 *   post:
 *     summary: Move a task (change parent or position)
 *     tags: [Tasks]
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
 *               parentId:
 *                 type: string
 *                 nullable: true
 *               position:
 *                 type: number
 *               workspaceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task moved successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */

/**
 * @swagger
 * /api/tasks/{id}/path:
 *   get:
 *     summary: Get task hierarchy path
 *     tags: [Tasks]
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
 *         description: Task path hierarchy
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */

/**
 * @swagger
 * /api/tasks/{id}/complete:
 *   post:
 *     summary: Toggle task completion status
 *     tags: [Tasks]
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
 *             required:
 *               - completed
 *             properties:
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Task completion status updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */

/**
 * @swagger
 * /api/tasks/{id}/favorite:
 *   post:
 *     summary: Toggle favorite status for a task
 *     tags: [Tasks]
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
 *         description: Task added to or removed from favorites successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */

export default router;
