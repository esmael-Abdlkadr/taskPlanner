import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';
import Button from '../../../components/ui/button';
import Input from '../../../components/ui/input';
import Textarea from '../../../components/ui/textarea';
import { useCreateWorkspace } from '../../../hooks/useWorkspace';
import { ColorPicker } from '../../../components/common/ColorPicker'; 
import { IconPicker } from '../../../components/common/IconPicker'; 

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const workspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(50, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
});

type FormValues = z.infer<typeof workspaceSchema>;

export const CreateWorkspaceDialog = ({ open, onOpenChange }: CreateWorkspaceDialogProps) => {
  const [selectedIcon, setSelectedIcon] = useState('folder');
  const [selectedColor, setSelectedColor] = useState('#6366F1');
  
  const createWorkspace = useCreateWorkspace();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  });
  
  const onSubmit = async (data: FormValues) => {
    try {
      await createWorkspace.mutateAsync({
        ...data,
        icon: selectedIcon,
        color: selectedColor
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleClose = () => {
    reset();
    onOpenChange(false);
  };
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Workspace</h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              placeholder="Enter workspace name"
              {...register('name')}
              error={errors.name?.message}
              autoFocus
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block font-medium mb-1">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="What's this workspace for?"
              rows={3}
              {...register('description')}
              error={errors.description?.message}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Icon</label>
              <IconPicker
                selectedIcon={selectedIcon} 
                onSelectIcon={setSelectedIcon}
              />
            </div>
            
            <div>
              <label className="block font-medium mb-1">Color</label>
              <ColorPicker
                color={selectedColor}
                onChange={setSelectedColor}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Create Workspace
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};