import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTask, useUpdateTask } from "../../../hooks/useTask";
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
import { CategorySelector } from "../../../features/task/components/CategorySelector";

interface EditTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  onSuccess?: () => void;
}

// Form validation schema
const editTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(TaskPriority),
  workspaceId: z.string().min(1, "Workspace is required"),
  dueDate: z.date().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
});

type EditTaskFormValues = z.infer<typeof editTaskSchema>;

export const EditTaskModal = ({
  open,
  onOpenChange,
  taskId,
  onSuccess,
}: EditTaskModalProps) => {
  const [changingCategory, setChangingCategory] = useState(false);
  const { data: taskData, isLoading: taskLoading } = useTask(taskId);
  const updateTask = useUpdateTask(taskId);
  const { data: workspacesData } = useWorkspaces();
  const { data: categories } = useCategories();

  // Extract task data using the correct structure
  const task = taskData?.task;

  // Extract workspaces array safely
  const workspaces = workspacesData && Array.isArray(workspacesData)
    ? workspacesData
    : workspacesData && "data" in workspacesData
    ? (workspacesData as { data: { _id: string; name: string }[] }).data
    : [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      workspaceId: "",
      dueDate: undefined,
      categoryId: undefined,
      assigneeId: undefined,
    },
  });

  // Set form values when task data loads or changes
  useEffect(() => {
    if (task && open) {
      reset({
        title: task.title || "",
        description: task.description || "",
        status: (task.status || "todo") as TaskStatus,
        priority: (task.priority || "medium") as TaskPriority,
        workspaceId: typeof task.workspaceId === 'object' && task.workspaceId !== null && '_id' in task.workspaceId ? (task.workspaceId as { _id: string })._id : task.workspaceId || "",
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        categoryId: task.categoryId && typeof task.categoryId === "object" ? (task.categoryId as { _id: string })._id : task.categoryId || null,
        assigneeId: task.assigneeId?._id || null,
      });
    }
  }, [task, reset, open]);

  // Current form values
  const status = watch("status");
  const priority = watch("priority");
  const workspaceId = watch("workspaceId");
  const dueDate = watch("dueDate");
  const categoryId = watch("categoryId");

  // Prepare workspace options
  const workspaceOptions =
    workspaces && Array.isArray(workspaces)
      ? workspaces.map((workspace) => ({
          value: workspace._id,
          label: workspace.name,
        }))
      : [];

  // Handle category change
  const handleCategoryChange = (newCategoryId: string | undefined) => {
    setValue("categoryId", newCategoryId || null);
    setChangingCategory(false);
  };

  // Handle form submission
  const onSubmit = async (data: EditTaskFormValues) => {
    // Only include changed fields
    const changedData: Partial<EditTaskFormValues> = {};
    
    if (data.title !== task?.title) changedData.title = data.title;
    if (data.description !== task?.description) changedData.description = data.description;
    if (data.status !== task?.status) changedData.status = data.status;
    if (data.priority !== task?.priority) changedData.priority = data.priority;
    
    // Handle workspaceId which could be an object or string
    const currentWorkspaceId = (typeof task?.workspaceId === 'object' && task.workspaceId !== null && '_id' in task.workspaceId
        ? (task.workspaceId as { _id: string })._id
        : task?.workspaceId) as string;
    if (data.workspaceId !== currentWorkspaceId) {
      changedData.workspaceId = data.workspaceId;
    }
    
    // Format date or set to null if removed
    if (data.dueDate) {
      if (!task?.dueDate || data.dueDate.getTime() !== new Date(task?.dueDate).getTime()) {
        changedData.dueDate = data.dueDate.toISOString() as unknown as Date;
      }
    } else if (task?.dueDate) {
      changedData.dueDate = null;
    }
    
    // Handle category changes
    const oldCategoryId = task && typeof task.categoryId === "object" && task.categoryId !== null
      ? (task.categoryId as { _id: string })._id
      : task?.categoryId;
    if (data.categoryId !== oldCategoryId) {
      changedData.categoryId = data.categoryId ?? undefined;
    }

    // Handle assignee changes
    const oldAssigneeId = task ? (task.assigneeId?._id || null) : null;
    if (data.assigneeId !== oldAssigneeId) {
      changedData.assigneeId = data.assigneeId;
    }

    // Only update if something changed
    if (Object.keys(changedData).length > 0) {
      await updateTask.mutateAsync(changedData, {
        onSuccess: () => {
          onOpenChange(false);
          if (onSuccess) {
            onSuccess();
          }
        },
      });
    } else {
      // Nothing changed, just close the modal
      onOpenChange(false);
    }
  };

  // Handle close with proper cleanup
  const handleClose = () => {
    setChangingCategory(false);
    onOpenChange(false);
  };

  // Show loading state
  if (taskLoading && open) {
    return (
      <Modal
        isOpen={open}
        onClose={handleClose}
        title="Edit Task"
      >
        <ModalBody className="py-8 flex justify-center">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    );
  }

  // Get category display info
  const selectedCategory = categories?.find(cat => cat._id === categoryId);

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title={changingCategory ? "Change Category" : "Edit Task"}
    >
      {changingCategory ? (
        <>
          <ModalBody className="py-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose a category for your task. Categories help organize your tasks and apply relevant styling.
              </p>
              
              <CategorySelector
                selectedCategoryId={categoryId || undefined}
                onChange={handleCategoryChange}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setChangingCategory(false)}>
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={() => setChangingCategory(false)}
            >
              Save Category
            </Button>
          </ModalFooter>
        </>
      ) : (
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody className="space-y-4 py-2">
            <FormItem>
              <FormLabel required>Title</FormLabel>
              <Input
                placeholder="Task title"
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

              <FormItem>
                <FormLabel required>Workspace</FormLabel>
                <Select
                  options={workspaceOptions}
                  value={workspaceId}
                  onChange={(value) => setValue("workspaceId", value)}
                  placeholder="Select workspace"
                  disabled={true} // Don't allow workspace changes for existing tasks
                  error={errors.workspaceId?.message}
                />
              </FormItem>

              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <DatePicker
                  value={dueDate ?? undefined}
                  onChange={(date) => setValue("dueDate", date)}
                  placeholder="Pick a date"
                  error={errors.dueDate?.message}
                />
              </FormItem>
            </div>
            
            {/* Category selection */}
            <FormItem>
              <FormLabel>Category</FormLabel>
              <div className="flex items-center space-x-2">
                {selectedCategory ? (
                  <div className="flex items-center flex-1 border p-2 rounded-md">
                    <div 
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: selectedCategory.color }}
                    ></div>
                    <span className="text-sm">{selectedCategory.name}</span>
                  </div>
                ) : (
                  <div className="flex-1 border p-2 rounded-md text-gray-500 dark:text-gray-400 text-sm">
                    No category selected
                  </div>
                )}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setChangingCategory(true)}
                >
                  Change
                </Button>
              </div>
            </FormItem>
            
            {/* Display task metadata */}
            {task && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-4 text-sm space-y-1">
                {task.parentId && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Parent Task:</span>{" "}
                    <span className="font-medium">{task.parentId}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Task Level:</span>{" "}
                  <span className="font-medium">{task.depth || 0}</span>
                </div>
                {task.createdAt && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Created:</span>{" "}
                    <span>{new Date(task.createdAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              type="button" 
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={updateTask.isPending}
              disabled={!isDirty}
            >
              {updateTask.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </ModalFooter>
        </Form>
      )}
    </Modal>
  );
};