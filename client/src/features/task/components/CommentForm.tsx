import { useState, useRef, useEffect } from "react";
import { Send, X, AtSign } from "lucide-react";
import Button from "../../../components/ui/button";
import { Avatar } from "../../../components/common/Avatar";
import { useAuthStore } from "../../../store/authStore";
import { MentionSelector } from "./MentionSelector";
import { useTask } from "../../../hooks/useTask";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
}

interface MentionedUser {
  _id: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

interface CommentFormProps {
  taskId: string;
  parentId?: string;
  onSubmit: (data: {
    content: string;
    taskId: string;
    parentId?: string;
    mentions?: string[];
  }) => Promise<void>;
  isSubmitting?: boolean;
  isReply?: boolean;
  placeholder?: string;
}

export const CommentForm = ({
  taskId,
  parentId,
  onSubmit,
  isSubmitting = false,
  isReply = false,
  placeholder = "Add a comment...",
}: CommentFormProps) => {
  const { user } = useAuthStore();
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [mentionState, setMentionState] = useState({
    isActive: false,
    query: "",
    position: { top: 0, left: 0 },
    startPos: 0,
  });
  const [mentionedUsers, setMentionedUsers] = useState<MentionedUser[]>([]);
  const { data: taskData } = useTask(taskId);
  const workspaceId = taskData?.task?.workspaceId || "";

  // Handle text changes and detect @ symbols to trigger the mention dropdown
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    const textarea = e.target;
    const cursorPos = textarea.selectionStart;

    // Look backward from cursor to find an @ symbol
    let startPos = cursorPos;
    while (
      startPos > 0 &&
      newContent[startPos - 1] !== " " &&
      newContent[startPos - 1] !== "\n" &&
      newContent[startPos - 1] !== "@"
    ) {
      startPos--;
    }

    // Check if we found an @ symbol
    const isMentioning = startPos > 0 && newContent[startPos - 1] === "@";

    if (isMentioning) {
      const mentionText = newContent.substring(startPos, cursorPos);
      const coords = getCaretCoordinates(textarea);
      setMentionState({
        isActive: true,
        query: mentionText,
        position: { top: coords.top + 20, left: coords.left },
        startPos: startPos - 1, // Include the @ symbol
      });
    } else {
      setMentionState((prev) => ({ ...prev, isActive: false }));
    }
  };
  const getCaretCoordinates = (element: HTMLTextAreaElement) => {
    return {
      left: element.offsetLeft + 10,
      top: element.offsetTop + 30,
    };
  };
  const handleSelectUser = (selectedUser: User) => {
    const beforeMention = content.substring(0, mentionState.startPos);
    const afterMention = content.substring(
      textareaRef.current?.selectionStart || 0
    );
    const displayName = `@${selectedUser.firstName} ${selectedUser.lastName} `;
    const newContent = beforeMention + displayName + afterMention;
    setContent(newContent);
    setMentionState((prev) => ({ ...prev, isActive: false }));
    const alreadyMentioned = mentionedUsers.some(
      (mention) => mention._id === selectedUser._id
    );

    if (!alreadyMentioned) {
      setMentionedUsers((prev) => [
        ...prev,
        {
          _id: selectedUser._id,
          firstName: selectedUser.firstName,
          lastName: selectedUser.lastName,
          avatar: selectedUser.avatar,
        },
      ]);
    }
    if (textareaRef.current) {
      textareaRef.current.focus();
      const newCursorPos = beforeMention.length + displayName.length;
      textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
    }
  };

  const removeMention = (userId: string) => {
    const userToRemove = mentionedUsers.find((user) => user._id === userId);

    if (!userToRemove) return;
    const mentionPattern = `@${userToRemove.firstName} ${userToRemove.lastName} `;
    const newContent = content.replace(mentionPattern, "");
    setContent(newContent);
    setMentionedUsers((prev) => prev.filter((user) => user._id !== userId));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const mentionIds = mentionedUsers.map((user) => user._id);
    console.log("Submitting with mentions:", mentionIds);

    try {
      await onSubmit({
        content,
        taskId,
        parentId,
        mentions: mentionIds.length > 0 ? mentionIds : undefined,
      });
      setContent("");
      setIsFocused(false);
      setMentionedUsers([]);
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mentionState.isActive && e.target !== textareaRef.current) {
        setMentionState((prev) => ({ ...prev, isActive: false }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mentionState.isActive]);

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-start gap-3 ${isReply ? "pl-12 mt-2" : ""} 
        ${
          isFocused
            ? "bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
            : ""
        }`}
    >
      <Avatar
        src={user?.avatar || ""}
        name={`${user?.firstName} ${user?.lastName}`}
        size="sm"
      />

      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          className={`w-full border rounded-lg px-3 py-2 ${
            isFocused ? "min-h-[100px]" : "min-h-[60px]"
          } resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all 
            bg-gray-50 dark:bg-gray-800`}
          placeholder={placeholder}
          value={content}
          onChange={handleContentChange}
          onFocus={() => setIsFocused(true)}
          disabled={isSubmitting}
        />

        {mentionedUsers.length > 0 && isFocused && (
          <div className="mt-2 text-xs text-gray-500">
            <div className="flex items-center mb-1">
              <AtSign size={14} className="mr-1" />
              <span>Mentions in this comment:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {mentionedUsers.map((user) => (
                <span
                  key={user._id}
                  className="inline-flex items-center bg-primary/10 text-primary rounded-md px-2 py-1"
                >
                  <span className="font-medium">
                    @{user.firstName} {user.lastName}
                  </span>
                  <button
                    type="button"
                    className="ml-1 hover:text-primary-dark"
                    onClick={() => removeMention(user._id)}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mention selector dropdown */}
        {mentionState.isActive && workspaceId && (
          <MentionSelector
            isOpen={mentionState.isActive}
            workspaceId={workspaceId}
            query={mentionState.query}
            onSelectUser={handleSelectUser}
            position={mentionState.position}
          />
        )}

        {isFocused && (
          <div className="flex justify-between items-center mt-3">
            <div className="text-gray-500 text-sm">
              <span className="text-gray-400 flex items-center">
                <AtSign size={14} className="mr-1" />
                Type @ to mention someone
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsFocused(false);
                  if (!content.trim()) setContent("");
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !content.trim()}
                leftIcon={<Send size={14} />}
              >
                {isSubmitting
                  ? "Posting..."
                  : isReply
                  ? "Reply"
                  : "Post Comment"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};
