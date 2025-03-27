import { model, Schema, Document } from "mongoose";
import { ICategory } from "../types/types";

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Please provide a category name"],
      trim: true,
    },
    icon: {
      type: String,
      required: [true, "Please provide a category icon"],
      trim: true,
    },
    color: {
      type: String,
      required: [true, "Please provide a category color"],
      trim: true,
      default: "#6366F1", // Default indigo color
    },
    description: {
      type: String,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for system default categories
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
categorySchema.index({ ownerId: 1 });
categorySchema.index({ name: 1, ownerId: 1 }, { unique: true });

export const Category = model<ICategory>("Category", categorySchema);
