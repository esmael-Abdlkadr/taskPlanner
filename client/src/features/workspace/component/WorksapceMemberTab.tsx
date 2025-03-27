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
} from '../../../hooks/useWorkspace';
import Button from '../../../components/ui/button';
import Input from '../../../components/ui/input';
import Select from '../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Avatar } from '../../../components/ui/avatar';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '../../../components/ui/dropdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { DeleteAlert } from '../../../components/ui/alert';
import { Form, FormItem, FormLabel, FormError } from '../../../components/ui/form';
import { Badge } from '../../../components/ui/badge';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const owner = membersData?.owner;
  const members = membersData?.members || [];
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members
          </CardTitle>
          
          {canManageMembers && (
            <Button 
              size="sm"
              leftIcon={<UserPlus className="h-4 w-4" />}
              onClick={() => setShowInviteDialog(true)}
            >
              Invite
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Owner */}
            {owner && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar 
                    name={`${owner.firstName} ${owner.lastName}`}
                    src={owner.avatar}
                  />
                  
                  <div>
                    <p className="font-medium">
                      {owner.firstName} {owner.lastName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {owner.email}
                    </p>
                  </div>
                </div>
                
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  <Star className="h-3 w-3 mr-1" />
                  Owner
                </Badge>
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
                    <Badge className={
                      member.role === 'admin' 
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    }>
                      {member.role === 'admin' ? (
                        <Shield className="h-3 w-3 mr-1" />
                      ) : (
                        <User className="h-3 w-3 mr-1" />
                      )}
                      {member.role === 'admin' ? 'Admin' : 'Member'}
                    </Badge>
                    
                    {canManageMembers && (
                      <Dropdown>
                        <DropdownTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownContent align="end">
                          {/* Role management options - only for owners */}
                          {userRole === 'owner' && (
                            <>
                              <DropdownItem 
                                onClick={() => handleRoleChange(member.id, member.role === 'admin' ? 'member' : 'admin')}
                              >
                                {member.role === 'admin' ? 'Change to Member' : 'Make Admin'}
                              </DropdownItem>
                              <DropdownItem 
                                className="text-red-500 hover:text-red-600"
                                onClick={() => setMemberToRemove({
                                  id: member.id,
                                  name: `${member.user.firstName} ${member.user.lastName}`
                                })}
                              >
                                Remove
                              </DropdownItem>
                            </>
                          )}
                          
                          {/* Admins can only remove members, not other admins */}
                          {userRole === 'admin' && member.role !== 'admin' && (
                            <DropdownItem 
                              className="text-red-500 hover:text-red-600"
                              onClick={() => setMemberToRemove({
                                id: member.id,
                                name: `${member.user.firstName} ${member.user.lastName}`
                              })}
                            >
                              Remove
                            </DropdownItem>
                          )}
                        </DropdownContent>
                      </Dropdown>
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
        </CardContent>
      </Card>
      
      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          
          <Form onSubmit={handleSubmit(onSubmitInvite)}>
            <div className="space-y-4 py-4">
              <FormItem>
                <FormLabel required>Email Address</FormLabel>
                <Input
                  placeholder="colleague@example.com"
                  {...register('email')}
                  error={errors.email?.message}
                  autoFocus
                />
              </FormItem>
              
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  options={[
                    { value: 'member', label: 'Member (can view and edit)' },
                    { value: 'admin', label: 'Admin (can manage workspace)' },
                  ]}
                  {...register('role')}
                  error={errors.role?.message}
                />
              </FormItem>
            </div>
            
            <DialogFooter>
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
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Remove Member Alert */}
      <DeleteAlert
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="Remove member"
        description={`Are you sure you want to remove ${memberToRemove?.name} from this workspace? They will no longer have access to tasks and other workspace data.`}
        isLoading={removeMember.isPending}
      />
    </>
  );
};