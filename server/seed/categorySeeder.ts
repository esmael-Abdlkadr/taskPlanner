import mongoose from "mongoose";
import { Category } from "../src/models/Category";

// Default categories data
const defaultCategories = [
  {
    name: "Personal",
    icon: "user",
    color: "#3B82F6", // Blue
    description: "Tasks related to personal life",
    isDefault: true,
  },
  {
    name: "Work",
    icon: "briefcase",
    color: "#10B981", // Green
    description: "Work-related tasks and projects",
    isDefault: true,
  },
  {
    name: "Health",
    icon: "heart",
    color: "#EF4444", // Red
    description: "Health and fitness activities",
    isDefault: true,
  },
  {
    name: "Finance",
    icon: "dollar-sign",
    color: "#F59E0B", // Amber
    description: "Financial tasks and reminders",
    isDefault: true,
  },
  {
    name: "Shopping",
    icon: "shopping-cart",
    color: "#8B5CF6", // Purple
    description: "Shopping lists and purchases",
    isDefault: true,
  },
  {
    name: "Education",
    icon: "book",
    color: "#EC4899", // Pink
    description: "Learning and educational activities",
    isDefault: true,
  },
  {
    name: "Home",
    icon: "home",
    color: "#6366F1", // Indigo
    description: "Home maintenance and household tasks",
    isDefault: true,
  },
  {
    name: "Travel",
    icon: "map-pin",
    color: "#14B8A6", // Teal
    description: "Travel plans and preparations",
    isDefault: true,
  },
];

// Function to seed default categories
export const seedDefaultCategories = async () => {
  try {
    // Check if default categories already exist
    const existingCategories = await Category.countDocuments({
      isDefault: true,
    });

    if (existingCategories > 0) {
      console.log("Default categories already exist, skipping seeding");
      return;
    }

    // Insert default categories
    await Category.insertMany(defaultCategories);

    console.log("Successfully seeded default categories");
  } catch (error) {
    console.error("Error seeding default categories:", error);
    throw error; // Re-throw to handle in the caller
  }
};

// Standalone function to run the seeder from command line
export const runCategorySeeder = async () => {
  try {
    console.log("Starting category seeder...");
    await seedDefaultCategories();
    console.log("Category seeding completed successfully");
  } catch (error) {
    console.error("Failed to seed categories:", error);
  }
};

// Run seeder if executed directly
if (require.main === module) {
  // This block will execute if file is run directly with node
  // Assuming your connection is set up elsewhere when running standalone
  runCategorySeeder()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
