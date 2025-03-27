import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";

const router = express.Router();

router.get("/categories", protect, getCategories);
router.post("/categories", protect, createCategory);
router.patch("/categories/:id", protect, updateCategory);
router.delete("/categories/:id", protect, deleteCategory);

export default router;
