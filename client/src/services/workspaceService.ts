import { apiRequest } from "./api";

export interface Workspace {
  _id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  members: WorkspaceMember[];
  taskCount: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  };
}

export interface WorkspaceMember {
  _id: string;
  userId: string;
  workspaceId: string;
  role: "owner" | "admin" | "member";
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  joinedAt: string;
}

export interface CreateWorkspaceDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateWorkspaceDto {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export const workspaceService = {
    getWorkspaces: async (): Promise<Workspace[]> => {
        const response = await apiRequest<{ data: { workspaces: Workspace[] } }>({
          method: "GET",
          url: "/workspaces",
        });
        
        // Extract and return just the workspaces array
        return response.data.workspaces;
      },
      
  getWorkspaceById: async (workspaceId: string): Promise<Workspace> => {
    return apiRequest({
      method: "GET",
      url: `/workspaces/${workspaceId}`,
    });
  },

  createWorkspace: async (
    workspaceData: CreateWorkspaceDto
  ): Promise<Workspace> => {
    return apiRequest({
      method: "POST",
      url: "/workspaces",
      data: workspaceData,
    });
  },

  updateWorkspace: async (
    workspaceId: string,
    workspaceData: UpdateWorkspaceDto
  ): Promise<Workspace> => {
    return apiRequest({
      method: "PATCH",
      url: `/workspaces/${workspaceId}`,
      data: workspaceData,
    });
  },

  deleteWorkspace: async (workspaceId: string): Promise<void> => {
    return apiRequest({
      method: "DELETE",
      url: `/workspaces/${workspaceId}`,
    });
  },

  getWorkspaceMembers: async (
    workspaceId: string
  ): Promise<WorkspaceMember[]> => {
    return apiRequest({
      method: "GET",
      url: `/workspaces/${workspaceId}/members`,
    });
  },

  addWorkspaceMember: async (
    workspaceId: string,
    email: string,
    role: string
  ): Promise<WorkspaceMember> => {
    return apiRequest({
      method: "POST",
      url: `/workspaces/${workspaceId}/members`,
      data: { email, role },
    });
  },

  updateMemberRole: async (
    workspaceId: string,
    memberId: string,
    role: string
  ): Promise<WorkspaceMember> => {
    return apiRequest({
      method: "PATCH",
      url: `/workspaces/${workspaceId}/members/${memberId}`,
      data: { role },
    });
  },

  removeMember: async (
    workspaceId: string,
    memberId: string
  ): Promise<void> => {
    return apiRequest({
      method: "DELETE",
      url: `/workspaces/${workspaceId}/members/${memberId}`,
    });
  },
};
