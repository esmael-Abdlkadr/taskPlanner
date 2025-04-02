import { WorkspaceMember } from "../models/workSpaceMember";
import { Response, Request, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler";
import HttpError from "../utils/httpError";
import { Workspace } from "../models/Workspace";
import { User } from "../models/User";
import { Task } from "../models/Task";
import { ActivityLog } from "../models/ActivityLog";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  addWorkspaceMemberSchema,
  updateWorkspaceMemberSchema,
} from "../validators/validatorSchema";
import sendEmail from "../utils/sendEmail";

/**
 * Get all workspaces for the current user
 */
export const getWorkspaces = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;

    const includeArchived = req.query.includeArchived === "true";

    const status = (req.query.status as string) || "active";

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    try {
      let archivedFilter = {};
      if (status === "active") {
        archivedFilter = { isArchived: { $ne: true } };
      } else if (status === "archived") {
        archivedFilter = { isArchived: true };
      }

      const ownedWorkspaces = await Workspace.find({
        ownerId: userId,
        ...archivedFilter,
      }).sort({ updatedAt: -1 });

      const memberships = await WorkspaceMember.find({
        userId,
      }).select("workspaceId role");

      const memberWorkspaceIds = memberships.map((m) => m.workspaceId);

      const memberWorkspaces = await Workspace.find({
        _id: { $in: memberWorkspaceIds },
        ...archivedFilter,
      });

      const workspaces = [
        ...ownedWorkspaces.map((ws) => ({
          ...ws.toObject(),
          role: "owner",
        })),
        ...memberWorkspaces.map((ws) => {
          const membership = memberships.find(
            (m) =>
              (m.workspaceId as any).toString() === (ws as any)._id.toString()
          );
          return {
            ...ws.toObject(),
            role: membership?.role || "member",
          };
        }),
      ];

      workspaces.sort((a, b) => {
        if (a.isPersonal && !b.isPersonal) return -1;
        if (!a.isPersonal && b.isPersonal) return 1;
        return (
          new Date((b as any).updatedAt).getTime() -
          new Date((a as any).updatedAt).getTime()
        );
      });

      res.status(200).json({
        status: "success",
        data: { workspaces },
      });
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      return next(new HttpError("Failed to fetch workspaces", 500));
    }
  }
);

/**
 * Get workspace by ID with summary statistics
 */
export const getWorkspace = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    try {
      const workspace = await Workspace.findById(id);

      if (!workspace) {
        return next(new HttpError("Workspace not found", 404));
      }

      let role = null;
      let hasAccess = false;

      if (String(workspace.ownerId) === String(userId)) {
        role = "owner";
        hasAccess = true;
      } else {
        const membership = await WorkspaceMember.findOne({
          workspaceId: workspace._id,
          userId,
        });

        if (membership) {
          role = membership.role;
          hasAccess = true;
        }
      }

      if (!hasAccess) {
        return next(new HttpError("Access denied to this workspace", 403));
      }

      const totalTasks = await Task.countDocuments({
        workspaceId: workspace._id,
      });
      const completedTasks = await Task.countDocuments({
        workspaceId: workspace._id,
        status: "completed",
      });
      const overdueTasks = await Task.countDocuments({
        workspaceId: workspace._id,
        dueDate: { $lt: new Date() },
        status: { $ne: "completed" },
      });

      const recentTasks = await Task.find({
        workspaceId: workspace._id,
        parentId: null,
      })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select("title status priority dueDate")
        .lean();

      const memberCount =
        (await WorkspaceMember.countDocuments({
          workspaceId: workspace._id,
        })) + 1; // +1 for owner

      res.status(200).json({
        status: "success",
        data: {
          workspace: workspace.toObject(),
          role,
          stats: {
            totalTasks,
            completedTasks,
            overdueTasks,
            completionRate:
              totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0,
            memberCount,
          },
          recentTasks,
        },
      });
    } catch (error) {
      console.error("Error fetching workspace:", error);
      return next(new HttpError("Failed to fetch workspace details", 500));
    }
  }
);

