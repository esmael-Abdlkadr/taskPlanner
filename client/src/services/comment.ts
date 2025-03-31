import { CommentPayload } from "../types/task.types";
import { apiRequest } from "./api";

export const commentService = {
  createComment: async (data: CommentPayload) => {
    const response = await apiRequest<{
      status: string;
      data: { comment: Comment };
    }>({
      method: "POST",
      url: `/comments`,
      data,
    });
    return response.data.comment;
  },

  updateComment: async (commentId: string, data: Partial<CommentPayload>) => {
    const response = await apiRequest<{
      status: string;
      data: { comment: Comment };
    }>({
      method: "PATCH",
      url: `/comments/${commentId}`,
      data,
    });
    return response.data.comment;
  },

  deleteComment: async (commentId: string) => {
    await apiRequest({
      method: "DELETE",
      url: `/comments/${commentId}`,
    });
    return true;
  },
};
