import asyncHandler from "../utils/asyncHandler";
import { Response, Request, NextFunction } from "express";
import HttpError from "../utils/httpError";
import { verifyToken } from "../utils/tokenUtil";
import { User } from "../models/User";
import { Workspace } from "../models/Workspace";
import { WorkspaceMember } from "../models/workSpaceMember";
/**
 * Authentication middleware
 */
export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string = "";
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(new HttpError("Authentication required", 401));
    }
    if (!process.env.JWT_SECRET) {
      return next(new HttpError("Authentication system misconfigured", 500));
    }

    try {
      const decoded = (await verifyToken(token, process.env.JWT_SECRET)) as {
        id: string;
      };

      const user = await User?.findById(decoded?.id);
      if (!user) {
        return next(
          new HttpError("Authentication failed: User not found", 401)
        );
      }

      if (!user.isActive) {
        return next(new HttpError("Your account has been deactivated", 401));
      }

      req.user = user;
      next();
    } catch (error) {
      return next(new HttpError("Authentication failed: Invalid token", 401));
    }
  }
);

/**
 * Check workspace membership middleware
 */
export const checkWorkspaceMember = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const { workspaceId } = req.params;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    if (!workspaceId) {
      return next(new HttpError("Workspace ID is required", 400));
    }

    // Check if workspace exists
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return next(new HttpError("Workspace not found", 404));
    }

    // Check if user is owner
    if (workspace.ownerId === userId) {
      req.workspace = workspace;
      return next();
    }

    // Check if user is a member of the workspace (using the role field, not status)
    const workspaceMember = await WorkspaceMember.findOne({
      workspaceId,
      userId,
    });

    if (!workspaceMember) {
      return next(
        new HttpError("Access denied: Not a member of this workspace", 403)
      );
    }

    // User is a member, proceed
    req.workspace = workspace;
    next();
  }
);