/**
 * Create a new workspace
 */
export const createWorkspace = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsedResult = createWorkspaceSchema.safeParse(req.body);
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
      name,
      description = "",
      isPersonal = false,
      color = "#6366F1", // Default indigo
      icon = "folder",
    } = parsedResult.data;

    try {
      const existingWorkspace = await Workspace.findOne({
        name,
        ownerId: userId,
      });

      if (existingWorkspace) {
        return next(
          new HttpError("You already have a workspace with this name", 400)
        );
      }

      const workspace = await Workspace.create({
        name,
        description,
        ownerId: userId,
        isPersonal,
        color,
        icon,
      });

      await ActivityLog.create({
        entityId: workspace._id,
        entityType: "workspace",
        userId,
        action: "create",
        details: { name: workspace.name },
      });

      res.status(201).json({
        status: "success",
        message: "Workspace created successfully",
        data: { workspace },
      });
    } catch {
      return next(new HttpError("Failed to create workspace", 500));
    }
  }
);

/**
 * Update a workspace
 */
export const updateWorkspace = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const parsedResult = updateWorkspaceSchema.safeParse(req.body);
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

    try {
      const workspace = await Workspace.findOne({
        _id: id,
        ownerId: userId,
      });

      if (!workspace) {
        return next(
          new HttpError(
            "Workspace not found or you don't have permission to update it",
            404
          )
        );
      }

      // Prevent renaming personal workspace
      if (
        workspace.isPersonal &&
        parsedResult.data.name &&
        parsedResult.data.name !== workspace.name
      ) {
        return next(new HttpError("Personal workspace cannot be renamed", 400));
      }

      if (parsedResult.data.name && parsedResult.data.name !== workspace.name) {
        const existingWorkspace = await Workspace.findOne({
          name: parsedResult.data.name,
          ownerId: userId,
          _id: { $ne: id }, // Exclude current workspace
        });

        if (existingWorkspace) {
          return next(
            new HttpError("You already have a workspace with this name", 400)
          );
        }
      }

      const updatedWorkspace = await Workspace.findByIdAndUpdate(
        id,
        parsedResult.data,
        { new: true, runValidators: true }
      );

      await ActivityLog.create({
        entityId: workspace._id,
        entityType: "workspace",
        userId,
        action: "update",
        details: { name: workspace.name, changes: parsedResult.data },
      });

      res.status(200).json({
        status: "success",
        message: "Workspace updated successfully",
        data: { workspace: updatedWorkspace },
      });
    } catch (error) {
      console.error("Error updating workspace:", error);
      return next(new HttpError("Failed to update workspace", 500));
    }
  }
);

/**
 * Archive a workspace
 */
export const archiveWorkspace = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    try {
      const workspace = await Workspace.findById(id);

      if (!workspace) {
        return next(new HttpError("Workspace not found", 404));
      }

      const isOwner =
        (workspace.ownerId as string).toString() === userId.toString();

      if (!isOwner) {
        const isMember = await WorkspaceMember.findOne({
          workspaceId: id,
          userId,
        });

        if (!isMember) {
          return next(
            new HttpError("Access denied: Not a member of this workspace", 403)
          );
        }
      }

      // Prevent archiving personal workspace
      if (workspace.isPersonal) {
        return next(
          new HttpError("Personal workspace cannot be archived", 400)
        );
      }

      workspace.isArchived = true;
      await workspace.save();

      await ActivityLog.create({
        entityId: workspace._id,
        entityType: "workspace",
        userId,
        action: "update",
        details: { name: workspace.name, archived: true },
      });

      res.status(200).json({
        status: "success",
        message: "Workspace archived successfully",
      });
    } catch (error) {
      console.error("Error archiving workspace:", error);
      return next(new HttpError("Failed to archive workspace", 500));
    }
  }
);

/**
 * Restore an archived workspace
 */
