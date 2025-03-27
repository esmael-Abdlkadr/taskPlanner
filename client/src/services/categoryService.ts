import { Category } from "../types/task.types";
import { apiRequest } from "./api";

export const categoryService = {
  // Get all categories (default + user-created)
  getCategories: async () => {
    const response = (await apiRequest({
      method: "GET",
      url: "/categories",
    })) as { data: { categories: Category[] } };

    return response.data.categories;
  },

  // Create a new category
  createCategory: async (categoryData: {
    name: string;
    icon: string;
    color: string;
    description?: string;
  }) => {
    const response = (await apiRequest({
      method: "POST",
      url: "/categories",
      data: categoryData,
    })) as { data: {  category: Category } };

    return response.data.category;
  },

  // Update an existing category
  updateCategory: async (
    categoryId: string,
    categoryData: {
      name?: string;
      icon?: string;
      color?: string;
      description?: string;
    }
  ) => {
    const response = (await apiRequest({
      method: "PATCH",
      url: `/categories/${categoryId}`,
      data: categoryData,
    })) as { data: {  category: Category } };

    return response.data.category;
  },

  // Delete a category
  deleteCategory: async (categoryId: string) => {
    await apiRequest({
      method: "DELETE",
      url: `/categories/${categoryId}`,
    });
  },
};
