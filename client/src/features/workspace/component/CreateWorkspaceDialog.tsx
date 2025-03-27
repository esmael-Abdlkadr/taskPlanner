import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateWorkspace } from "../../../hooks/useWorkspace";

// Import our custom components
import Modal, { ModalBody, ModalFooter } from "../../../components/ui/Modal";
import {
  Form,
  FormError,
  FormItem,
  FormLabel,
} from "../../../components/ui/form";
import Input from "../../../components/ui/input";
import Button from "../../../components/ui/button";
import Textarea from "../../../components/ui/textarea";

// Array of workspace color options
const workspaceColors = [
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#F43F5E", // Rose
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#14B8A6", // Teal
  "#0EA5E9", // Sky
  "#3B82F6", // Blue
  "#6B7280", // Gray
];

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Form validation schema
const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Workspace name is required")
    .max(50, "Name cannot exceed 50 characters"),
  description: z
    .string()
    .max(200, "Description cannot exceed 200 characters")
    .optional(),
  color: z.string().min(1, "Please select a color"),
});

type CreateWorkspaceFormValues = z.infer<typeof createWorkspaceSchema>;

export const CreateWorkspaceDialog = ({
  open,
  onOpenChange,
}: CreateWorkspaceDialogProps) => {
  const createWorkspace = useCreateWorkspace();
  const [selectedColor, setSelectedColor] = useState(workspaceColors[0]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateWorkspaceFormValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      description: "",
      color: workspaceColors[0],
    },
  });

  // Set color in form when selected
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setValue("color", color);
  };

  const onSubmit = async (data: CreateWorkspaceFormValues) => {
    await createWorkspace.mutateAsync(
      {
        name: data.name,
        description: data.description || "",
        color: data.color,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Create New Workspace"
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="space-y-4">
          <FormItem>
            <FormLabel required>Workspace Name</FormLabel>
            <Input
              placeholder="Enter workspace name"
              error={errors.name?.message}
              {...register("name")}
            />
          </FormItem>

          <FormItem>
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="Describe the purpose of this workspace"
              rows={3}
              error={errors.description?.message}
              {...register("description")}
            />
          </FormItem>

          <FormItem>
            <FormLabel required>Color</FormLabel>
            <input type="hidden" {...register("color")} value={selectedColor} />
            <div className="grid grid-cols-6 gap-2 mt-2">
              {workspaceColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-8 w-8 rounded-full transition-all ${
                    selectedColor === color
                      ? "ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </div>
            {errors.color?.message && (
              <FormError>{errors.color.message}</FormError>
            )}
          </FormItem>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={createWorkspace.isPending}>
            {createWorkspace.isPending ? "Creating..." : "Create Workspace"}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};
