import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  workspaceService,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
} from "../services/workspaceService";
import { toast } from "react-hot-toast";
import { useWorkspaceStore } from "../store/workspaceStore";

// Get all user workspaces
export const useWorkspaces = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: workspaceService.getWorkspaces,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get a specific workspace
export const useWorkspace = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceService.getWorkspaceById(workspaceId),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create a new workspace
export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  const { setActiveWorkspace } = useWorkspaceStore();

  return useMutation({
    mutationFn: (data: CreateWorkspaceDto) =>
      workspaceService.createWorkspace(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["user-workspaces"] });
      setActiveWorkspace({
        _id: data._id,
        name: data.name,
        color: data.color,
        icon: data.icon,
      });
      toast.success("Workspace created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create workspace");
    },
  });
};

// Update an existing workspace
export const useUpdateWorkspace = (workspaceId: string) => {
  const queryClient = useQueryClient();
  const { updateActiveWorkspace } = useWorkspaceStore();

  return useMutation({
    mutationFn: (data: UpdateWorkspaceDto) =>
      workspaceService.updateWorkspace(workspaceId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["user-workspaces"] });

      updateActiveWorkspace({
        _id: data._id,
        name: data.name,
        color: data.color,
        icon: data.icon,
      });

      toast.success("Workspace updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update workspace");
    },
  });
};

// Delete a workspace
export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) =>
      workspaceService.deleteWorkspace(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["user-workspaces"] });
      toast.success("Workspace deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete workspace");
    },
  });
};

// Get workspace members
export const useWorkspaceMembers = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: () => workspaceService.getWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Add member to workspace
export const useAddWorkspaceMember = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) =>
      workspaceService.addWorkspaceMember(workspaceId, email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-members", workspaceId],
      });
      toast.success("Member added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add member");
    },
  });
};

// Update member role
export const useUpdateMemberRole = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      workspaceService.updateMemberRole(workspaceId, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-members", workspaceId],
      });
      toast.success("Member role updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update role");
    },
  });
};

// Remove member from workspace
export const useRemoveWorkspaceMember = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) =>
      workspaceService.removeMember(workspaceId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-members", workspaceId],
      });
      toast.success("Member removed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove member");
    },
  });
};