export const restoreWorkspace = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    try {
      const workspace = await Workspace.findOne({
        _id: id,
        ownerId: userId,
        isArchived: true,
      });

      if (!workspace) {
        return next(
          new HttpError(
            "Workspace not found or you don't have permission to restore it",
            404
          )
        );
      }

      workspace.isArchived = false;
      await workspace.save();

      await ActivityLog.create({
        entityId: workspace._id,
        entityType: "workspace",
        userId,
        action: "update",
        details: { name: workspace.name, restored: true },
      });

      res.status(200).json({
        status: "success",
        message: "Workspace restored successfully",
      });
    } catch (error) {
      console.error("Error restoring workspace:", error);
      return next(new HttpError("Failed to restore workspace", 500));
    }
  }
);

/**
 * Get workspace members
 */
export const getWorkspaceMembers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    try {
      const workspace = await Workspace.findById(id);

      if (!workspace) {
        return next(new HttpError("Workspace not found", 404));
      }

      const isOwner = String(workspace.ownerId) === String(userId);

      if (!isOwner) {
        const membership = await WorkspaceMember.findOne({
          workspaceId: id,
          userId,
        });

        if (!membership) {
          return next(new HttpError("Access denied to this workspace", 403));
        }
      }

      const owner = await User.findById(workspace.ownerId).select(
        "firstName lastName email avatar"
      );

      const members = await WorkspaceMember.find({ workspaceId: id })
        .populate("userId", "firstName lastName email avatar")
        .sort("role");

      res.status(200).json({
        status: "success",
        data: {
          owner,
          members: members.map((member) => ({
            id: member._id,
            user: member.userId,
            role: member.role,
            joinedAt: member.joinedAt,
          })),
        },
      });
    } catch {
      return next(new HttpError("Failed to fetch workspace members", 500));
    }
  }
);

/**
 * Add member to workspace
 */
export const addWorkspaceMember = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const parsedResult = addWorkspaceMemberSchema.safeParse(req.body);
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

    const { email, role = "member" } = parsedResult.data;

    try {
      const workspace = await Workspace.findOne({
        _id: id,
      }).populate("ownerId", "firstName lastName email");

      if (!workspace) {
        return next(new HttpError("Workspace not found", 404));
      }

      if ((workspace.ownerId as any)._id.toString() !== userId.toString()) {
        const isMemberAdmin = await WorkspaceMember.findOne({
          workspaceId: id,
          userId,
          role: "admin",
        });

        if (!isMemberAdmin) {
          return next(
            new HttpError(
              "You don't have permission to add members to this workspace",
              403
            )
          );
        }
      }

      const userToAdd = await User.findOne({ email });
      if (!userToAdd) {
        return next(
          new HttpError("User not found with this email address", 404)
        );
      }

      if (
        (workspace.ownerId as any)._id.toString() ===
        (userToAdd._id as string).toString()
      ) {
        return next(new HttpError("User is already the workspace owner", 400));
      }

      const existingMember = await WorkspaceMember.findOne({
        workspaceId: id,
        userId: userToAdd._id,
      });

      if (existingMember) {
        return next(
          new HttpError("User is already a member of this workspace", 400)
        );
      }

      const inviter = await User.findById(userId).select("firstName lastName");
      if (!inviter) {
        return next(new HttpError("Inviter not found", 500));
      }

      const member = await WorkspaceMember.create({
        workspaceId: id,
        userId: userToAdd._id,
        role,
        invitedBy: userId,
      });

      const populatedMember = await WorkspaceMember.findById(
        member._id
      ).populate("userId", "firstName lastName email avatar");

      if (!populatedMember) {
        return next(new HttpError("Failed to retrieve the added member", 500));
      }

      await ActivityLog.create({
        entityId: workspace._id,
        entityType: "workspace",
        userId,
        action: "add_member",
        details: {
          workspaceName: workspace.name,
          newMember: userToAdd.email,
          role,
        },
      });

      const appUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const workspaceUrl = `${appUrl}/workspaces/${workspace._id}`;
      const emailData = {
        userName: userToAdd.firstName,
        inviterName: `${inviter.firstName} ${inviter.lastName}`,
        workspaceName: workspace.name,
        role: role,
        appUrl: appUrl,
        workspaceUrl: workspaceUrl,
      };

      try {
        await sendEmail({
          email: userToAdd.email,
          subject: `You've been invited to ${workspace.name} workspace on TaskNest`,
          template: "workspace-invitation",
          date: emailData,
        });
      } catch (emailError) {
        console.error("Failed to send invitation email:", emailError);
      }

      res.status(201).json({
        status: "success",
        message: "Member added successfully",
        data: {
          member: {
            id: populatedMember._id,
            user: populatedMember.userId,
            role: populatedMember.role,
            joinedAt: populatedMember.joinedAt,
          },
        },
      });
    } catch (error) {
      console.error("Error adding workspace member:", error);
      return next(new HttpError("Failed to add member", 500));
    }
  }
);

