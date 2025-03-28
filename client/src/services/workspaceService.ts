import { Task } from "../types/task.types";
import { apiRequest } from "./api";


export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  color: string;
  isArchived: boolean;
  isPersonal: boolean;
  role: 'owner' | 'admin' | 'member';
  icon: string;
  createdAt: string;
  updatedAt: string;
  settings: {
    defaultView: 'list' | 'board' | 'calendar' | 'timeline' | 'mindmap';
    taskSort: 'position' | 'priority' | 'dueDate' | 'title' | 'createdAt';
    taskSortDirection: 'asc' | 'desc';
  };
  members: WorkspaceMember[];
  stats:
    | {
        totalTasks: number;
        completedTasks: number;
        overdueTasks: number;
        completionRate: number;
        memberCount: number;
      }
    | undefined;
}
export interface WorkspaceWithStats extends Workspace {
  role: 'owner' | 'admin' | 'member';
  stats: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    completionRate: number;
    memberCount: number;
  };
  recentTasks?: Task[];
}

export interface WorkspaceMember {
  id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
  };
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface CreateWorkspaceDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isPersonal?: boolean;
}

export interface UpdateWorkspaceDto {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export const workspaceService = {
  getWorkspaces: async (options?: { status?: 'active' | 'archived' | 'all' }): Promise<Workspace[]> => {
    const status = options?.status || 'active';
    const response = await apiRequest<{ status: string; data: { workspaces: Workspace[] } }>({
      method: "GET",
      url: `/workspaces?status=${status}`,
    });
    
    return response.data.workspaces;
  },
  
  getWorkspaceById: async (workspaceId: string): Promise<WorkspaceWithStats> => {
    const response = await apiRequest<{ 
      status: string; 
      data: { 
        workspace: Workspace; 
        stats: {
          totalTasks: number;
          completedTasks: number;
          overdueTasks: number;
          completionRate: number;
          memberCount: number;
        };
        role: string;
        recentTasks: Task[];
      } 
    }>({
      method: "GET",
      url: `/workspaces/${workspaceId}`,
    });
    
    return {
      ...response.data.workspace,
      role: response.data.role as 'owner' | 'admin' | 'member',
      stats: response.data.stats,
      recentTasks: response.data.recentTasks
    };
  },

  createWorkspace: async (
    workspaceData: CreateWorkspaceDto
  ): Promise<Workspace> => {
    const response = await apiRequest<{ status: string; data: { workspace: Workspace } }>({
      method: "POST",
      url: "/workspaces",
      data: workspaceData,
    });
    
    return response.data.workspace;
  },

  updateWorkspace: async (
    workspaceId: string,
    workspaceData: UpdateWorkspaceDto
  ): Promise<Workspace> => {
    const response = await apiRequest<{ status: string; data: { workspace: Workspace } }>({
      method: "PATCH",
      url: `/workspaces/${workspaceId}`,
      data: workspaceData,
    });
    
    return response.data.workspace;
  },

  archiveWorkspace: async (workspaceId: string): Promise<void> => {
    await apiRequest({
      method: "POST",
      url: `/workspaces/${workspaceId}/archive`,
    });
  },
  restoreWorkspace: async (workspaceId: string): Promise<void> => {
    await apiRequest({
      method: "POST",
      url: `/workspaces/${workspaceId}/restore`,
    });
  },

  getWorkspaceMembers: async (workspaceId: string): Promise<{ 
    owner: WorkspaceMember; 
    members: WorkspaceMember[] 
  }> => {
    const response = await apiRequest<{ 
      status: string; 
      data: { 
        owner: WorkspaceMember; 
        members: WorkspaceMember[] 
      } 
    }>({
      method: "GET",
      url: `/workspaces/${workspaceId}/members`,
    });
    
    return response.data;
  },

  addWorkspaceMember: async (
    workspaceId: string,
    email: string,
    role: string
  ): Promise<WorkspaceMember> => {
    const response = await apiRequest<{ status: string; data: { member: WorkspaceMember } }>({
      method: "POST",
      url: `/workspaces/${workspaceId}/members`,
      data: { email, role },
    });
    
    return response.data.member;
  },

  updateMemberRole: async (
    workspaceId: string,
    memberId: string,
    role: string
  ): Promise<WorkspaceMember> => {
    const response = await apiRequest<{ status: string; data: { member: WorkspaceMember } }>({
      method: "PATCH",
      url: `/workspaces/${workspaceId}/members/${memberId}`,
      data: { role },
    });
    
    return response.data.member;
  },

  removeMember: async (
    workspaceId: string,
    memberId: string
  ): Promise<void> => {
    await apiRequest({
      method: "DELETE",
      url: `/workspaces/${workspaceId}/members/${memberId}`,
    });
  },
};