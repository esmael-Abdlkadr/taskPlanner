import { useAddComment } from "../../../hooks/useComment";
import { useTaskComments } from "../../../hooks/useTask";
import { Comment } from "../../../types/comment.types";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";
import { MessageCircle } from "lucide-react";

interface CommentsSectionProps {
  taskId: string;
}

export const CommentsSection = ({ taskId }: CommentsSectionProps) => {
  const {
    data: comments,
    isLoading,
    isError,
  } = useTaskComments(taskId) as {
    data: Comment[] | undefined;
    isLoading: boolean;
    isError: boolean;
  };
  const addComment = useAddComment();

  const handleAddComment = async (data: {
    content: string;
    taskId: string;
    parentId?: string;
    mentions?: string[];
  }) => {
    await addComment.mutateAsync({
      content: data.content,
      taskId: data.taskId,
      parentId: data.parentId,
    });
  };

  if (isLoading) {
    return (
      <div className="mt-8 py-4">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <MessageCircle className="mr-2" size={20} />
          Comments
        </h2>
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-8 py-4">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <MessageCircle className="mr-2" size={20} />
          Comments
        </h2>
        <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-md">
          Error loading comments. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t dark:border-gray-700 pt-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <MessageCircle className="mr-2" size={20} />
        Comments {comments && comments.length > 0 && `(${comments.length})`}
      </h2>

      <CommentForm
        taskId={taskId}
        onSubmit={handleAddComment}
        isSubmitting={addComment.isPending}
      />

      <div className="mt-6 space-y-4">
        {!comments || comments.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-6">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} taskId={taskId} />
          ))
        )}
      </div>
    </div>
  );
};
