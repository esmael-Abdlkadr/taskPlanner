import express from 'express';
import { 
  getWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  archiveWorkspace,
  getWorkspaceMembers,
  addWorkspaceMember,
  updateWorkspaceMemberRole,
  removeWorkspaceMember
} from '../controllers/workspaceController';
import { protect, checkWorkspaceMember } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/workspaces:
 *   get:
 *     summary: Get all workspaces for the current user
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workspaces
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, getWorkspaces);

/**
 * @swagger
 * /api/workspaces:
 *   post:
 *     summary: Create a new workspace
 *     tags: [Workspaces]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Marketing Projects"
 *               description:
 *                 type: string
 *                 example: "Workspace for all marketing projects"
 *               isPersonal:
 *                 type: boolean
 *                 example: false
 *               color:
 *                 type: string
 *                 example: "#6366F1"
 *               icon:
 *                 type: string
 *                 example: "folder"
 *     responses:
 *       201:
 *         description: Workspace created successfully
 *       400:
 *         description: Invalid input or duplicate workspace name
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, createWorkspace);

/**
 * @swagger
 * /api/workspaces/{id}:
 *   get:
 *     summary: Get workspace by ID with statistics
 *     tags: [Workspaces]
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
 *         description: Workspace details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 */
router.get('/:id', protect, getWorkspace);

/**
 * @swagger
 * /api/workspaces/{id}:
 *   patch:
 *     summary: Update workspace details
 *     tags: [Workspaces]
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
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *               icon:
 *                 type: string
 *               settings:
 *                 type: object
 *                 properties:
 *                   defaultView:
 *                     type: string
 *                     enum: [list, board, calendar, timeline, mindmap]
 *                   taskSort:
 *                     type: string
 *                     enum: [position, priority, dueDate, title, createdAt]
 *                   taskSortDirection:
 *                     type: string
 *                     enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Workspace updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Workspace not found
 */
router.patch('/:id', protect, updateWorkspace);

/**
 * @swagger
 * /api/workspaces/{id}/archive:
 *   post:
 *     summary: Archive a workspace
 *     tags: [Workspaces]
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
 *         description: Workspace archived successfully
 *       400:
 *         description: Cannot archive personal workspace
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 */
router.post('/:id/archive', protect, archiveWorkspace);

/**
 * @swagger
 * /api/workspaces/{id}/members:
 *   get:
 *     summary: Get workspace members
 *     tags: [Workspace Members]
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
 *         description: List of workspace members
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 */
router.get('/:id/members', protect, checkWorkspaceMember, getWorkspaceMembers);

/**
 * @swagger
 * /api/workspaces/{id}/members:
 *   post:
 *     summary: Add member to workspace
 *     tags: [Workspace Members]
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
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [admin, member, guest]
 *                 default: member
 *     responses:
 *       201:
 *         description: Member added successfully
 *       400:
 *         description: Invalid input or already a member
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace or user not found
 */
router.post('/:id/members', protect, checkWorkspaceMember, addWorkspaceMember);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/members/{memberId}:
 *   patch:
 *     summary: Update member role in workspace
 *     tags: [Workspace Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
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
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, member, guest]
 *     responses:
 *       200:
 *         description: Member role updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace or member not found
 */
router.patch('/:workspaceId/members/:memberId', protect, updateWorkspaceMemberRole);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/members/{memberId}:
 *   delete:
 *     summary: Remove member from workspace
 *     tags: [Workspace Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace or member not found
 */
router.delete('/:workspaceId/members/:memberId', protect, removeWorkspaceMember);

export default router;