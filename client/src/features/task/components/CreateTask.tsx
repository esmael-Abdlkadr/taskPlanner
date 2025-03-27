import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTask } from "../../../hooks/useTask";
import { TaskPriority, TaskStatus } from "../../../types/task.types";
import { useWorkspaces } from "../../../hooks/useWorkspace";
import { useCategories } from "../../../hooks/useCategory";

// Import our custom components
import Modal, {
  ModalBody,
  ModalFooter,
} from "../../../components/ui/Modal";
import { Form, FormItem, FormLabel } from "../../../components/ui/form";
import Select from "../../../components/ui/select";
import Button from "../../../components/ui/button";
import Textarea from "../../../components/ui/textarea";
import DatePicker from "../../../components/ui/datePicker";
import Input from "../../../components/ui/input";
import { CategorySelector } from "./CategorySelector"; 

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentTaskId?: string;
  defaultWorkspaceId?: string;
  onSuccess?: () => void;
}

// Form validation schema
const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(TaskPriority),
  workspaceId: z.string().min(1, "Workspace is required"),
  dueDate: z.date().optional(),
  categoryId: z.string().optional(),
});

type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

export const CreateTaskDialog = ({
  open,
  onOpenChange,
  parentTaskId,
  defaultWorkspaceId,
  onSuccess,
}: CreateTaskDialogProps) => {
  // Track the current step of the creation process
  const [step, setStep] = useState<"category" | "details">("category");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  
  const createTask = useCreateTask();
  const { data: workspacesData, isLoading: workspacesLoading } = useWorkspaces();
  const { data: categories } = useCategories();

  // Extract workspaces array safely - adjust this based on your actual data structure
  const workspaces = Array.isArray(workspacesData)
    ? workspacesData
    : workspacesData?.data
    ? workspacesData.data
    : [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      workspaceId: defaultWorkspaceId || "",
      dueDate: undefined,
      categoryId: undefined,
    },
  });

  // Reset form and go back to category selection when dialog opens
  useEffect(() => {
    if (open) {
      // Skip category selection for subtasks
      setStep(parentTaskId ? "details" : "category");
      setSelectedCategoryId(undefined);
      
      const firstWorkspaceId =
        workspaces && workspaces.length > 0 ? workspaces[0]?._id : "";

      reset({
        title: "",
        description: "",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        workspaceId: defaultWorkspaceId || firstWorkspaceId,
        dueDate: undefined,
        categoryId: undefined,
      });
    }
  }, [open, reset, defaultWorkspaceId, workspaces, parentTaskId]);

  // When a category is selected, update the form value and move to the next step
  const handleCategorySelect = (categoryId: string | undefined) => {
    setSelectedCategoryId(categoryId);
    setValue("categoryId", categoryId);
  };

  // Proceed to task details step
  const handleNextStep = () => {
    setValue("categoryId", selectedCategoryId);
    setStep("details");
  };

  // Go back to category selection step
  const handleBackStep = () => {
    setStep("category");
  };

  const onSubmit = async (data: CreateTaskFormValues) => {
    await createTask.mutateAsync(
      {
        ...data,
        description: data.description || "",
        dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
        parentId: parentTaskId, // Make sure parentId is passed for subtasks
        categoryId: selectedCategoryId,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          // Call onSuccess callback if provided
          if (onSuccess) {
            onSuccess();
          }
        },
      }
    );
  };

  // Current values
  const status = watch("status");
  const priority = watch("priority");
  const workspaceId = watch("workspaceId");
  const dueDate = watch("dueDate");

  // Prepare workspace options safely
  const workspaceOptions =
    workspaces && Array.isArray(workspaces)
      ? workspaces.map((workspace) => ({
          value: workspace._id,
          label: workspace.name,
        }))
      : [];
      
  // Handle close with proper cleanup
  const handleClose = () => {
    setStep("category");
    setSelectedCategoryId(undefined);
    onOpenChange(false);
  };

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title={
        parentTaskId
          ? "Create Subtask"
          : step === "category" 
          ? "Select Task Category" 
          : "Create New Task"
      }
    >
      {step === "category" && !parentTaskId ? (
        <>
          <ModalBody className="py-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose a category for your task. Categories help organize your tasks and apply relevant styling.
              </p>
              
              <CategorySelector
                selectedCategoryId={selectedCategoryId}
                onChange={handleCategorySelect}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleNextStep}
              disabled={!selectedCategoryId}
            >
              Next
            </Button>
          </ModalFooter>
        </>
      ) : (
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody className="space-y-4 py-2">
            <FormItem>
              <FormLabel required>Title</FormLabel>
              <Input
                placeholder={parentTaskId ? "Subtask title" : "Task title"}
                error={errors.title?.message}
                {...register("title")}
              />
            </FormItem>

            <FormItem>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Task description"
                rows={3}
                error={errors.description?.message}
                {...register("description")}
              />
            </FormItem>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormItem>
                <FormLabel required>Workspace</FormLabel>
                <Select
                  options={workspaceOptions}
                  value={workspaceId}
                  onChange={(value) => setValue("workspaceId", value)}
                  placeholder="Select workspace"
                  disabled={workspacesLoading || !!parentTaskId} // Disable if it's a subtask
                  error={errors.workspaceId?.message}
                />
              </FormItem>

              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <DatePicker
                  value={dueDate}
                  onChange={(date) => setValue("dueDate", date)}
                  placeholder="Pick a date"
                  error={errors.dueDate?.message}
                />
              </FormItem>

              <FormItem>
                <FormLabel required>Status</FormLabel>

                <Select
                  options={[
                    { value: TaskStatus.TODO, label: "TODO" },
                    { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
                    { value: TaskStatus.DONE, label: "Completed" },
                    { value: TaskStatus.ARCHIVED, label: "Archived" },
                  ]}
                  value={status}
                  onChange={(value) => setValue("status", value as TaskStatus)}
                  placeholder="Select status"
                  error={errors.status?.message}
                />
              </FormItem>

              <FormItem>
                <FormLabel required>Priority</FormLabel>
                <Select
                  options={[
                    { value: TaskPriority.LOW, label: "Low" },
                    { value: TaskPriority.MEDIUM, label: "Medium" },
                    { value: TaskPriority.HIGH, label: "High" },
                    { value: TaskPriority.URGENT, label: "Urgent" },
                  ]}
                  value={priority}
                  onChange={(value) => setValue("priority", value as TaskPriority)}
                  placeholder="Select priority"
                  error={errors.priority?.message}
                />
              </FormItem>
            </div>
            
            {/* Show subtask info if this is creating a subtask */}
            {parentTaskId && (
              <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md text-sm">
                <p>Creating a subtask under the parent task</p>
              </div>
            )}
            
            {/* Show selected category info */}
            {selectedCategoryId && !parentTaskId && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Selected Category:</span>
                <div className="flex items-center">
                  {categories?.find(cat => cat._id === selectedCategoryId) && (
                    <>
                      <div 
                        className="w-4 h-4 rounded-full mr-1"
                        style={{ 
                          backgroundColor: categories?.find(cat => cat._id === selectedCategoryId)?.color 
                        }}
                      ></div>
                      <span>
                        {categories?.find(cat => cat._id === selectedCategoryId)?.name}
                      </span>
                    </>
                  )}
                  <button 
                    type="button"
                    className="ml-2 text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={handleBackStep}
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            {/* Show back button on details step (if not a subtask) */}
            {step === "details" && !parentTaskId && (
              <Button type="button" variant="outline" onClick={handleBackStep}>
                Back
              </Button>
            )}
            <Button
              type="button" 
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createTask.isPending}>
              {createTask.isPending ? "Creating..." : parentTaskId ? "Create Subtask" : "Create Task"}
            </Button>
          </ModalFooter>
        </Form>
      )}
    </Modal>
  );
};