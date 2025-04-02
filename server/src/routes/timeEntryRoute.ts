import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
  getActiveTimeEntry,
  getTaskTimeEntries,
  getTimeStats,
  getUserTimeEntries,
  pauseTimeEntry,
  resumeTimeEntry,
  startTime,
  stopTimeEntry,
} from "../controllers/timeEntryControllers";

const router = express.Router();

/**
 * @swagger
 * /api/time-entries:
 *   post:
 *     summary: Start a new time entry
 *     tags: [TimeEntries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *             properties:
 *               taskId:
 *                 type: string
 *               isPomodoro:
 *                 type: boolean
 *               pomodoroConfig:
 *                 type: object
 *     responses:
 *       201:
 *         description: Time entry started successfully
 *       400:
 *         description: Invalid input or active time entry already exists
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, startTime);

/**
 * @swagger
 * /api/time-entries/{timeEntryId}/pause:
 *   patch:
 *     summary: Pause an active time entry
 *     tags: [TimeEntries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: timeEntryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Time entry paused successfully
 *       404:
 *         description: Time entry not found
 *       401:
 *         description: Unauthorized
 */
router.patch("/:timeEntryId/pause", protect, pauseTimeEntry);

/**
 * @swagger
 * /api/time-entries/{timeEntryId}/resume:
 *   patch:
 *     summary: Resume a paused time entry
 *     tags: [TimeEntries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: timeEntryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Time entry resumed successfully
 *       404:
 *         description: Time entry not found
 *       401:
 *         description: Unauthorized
 */
router.patch("/:timeEntryId/resume", protect, resumeTimeEntry);

/**
 * @swagger
 * /api/time-entries/{timeEntryId}/stop:
 *   patch:
 *     summary: Stop an active or paused time entry
 *     tags: [TimeEntries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: timeEntryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Time entry stopped successfully
 *       404:
 *         description: Time entry not found
 *       401:
 *         description: Unauthorized
 */
router.patch("/:timeEntryId/stop", protect, stopTimeEntry);

/**
 * @swagger
 * /api/time-entries/task/{taskId}:
 *   get:
 *     summary: Get time entries for a specific task
 *     tags: [TimeEntries]
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
 *         description: List of time entries for the task
 *       401:
 *         description: Unauthorized
 */
router.get("/task/:taskId", protect, getTaskTimeEntries);

/**
 * @swagger
 * /api/time-entries/user:
 *   get:
 *     summary: Get all time entries for the current user
 *     tags: [TimeEntries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items to retrieve
 *     responses:
 *       200:
 *         description: List of time entries with pagination metadata
 *       401:
 *         description: Unauthorized
 */
router.get("/user", protect, getUserTimeEntries);

/**
 * @swagger
 * /api/time-entries/active:
 *   get:
 *     summary: Get the active time entry for the current user
 *     tags: [TimeEntries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active time entry details
 *       401:
 *         description: Unauthorized
 */
router.get("/active", protect, getActiveTimeEntry);

/**
 * @swagger
 * /api/time-entries/stats:
 *   get:
 *     summary: Get time entry statistics/analytics
 *     tags: [TimeEntries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: week
 *         description: Time period for the statistics
 *     responses:
 *       200:
 *         description: Time statistics data including task and daily stats
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", protect, getTimeStats);

export default router;
