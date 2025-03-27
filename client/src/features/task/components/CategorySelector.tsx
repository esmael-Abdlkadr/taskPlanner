import { useState } from "react";
import { useCategories } from "../../../hooks/useCategory";
import { Category } from "../../../types/task.types";
import { Plus, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { CreateCategoryDialog } from "./CreateCategoryDialog";

interface CategorySelectorProps {
  selectedCategoryId: string | undefined;
  onChange: (categoryId: string | undefined) => void;
  className?: string;
}

export const CategorySelector = ({
  selectedCategoryId,
  onChange,
  className,
}: CategorySelectorProps) => {
  const { data: categories, isLoading } = useCategories();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (isLoading) {
    return <div className="p-4 text-center">Loading categories...</div>;
  }

  const handleCategorySelect = (category: Category | null) => {
    onChange(category?._id);
  };

  const selectedCategory = categories?.find(
    (cat) => cat._id === selectedCategoryId
  );

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Select Category</div>
        {selectedCategory && (
          <button
            type="button"
            onClick={() => handleCategorySelect(null)}
            className="text-xs text-muted-foreground hover:text-primary flex items-center"
          >
            <X className="h-3 w-3 mr-1" /> Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {categories?.map((category) => (
          <button
            key={category._id}
            type="button"
            className={cn(
              "flex items-center p-2 rounded-md border transition-all",
              selectedCategoryId === category._id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => handleCategorySelect(category)}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
              style={{ backgroundColor: category.color }}
            >
              <span className="text-white text-lg">
                {/* Dynamically render icon based on category.icon name */}
                {category.icon === "user" && "👤"}
                {category.icon === "briefcase" && "💼"}
                {category.icon === "heart" && "❤️"}
                {category.icon === "dollar-sign" && "💰"}
                {category.icon === "shopping-cart" && "🛒"}
                {category.icon === "book" && "📚"}
                {category.icon === "home" && "🏠"}
                {category.icon === "map-pin" && "📍"}
                {/* Add more mappings as needed */}
              </span>
            </div>
            <div className="text-sm font-medium truncate">{category.name}</div>
          </button>
        ))}

        {/* Create new category button */}
        <button
          type="button"
          className="flex items-center justify-center p-2 rounded-md border border-dashed border-muted-foreground/50 hover:border-primary hover:bg-primary/5 transition-all"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          <span className="text-sm">New Category</span>
        </button>
      </div>

      <CreateCategoryDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={(newCategory) => handleCategorySelect(newCategory)}
      />
    </div>
  );
};