/**
 * Update workspace member role
 */
export const updateWorkspaceMemberRole = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { workspaceId, memberId } = req.params;
    const parsedResult = updateWorkspaceMemberSchema.safeParse(req.body);
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

    const { role } = parsedResult.data;

    try {
      const workspace = await Workspace.findOne({
        _id: workspaceId,
        ownerId: userId,
      });

      if (!workspace) {
        return next(
          new HttpError(
            "Workspace not found or you don't have permission to update members",
            404
          )
        );
      }

      const member = await WorkspaceMember.findById(memberId).populate(
        "userId",
        "firstName lastName email"
      );

      if (!member || String(member.workspaceId) !== workspaceId) {
        return next(new HttpError("Member not found in this workspace", 404));
      }

      member.role = role;
      await member.save();

      await ActivityLog.create({
        entityId: workspace._id,
        entityType: "workspace",
        userId,
        action: "update_member",
        details: {
          workspaceName: workspace.name,
          memberEmail: (member.userId as any).email,
          newRole: role,
        },
      });

      res.status(200).json({
        status: "success",
        message: "Member role updated successfully",
        data: {
          member: {
            id: member._id,
            role: member.role,
          },
        },
      });
    } catch (error) {
      console.error("Error updating workspace member:", error);
      return next(new HttpError("Failed to update member", 500));
    }
  }
);

/**
 * Remove member from workspace
 */
export const removeWorkspaceMember = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { workspaceId, memberId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    try {
      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        return next(new HttpError("Workspace not found", 404));
      }

      const isOwner = String(workspace.ownerId) === String(userId);
      let hasPermission = isOwner;

      if (!isOwner) {
        const userMembership = await WorkspaceMember.findOne({
          workspaceId,
          userId,
          role: "admin",
        });

        hasPermission = !!userMembership;
      }

      if (!hasPermission) {
        return next(
          new HttpError("You don't have permission to remove members", 403)
        );
      }

      const member = await WorkspaceMember.findById(memberId).populate(
        "userId",
        "email"
      );

      if (!member || String(member.workspaceId) !== workspaceId) {
        return next(new HttpError("Member not found in this workspace", 404));
      }

      const memberEmail = (member.userId as any).email;

      try {
        const removedUser = await User.findOne({ email: memberEmail });
        if (removedUser) {
          await sendEmail({
            email: memberEmail,
            subject: `You've been removed from ${workspace.name} workspace on TaskNest`,
            template: "workspaceRemoval",
            date: {
              userName: removedUser.firstName,
              workspaceName: workspace.name,
              appUrl: process.env.FRONTEND_URL || "http://localhost:5173",
            },
          });
        }
      } catch (emailError) {
        console.error("Failed to send removal notification email:", emailError);
      }

      await WorkspaceMember.findByIdAndDelete(memberId);

      await ActivityLog.create({
        entityId: workspace._id,
        entityType: "workspace",
        userId,
        action: "remove_member",
        details: {
          workspaceName: workspace.name,
          memberEmail,
        },
      });

      res.status(200).json({
        status: "success",
        message: "Member removed successfully",
      });
    } catch (error) {
      console.error("Error removing workspace member:", error);
      return next(new HttpError("Failed to remove member", 500));
    }
  }
);
