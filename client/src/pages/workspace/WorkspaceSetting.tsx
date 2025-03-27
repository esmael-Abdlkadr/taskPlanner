import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Archive } from 'lucide-react';
import { useWorkspace, useUpdateWorkspace, useArchiveWorkspace } from '../../hooks/useWorkspace';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import Textarea from '../../components/ui/textarea';
import { ColorPicker } from '../../components/common/ColorPicker';
import { IconPicker } from '../../components/common/IconPicker'; 
import { DeleteConfirmDialog } from '../../components/ui/DeleteConfirmDialog'; 
import { WorkspaceMembersTab } from './WorkspaceSettingTab'; 

const workspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100),
  description: z.string().max(500, "Description too long").optional(),
});

type WorkspaceFormValues = z.infer<typeof workspaceSchema>;

const WorkspaceSettingsPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [showArchiveAlert, setShowArchiveAlert] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('folder');
  const [selectedColor, setSelectedColor] = useState('#6366F1');
  
  const { data: workspace, isLoading } = useWorkspace(workspaceId || "");
  const updateWorkspace = useUpdateWorkspace();
  const archiveWorkspace = useArchiveWorkspace();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  
  // Set form values when workspace data loads
  useEffect(() => {
    if (workspace) {
      reset({
        name: workspace.name,
        description: workspace.description || "",
      });
      
      setSelectedColor(workspace.color || "#6366F1");
      setSelectedIcon(workspace.icon || "folder");
    }
  }, [workspace, reset]);
  
  const onSubmit = async (data: WorkspaceFormValues) => {
    if (!workspaceId) return;
    
    try {
      await updateWorkspace.mutateAsync({
        id: workspaceId,
        data: {
          ...data,
          color: selectedColor,
          icon: selectedIcon
        },
      });
      
      // Show success but stay on page
    } catch (error) {
      console.error("Error updating workspace:", error);
    }
  };
  
  const handleArchive = async () => {
    if (!workspaceId) return;
    
    try {
      await archiveWorkspace.mutateAsync(workspaceId);
      navigate('/workspaces');
    } catch (error) {
      console.error("Error archiving workspace:", error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-8 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  if (!workspace) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-xl">Workspace not found</h1>
          <Button
            onClick={() => navigate('/workspaces')}
            variant="outline"
            className="mt-4"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Workspaces
          </Button>
        </div>
      </div>
    );
  }
  
  // Check if user has permission to edit
  const canEdit = workspace.role === 'owner' || workspace.role === 'admin';
  
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4"
          onClick={() => navigate(`/workspaces/${workspaceId}`)}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold">Workspace Settings</h1>
      </div>
      
      {/* Custom tab navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <button 
            className={`pb-2 px-1 font-medium text-sm ${
              activeTab === 'general' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button 
            className={`pb-2 px-1 font-medium text-sm ${
              activeTab === 'members' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('members')}
          >
            Members
          </button>
        </div>
      </div>
      
      {activeTab === 'general' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h2 className="text-lg font-medium">Workspace Details</h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block mb-1 font-medium">
                  Workspace Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter workspace name"
                  error={errors.name?.message}
                  disabled={!canEdit || workspace.isPersonal}
                  {...register("name")}
                />
                {workspace.isPersonal && (
                  <p className="text-sm text-gray-500 mt-1">
                    Personal workspace name cannot be changed
                  </p>
                )}
              </div>
              
              <div>
                <label className="block mb-1 font-medium">Description</label>
                <Textarea
                  placeholder="Describe the purpose of this workspace"
                  rows={4}
                  disabled={!canEdit}
                  {...register("description")}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-1 font-medium">Workspace Icon</label>
                  <IconPicker
                    selectedIcon={selectedIcon}
                    onSelectIcon={setSelectedIcon}
                    disabled={!canEdit}
                  />
                </div>
                
                <div>
                  <label className="block mb-1 font-medium">Workspace Color</label>
                  <ColorPicker
                    color={selectedColor}
                    onChange={setSelectedColor}
                    disabled={!canEdit}
                  />
                </div>
              </div>
              
              {canEdit && (
                <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  {workspace.role === 'owner' && !workspace.isPersonal && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setShowArchiveAlert(true)}
                      leftIcon={<Archive className="h-4 w-4" />}
                    >
                      Archive Workspace
                    </Button>
                  )}
                  
                  <Button
                    type="submit"
                    leftIcon={<Save className="h-4 w-4" />}
                    isLoading={isSubmitting}
                    disabled={!isDirty && selectedColor === workspace.color && selectedIcon === workspace.icon}
                    className={!workspace.role || workspace.role === 'owner' ? '' : 'ml-auto'}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      
      {activeTab === 'members' && (
        <WorkspaceMembersTab workspaceId={workspaceId || ''} userRole={workspace.role} />
      )}
      
      <DeleteConfirmDialog
        isOpen={showArchiveAlert}
        onClose={() => setShowArchiveAlert(false)}
        onConfirm={handleArchive}
        title="Archive workspace"
        message="Are you sure you want to archive this workspace? The workspace and all its tasks will be hidden from view but can be restored later."
        isLoading={archiveWorkspace.isPending}
        confirmText="Archive"
      />
    </div>
  );
};

export default WorkspaceSettingsPage;