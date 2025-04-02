import { Response, Request, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler";
import HttpError from "../utils/httpError";
import { Category } from "../models/Category";
import { z } from "zod";

const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name is too long"),
  icon: z.string().min(1, "Icon is required"),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color hex code"),
  description: z.string().optional(),
});

/**
 * Get all categories (system default + user-created)
 */
export const getCategories = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    try {
      const categories = await Category.find({
        $or: [{ isDefault: true }, { ownerId: userId }],
      }).sort({ isDefault: -1, name: 1 });

      res.status(200).json({
        status: "success",
        data: {
          categories,
        },
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      return next(new HttpError("Failed to fetch categories", 500));
    }
  }
);

/**
 * Create a new category
 */
export const createCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsedResult = categorySchema.safeParse(req.body);
    if (!parsedResult.success) {
      const errorMessages = parsedResult.error.issues
        .map((err) => err.message)
        .join(", ");
      return next(new HttpError(errorMessages, 400));
    }

    const userId = req.user?._id;
    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    const { name, icon, color, description } = parsedResult.data;

    try {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") }, 
        ownerId: userId,
      });

      if (existingCategory) {
        return next(
          new HttpError("You already have a category with this name", 400)
        );
      }
      const category = await Category.create({
        name,
        icon,
        color,
        description,
        isDefault: false,
        ownerId: userId,
      });

      res.status(201).json({
        status: "success",
        message: "Category created successfully",
        data: { category },
      });
    } catch (error) {
      console.error("Error creating category:", error);
      return next(new HttpError("Failed to create category", 500));
    }
  }
);

/**
 * Update a category
 */
export const updateCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const parsedResult = categorySchema.safeParse(req.body);
    if (!parsedResult.success) {
      const errorMessages = parsedResult.error.issues
        .map((err) => err.message)
        .join(", ");
      return next(new HttpError(errorMessages, 400));
    }

    const userId = req.user?._id;
    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    try {
      const category = await Category.findById(id);
      if (!category) {
        return next(new HttpError("Category not found", 404));
      }
      if (category.isDefault) {
        return next(
          new HttpError("Default categories cannot be modified", 403)
        );
      }

    
      if (category.ownerId.toString() !== userId.toString()) {
        return next(
          new HttpError(
            "You don't have permission to modify this category",
            403
          )
        );
      }


      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        parsedResult.data,
        { new: true, runValidators: true }
      );

      if (!updatedCategory) {
        return next(new HttpError("Failed to update category", 500));
      }

      res.status(200).json({
        status: "success",
        message: "Category updated successfully",
        data: { category: updatedCategory },
      });
    } catch (error) {
      console.error("Error updating category:", error);
      return next(new HttpError("Failed to update category", 500));
    }
  }
);

/**
 * Delete a category
 */
export const deleteCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return next(new HttpError("Authentication required", 401));
    }

    try {
      const category = await Category.findById(id);
      if (!category) {
        return next(new HttpError("Category not found", 404));
      }
      if (category.isDefault) {
        return next(new HttpError("Default categories cannot be deleted", 403));
      }

   
      if (category.ownerId.toString() !== userId.toString()) {
        return next(
          new HttpError(
            "You don't have permission to delete this category",
            403
          )
        );
      }


      await Category.findByIdAndDelete(id);

      res.status(200).json({
        status: "success",
        message: "Category deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      return next(new HttpError("Failed to delete category", 500));
    }
  }
);
