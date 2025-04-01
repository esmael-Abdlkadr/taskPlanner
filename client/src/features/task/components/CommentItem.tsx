import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Reply, Edit, Trash2 } from "lucide-react";

import { Avatar } from "../../../components/common/Avatar";
import { CommentForm } from "./CommentForm";
import Button from "../../../components/ui/button";
import { useAuthStore } from "../../../store/authStore";
import { Comment } from "../../../types/comment.types";
import {
  useAddComment,
  useUpdateComment,
  useDeleteComment,
} from "../../../hooks/useComment";

interface CommentItemProps {
  comment: Comment;
  taskId: string;
  _id?: string;
}

export const CommentItem = ({ comment, taskId }: CommentItemProps) => {
  const { user } = useAuthStore();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showOptions, setShowOptions] = useState(false);

  const addComment = useAddComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

  const isCommentOwner = user?._id === comment.userId._id;
  const formattedDate = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });

  const handleReply = async (data: { content: string }) => {
    await addComment.mutateAsync({
      content: data.content,
      taskId,
      parentId: comment._id,
    });
    setIsReplying(false);
  };

  const handleUpdate = async () => {
    await updateComment.mutateAsync({
      commentId: comment._id,
      taskId,
      data: { content: editContent },
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      await deleteComment.mutateAsync({ commentId: comment._id, taskId });
    }
  };

  return (
    <div className="mb-4">
      <div className="flex gap-3">
        <Avatar
          src={comment.userId.avatar}
          name={`${comment.userId.firstName} ${comment.userId.lastName}`}
          size="sm"
        />

        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium">
                  {comment.userId.firstName} {comment.userId.lastName}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {formattedDate}
                </span>
              </div>

              {isCommentOwner && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1"
                    onClick={() => setShowOptions(!showOptions)}
                  >
                    <MoreVertical size={14} />
                  </Button>

                  {showOptions && (
                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md z-10 w-32">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowOptions(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <Edit size={14} className="mr-2" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          handleDelete();
                          setShowOptions(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <Trash2 size={14} className="mr-2" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="mt-2">
                <textarea
                  className="w-full border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <div className="flex justify-end mt-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    disabled={updateComment.isPending}
                  >
                    {updateComment.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>
            )}
          </div>

          <div className="mt-1 flex items-center">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs text-gray-500 hover:text-primary flex items-center"
            >
              <Reply size={12} className="mr-1" /> Reply
            </button>
          </div>

          {isReplying && (
            <CommentForm
              taskId={taskId}
              parentId={comment._id}
              onSubmit={handleReply}
              isSubmitting={addComment.isPending}
              isReply={true}
              placeholder="Write a reply..."
            />
          )}

          {/* Render replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="pl-6 mt-3 border-l-2 border-gray-200 dark:border-gray-700">
              {comment.replies.map((reply) => (
                <CommentItem key={reply._id} comment={reply} taskId={taskId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
