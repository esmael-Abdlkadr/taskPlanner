import { useState, useEffect, useRef } from "react";
import { useCreateCategory } from "../../../hooks/useCategory";
import { Category } from "../../../types/task.types";
import { X } from "lucide-react";
import { HexColorPicker } from "react-colorful";

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (category: Category) => void;
}

// Predefined icons for selection
const AVAILABLE_ICONS = [
  { name: "user", emoji: "👤" },
  { name: "briefcase", emoji: "💼" },
  { name: "heart", emoji: "❤️" },
  { name: "dollar-sign", emoji: "💰" },
  { name: "shopping-cart", emoji: "🛒" },
  { name: "book", emoji: "📚" },
  { name: "home", emoji: "🏠" },
  { name: "map-pin", emoji: "📍" },
  { name: "calendar", emoji: "📅" },
  { name: "smile", emoji: "😊" },
  { name: "coffee", emoji: "☕" },
  { name: "gift", emoji: "🎁" },
  { name: "car", emoji: "🚗" },
  { name: "phone", emoji: "📱" },
  { name: "globe", emoji: "🌎" },
  { name: "star", emoji: "⭐" },
];

export const CreateCategoryDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateCategoryDialogProps) => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("user");
  const [color, setColor] = useState("#3B82F6"); // Default blue color
  const [description, setDescription] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const createCategory = useCreateCategory();

  // Handle clicks outside the modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newCategory = await createCategory.mutateAsync({
        name,
        icon,
        color,
        description: description || undefined,
      });

      resetForm();
      onOpenChange(false);

      if (onSuccess && newCategory) {
        onSuccess(newCategory);
      }
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const resetForm = () => {
    setName("");
    setIcon("user");
    setColor("#3B82F6");
    setDescription("");
    setShowColorPicker(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // If the modal is closed, don't render anything
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 animate-fadeIn">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto animate-slideIn"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-gray-100">
            Create New Category
          </h2>
          <button
            className="text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="categoryName"
                className="block text-sm font-medium dark:text-gray-200"
              >
                Category Name
              </label>
              <input
                id="categoryName"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name for this category"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium dark:text-gray-200">
                Select an Icon
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {AVAILABLE_ICONS.map((iconOption) => (
                  <button
                    key={iconOption.name}
                    type="button"
                    onClick={() => setIcon(iconOption.name)}
                    className={`w-10 h-10 flex items-center justify-center rounded-md border transition-all ${
                      icon === iconOption.name
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                        : "border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700"
                    }`}
                  >
                    {iconOption.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium dark:text-gray-200">
                Select a Color
              </label>
              <div className="flex items-center flex-wrap gap-3">
                <div
                  className="w-10 h-10 rounded-md border border-gray-300 dark:border-gray-600 cursor-pointer"
                  style={{ backgroundColor: color }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                <input
                  className="px-3 py-2 w-24 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  placeholder="#HEX"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Click the color box to {showColorPicker ? "hide" : "show"}{" "}
                  color picker
                </span>
              </div>

              {showColorPicker && (
                <div className="mt-2 p-3 border border-gray-300 dark:border-gray-600 rounded-md relative">
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500 p-1 rounded"
                    onClick={() => setShowColorPicker(false)}
                  >
                    <X size={16} />
                  </button>
                  <HexColorPicker
                    color={color}
                    onChange={setColor}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="categoryDescription"
                className="block text-sm font-medium dark:text-gray-200"
              >
                Description (Optional)
              </label>
              <textarea
                id="categoryDescription"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white min-h-[80px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a short description for this category"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4 sm:flex-row flex-col-reverse sm:space-y-0 space-y-2 space-y-reverse">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                onClick={handleClose}
                disabled={createCategory.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={createCategory.isPending}
              >
                {createCategory.isPending ? "Creating..." : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
