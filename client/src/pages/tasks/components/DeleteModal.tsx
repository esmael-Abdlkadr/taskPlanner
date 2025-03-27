import { useTask, useDeleteTask } from "../../../hooks/useTask";
import Modal, { ModalBody, ModalFooter } from "../../../components/ui/Modal";
import Button from "../../../components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  onSuccess?: () => void;
}

export const DeleteTaskModal = ({
  open,
  onOpenChange,
  taskId,
  onSuccess,
}: DeleteTaskModalProps) => {
  const { data: taskData } = useTask(taskId);
  const deleteTask = useDeleteTask();
  
  // Get task and any subtasks info
  const task = taskData?.task || taskData;
  const hasSubtasks = task?.subtasks?.length > 0;
  
  const handleDelete = async () => {
    await deleteTask.mutateAsync(taskId, {
      onSuccess: () => {
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      }
    });
  };
  
  const handleClose = () => {
    onOpenChange(false);
  };
  
  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title="Delete Task"
    >
      <ModalBody className="py-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          
          <h3 className="text-lg font-medium mb-2">
            Are you sure you want to delete this task?
          </h3>
          
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {task?.title && (
              <>Task: <span className="font-medium text-gray-700 dark:text-gray-300">{task.title}</span></>
            )}
          </p>
          
          {hasSubtasks && (
            <div className="bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-md mb-4 text-sm text-left">
              <p className="font-medium mb-1">Warning: This task has subtasks!</p>
              <p>Deleting this task will also delete all its subtasks. This action cannot be undone.</p>
            </div>
          )}
          
          <p className="text-gray-500 dark:text-gray-400">
            This action cannot be undone.
          </p>
        </div>
      </ModalBody>
      
      <ModalFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <Button type="button" variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          isLoading={deleteTask.isPending}
          onClick={handleDelete}
        >
          {deleteTask.isPending ? "Deleting..." : "Delete"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};