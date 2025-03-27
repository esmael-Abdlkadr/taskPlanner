import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTask } from "../../../hooks/useTask";
import { TaskPriority, TaskStatus } from "../../../types/task.types";
import { useWorkspaces } from "../../../hooks/useWorkspace";

// Import our custom components
import Modal, {
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "../../../components/ui/Modal";
import { Form, FormItem, FormLabel } from "../../../components/ui/form";
import Select from "../../../components/ui/select";
import Button from "../../../components/ui/button";
import Textarea from "../../../components/ui/textarea";
import DatePicker from "../../../components/ui/datePicker";
import Input from "../../../components/ui/input";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentTaskId?: string;
  defaultWorkspaceId?: string;
}

// Form validation schema
const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(TaskPriority),
  workspaceId: z.string().min(1, "Workspace is required"),
  dueDate: z.date().optional(),
});

type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

export const CreateTaskDialog = ({
  open,
  onOpenChange,
  parentTaskId,
  defaultWorkspaceId,
}: CreateTaskDialogProps) => {
  const createTask = useCreateTask();
  const { data: workspacesData, isLoading: workspacesLoading } =
    useWorkspaces();

  // Extract workspaces array safely - adjust this based on your actual data structure
  const workspaces = Array.isArray(workspacesData)
    ? workspacesData
    : workspacesData?.data
    ? workspacesData.data
    : [];

  console.log("Workspaces data:", workspacesData); // Debug: check data structure

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
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      const firstWorkspaceId =
        workspaces && workspaces.length > 0 ? workspaces[0]?._id : "";

      reset({
        title: "",
        description: "",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        workspaceId: defaultWorkspaceId || firstWorkspaceId,
        dueDate: undefined,
      });
    }
  }, [open, reset, defaultWorkspaceId, workspaces]);

  const onSubmit = async (data: CreateTaskFormValues) => {
    await createTask.mutateAsync(
      {
        ...data,
        description: data.description || "",
        dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
        parentTaskId,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
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

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Create New Task"
    >
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
              <FormLabel required>Workspace</FormLabel>
              <Select
                options={workspaceOptions}
                value={workspaceId}
                onChange={(value) => setValue("workspaceId", value)}
                placeholder="Select workspace"
                disabled={workspacesLoading}
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
                  { value: TaskStatus.TODO, label: "To Do" },
                  { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
                  { value: TaskStatus.DONE, label: "Done" },
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
                onChange={(value) =>
                  setValue("priority", value as TaskPriority)
                }
                placeholder="Select priority"
                error={errors.priority?.message}
              />
            </FormItem>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={createTask.isPending}>
            {createTask.isPending ? "Creating..." : "Create Task"}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};
