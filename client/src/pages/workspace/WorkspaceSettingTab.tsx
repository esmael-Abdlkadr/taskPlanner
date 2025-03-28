import { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  MoreVertical, 
  Shield,
  User, 
  X,
  Star
} from 'lucide-react';
import { 
  useWorkspaceMembers, 
  useAddWorkspaceMember,
  useUpdateMemberRole,
  useRemoveWorkspaceMember
} from "../../hooks/useWorkspace";
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import Select from '../../components/ui/select';
import { Avatar } from '../../components/common/Avatar';
import { Dropdown } from '../../components/ui/dropdown'; 
import { DeleteConfirmDialog } from '../../components/ui/DeleteConfirmDialog'; 
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface WorkspaceMembersTabProps {
  workspaceId: string;
  userRole?: string;
}

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.string().refine(val => ['admin', 'member'].includes(val), {
    message: "Role must be either admin or member"
  })
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export const WorkspaceMembersTab = ({ workspaceId, userRole = 'member' }: WorkspaceMembersTabProps) => {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{id: string, name: string} | null>(null);
  
  const { data: membersData, isLoading } = useWorkspaceMembers(workspaceId);
  const addMember = useAddWorkspaceMember(workspaceId);
  const updateRole = useUpdateMemberRole(workspaceId);
  const removeMember = useRemoveWorkspaceMember(workspaceId);
  
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'member'
    }
  });
  
  const onSubmitInvite = async (data: InviteFormValues) => {
    try {
      await addMember.mutateAsync({
        email: data.email,
        role: data.role
      });
      
      reset();
      setShowInviteDialog(false);
    } catch (error) {
      console.error("Error inviting member:", error);
    }
  };
  
  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await updateRole.mutateAsync({
        memberId,
        role: newRole
      });
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };
  
  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    
    try {
      await removeMember.mutateAsync(memberToRemove.id);
      setMemberToRemove(null);
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };
  
  // Check if current user has permission to manage members
  const canManageMembers = userRole === 'owner' || userRole === 'admin';
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members
          </h2>
        </div>
        
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  const owner = membersData?.owner;
  const members = membersData?.members || [];
  
  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members
          </h2>
          
          {canManageMembers && (
            <Button 
              size="sm"
              leftIcon={<UserPlus className="h-4 w-4" />}
              onClick={() => setShowInviteDialog(true)}
            >
              Invite
            </Button>
          )}
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {/* Owner */}
            {owner && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar 
                    name={`${owner.user?.firstName} ${owner.user?.lastName}`}
                    src={owner?.user?.avatar}
                  />
                  
                  <div>
                    <p className="font-medium">
                      {owner?.user?.firstName} {owner?.user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {owner?.user?.email}
                    </p>
                  </div>
                </div>
                
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  <Star className="h-3 w-3 mr-1" />
                  Owner
                </span>
              </div>
            )}
            
            {/* Members */}
            {members.length > 0 ? (
              members.map(member => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar 
                      name={`${member.user.firstName} ${member.user.lastName}`}
                      src={member.user.avatar}
                    />
                    
                    <div>
                      <p className="font-medium">
                        {member.user.firstName} {member.user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      member.role === 'admin' 
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    }`}>
                      {member.role === 'admin' ? (
                        <Shield className="h-3 w-3 mr-1" />
                      ) : (
                        <User className="h-3 w-3 mr-1" />
                      )}
                      {member.role === 'admin' ? 'Admin' : 'Member'}
                    </span>
                    
                    {canManageMembers && (
                      <Dropdown
                        trigger={
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                        items={[
                          // Role management options - only for owners
                          ...(userRole === 'owner' ? [{
                            label: member.role === 'admin' ? 'Change to Member' : 'Make Admin',
                            onClick: () => handleRoleChange(member.id, member.role === 'admin' ? 'member' : 'admin')
                          }, {
                            label: 'Remove',
                            onClick: () => setMemberToRemove({
                              id: member.id,
                              name: `${member.user.firstName} ${member.user.lastName}`
                            }),
                            className: "text-red-500 hover:text-red-600"
                          }] : []),
                          
                          // Admins can only remove members, not other admins
                          ...(userRole === 'admin' && member.role !== 'admin' ? [{
                            label: 'Remove',
                            onClick: () => setMemberToRemove({
                              id: member.id,
                              name: `${member.user.firstName} ${member.user.lastName}`
                            }),
                            className: "text-red-500 hover:text-red-600"
                          }] : [])
                        ]}
                      />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <p>No additional members yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Invite Dialog */}
      {showInviteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Invite Team Member</h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowInviteDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmitInvite)} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="colleague@example.com"
                  {...register('email')}
                  error={errors.email?.message}
                  autoFocus
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Role</label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select
                      options={[
                        { value: 'member', label: 'Member (can view and edit)' },
                        { value: 'admin', label: 'Admin (can manage workspace)' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.role?.message}
                    />
                  )}
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                >
                  Invite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Remove Member Dialog */}
      <DeleteConfirmDialog
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="Remove member"
        message={`Are you sure you want to remove ${memberToRemove?.name} from this workspace? They will no longer have access to tasks and other workspace data.`}
        isLoading={removeMember.isPending}
      />
    </>
  );
};