import React, { useState, useEffect, useRef } from "react";
import { userService } from "../../../services/userService";
import { Avatar } from "../../../components/common/Avatar";
import { AtSign } from "lucide-react";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  role?: string;
}

interface MentionSelectorProps {
  isOpen: boolean;
  workspaceId: string;
  query: string;
  onSelectUser: (user: User) => void;
  position: { top: number; left: number };
}

export const MentionSelector = ({
  isOpen,
  workspaceId,
  query,
  onSelectUser,
  position,
}: MentionSelectorProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch users matching the query
  useEffect(() => {
    if (!isOpen || !workspaceId) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const results = await userService.searchWorkspaceMembers(
          workspaceId,
          query
        );
        console.log("API returned users:", results);
        setUsers(results);
        setSelectedIndex(0); // Reset selection when results change
      } catch (error) {
        console.error("Failed to fetch users for mention:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, workspaceId, query]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % users.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
          break;
        case "Enter":
          e.preventDefault();
          if (users.length > 0) {
            console.log("User selected via keyboard:", users[selectedIndex]);
            onSelectUser(users[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, users, selectedIndex, onSelectUser]);

  const handleUserClick = (user: User) => {
    console.log("User clicked:", user);
    onSelectUser(user);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 w-64 max-h-64 overflow-auto"
      style={{
        top: position.top,
        left: position.left,
        maxWidth: "90%",
      }}
    >
      <div className="p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex items-center">
        <AtSign size={14} className="text-primary mr-2" />
        <span className="text-sm font-medium">Mention a team member</span>
      </div>

      {loading ? (
        <div className="p-3 text-center">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm mt-1">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No matching users found
        </div>
      ) : (
        <ul className="py-1">
          {users.map((user, index) => (
            <li
              key={user._id}
              className={`px-3 py-2 flex items-center cursor-pointer ${
                selectedIndex === index
                  ? "bg-primary/10 dark:bg-primary/20 text-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleUserClick(user)}
            >
              <Avatar
                src={user.avatar}
                name={`${user.firstName} ${user.lastName}`}
                size="xs"
              />
              <div className="ml-2">
                <div className="font-medium text-sm">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
