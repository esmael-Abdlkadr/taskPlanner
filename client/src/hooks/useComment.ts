import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentService } from "../services/comment";

// In your useAddComment hook
export const useAddComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      content: string;
      taskId: string;
      parentId?: string;
      mentions?: string[];
    }) => {
      console.log("Sending comment with mentions:", data);

      return commentService.createComment({
        content: data.content,
        taskId: data.taskId,
        parentId: data.parentId,
        mentions: data.mentions,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.taskId],
      });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: any;
      taskId: string;
    }) => commentService.updateComment(commentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.taskId],
      });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId }: { commentId: string; taskId: string }) =>
      commentService.deleteComment(commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.taskId],
      });
    },
  });
};
