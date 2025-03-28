import asyncHandler from "../utils/asyncHandler";
import { Response, Request, NextFunction } from "express";
import HttpError from "../utils/httpError";
import { verifyToken } from "../utils/tokenUtil";
import { User } from "../models/User";
import { Workspace } from "../models/Workspace";
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

    // Check if user owns the workspace
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      ownerId: userId,
    });

    if (workspace) {
      // User is owner, proceed
      req.workspace = workspace; // Assign workspace to the extended Request type
      return next();
    }

    // Check if user is a member (would need to implement WorkspaceMember check)
    const isMember = false; // Replace with actual check from WorkspaceMember model

    if (!isMember) {
      return next(
        new HttpError("Access denied: Not a member of this workspace", 403)
      );
    }

    next();
  }
);