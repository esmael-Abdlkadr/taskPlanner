import Button from './button';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export const DeleteConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
  confirmText = 'Delete',
  cancelText = 'Cancel'
}: DeleteConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-red-500 mb-4">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};