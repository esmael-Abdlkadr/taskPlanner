import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  workspaceService,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  Workspace
} from "../services/workspaceService";
import { toast } from "react-hot-toast";
import { useWorkspaceStore } from "../store/workspaceStore";

// Get all user workspaces
export const useWorkspaces = (options?: { status?: 'active' | 'archived' | 'all' }) => {
  const status = options?.status || 'active';
  
  return useQuery({
    queryKey: ["workspaces", { status }],
    queryFn: () => workspaceService.getWorkspaces({ status }),
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
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      
      // Update active workspace if this is the first workspace
      if (workspace) {
        setActiveWorkspace(workspace);
      }
      
      toast.success("Workspace created successfully");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create workspace");
      }
    },
  });
};

// Update an existing workspace
export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();
  const { updateActiveWorkspace } = useWorkspaceStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkspaceDto }) =>
      workspaceService.updateWorkspace(id, data),
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: ["workspace", workspace._id] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      
      // Update the active workspace info if it's the current one
      updateActiveWorkspace(workspace);
      
      toast.success("Workspace updated successfully");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update workspace");
      }
    },
  });
};

// Archive a workspace
export const useArchiveWorkspace = () => {
  const queryClient = useQueryClient();
  const { setActiveWorkspace } = useWorkspaceStore();

  return useMutation({
    mutationFn: (workspaceId: string) =>
      workspaceService.archiveWorkspace(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      
      // Get other workspaces to select a new active one if needed
      queryClient.fetchQuery<Workspace[]>({ queryKey: ["workspaces"] })
        .then((workspaces: Workspace[] | undefined) => {
          if (workspaces && workspaces.length > 0) {
            setActiveWorkspace(workspaces[0]);
          }
        });
      
      toast.success("Workspace archived successfully");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to archive workspace");
      }
    },
  });
};

export const useRestoreWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) =>
      workspaceService.restoreWorkspace(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("Workspace restored successfully");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to restore workspace");
      }
    },
  });
};

// Delete workspace alias (for backward compatibility)
export const useDeleteWorkspace = useArchiveWorkspace;

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
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add member");
      }
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
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update role");
      }
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
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to remove member");
      }
    },
  });
};