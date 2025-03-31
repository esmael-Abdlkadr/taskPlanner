import { apiRequest } from "./api";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
}

export const userService = {
  getWorkspaceMembers: async (workspaceId: string) => {
    const response = await apiRequest<{
      status: string;
      data: { owner: User; members: any[] };
    }>({
      method: "GET",
      url: `/workspaces/${workspaceId}/members`,
    });

    const formattedMembers = response.data.members.map((member) => ({
      ...member.user,
      role: member.role,
    }));

    // Include workspace owner
    return [
      {
        ...response.data.owner,
        role: "owner",
      },
      ...formattedMembers,
    ];
  },

  searchWorkspaceMembers: async (workspaceId: string, query: string) => {
    const allMembers = await userService.getWorkspaceMembers(workspaceId);

    if (!query.trim()) {
      return allMembers;
    }

    const searchQuery = query.toLowerCase();
    return allMembers.filter(
      (member) =>
        member.firstName.toLowerCase().includes(searchQuery) ||
        member.lastName.toLowerCase().includes(searchQuery) ||
        `${member.firstName} ${member.lastName}`
          .toLowerCase()
          .includes(searchQuery) ||
        member.email.toLowerCase().includes(searchQuery)
    );
  },
};
