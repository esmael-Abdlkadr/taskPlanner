import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  PlusIcon,
  FolderIcon,
  InboxIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
  TagIcon,
  SettingsIcon,
  HelpCircleIcon,
  Loader,
} from "lucide-react";

// Import our custom components
import Button from "../ui/button";
import { Tooltip } from "../ui/tooltip";
import Skeleton from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { CreateWorkspaceDialog } from "../../features/workspace/component/CreateWorkspaceDialog";
import { useWorkspaces } from "../../hooks/useWorkspace";

interface SidebarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar = ({ collapsed, toggleCollapse }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const { setActiveWorkspace } = useWorkspaceStore();

  // Fetch workspaces using our custom hook
  const { data: workspaces, isLoading } = useWorkspaces();

  // Helper to check if a route is active
  const isRouteActive = (path: string) => {
    if (path === "/dashboard" && location.pathname === "/dashboard") {
      return true;
    }

    if (path.startsWith("/workspaces/")) {
      return location.pathname.startsWith(path);
    }

    return false;
  };

  // Open workspace when clicking on it
  const handleWorkspaceClick = (workspace: any) => {
    setActiveWorkspace(workspace);
    navigate(`/workspaces/${workspace._id}`);
  };

  const renderSidebarItem = (
    label: string,
    path: string,
    icon: React.ReactNode,
    badge?: number | undefined
  ) => {
    const isActive = isRouteActive(path);

    return (
      <Tooltip content={collapsed ? label : ""} side="right">
        <Link to={path}>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={`w-full justify-start gap-3 font-normal ${
              collapsed ? "justify-center px-2" : ""
            }`}
          >
            {icon}
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{label}</span>
                {badge !== undefined && (
                  <Badge
                    variant={badge > 0 ? "default" : "secondary"}
                    className={
                      badge > 0
                        ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                        : ""
                    }
                  >
                    {badge}
                  </Badge>
                )}
              </>
            )}
          </Button>
        </Link>
      </Tooltip>
    );
  };

  return (
    <>
      <div className="flex h-full w-full flex-col overflow-hidden">
        {/* App logo and name */}
        <div
          className={`flex h-16 items-center px-4 ${
            collapsed ? "justify-center" : "justify-start"
          }`}
        >
          {collapsed ? (
            <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M3 5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5z" />
                <path d="M7 9l3 3-3 3" />
                <path d="M12 9h5" />
                <path d="M12 15h5" />
              </svg>
            </div>
          ) : (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M3 5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5z" />
                  <path d="M7 9l3 3-3 3" />
                  <path d="M12 9h5" />
                  <path d="M12 15h5" />
                </svg>
              </div>
              <span className="text-lg font-semibold">TaskNest</span>
            </Link>
          )}
        </div>

        {/* Primary navigation */}
        <div className="flex flex-col gap-1 px-3 py-2">
          {renderSidebarItem(
            "Dashboard",
            "/dashboard",
            <InboxIcon className="h-5 w-5" />,
            0
          )}
          {renderSidebarItem(
            "Calendar",
            "/calendar",
            <CalendarIcon className="h-5 w-5" />
          )}
          {renderSidebarItem(
            "Today",
            "/today",
            <ClockIcon className="h-5 w-5" />,
            3
          )}
          {renderSidebarItem(
            "Important",
            "/important",
            <StarIcon className="h-5 w-5" />,
            2
          )}
          {renderSidebarItem("Tags", "/tags", <TagIcon className="h-5 w-5" />)}
        </div>

        {/* Workspaces section */}
        <div className="mt-2 px-3">
          <div
            className={`flex items-center justify-between py-2 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {!collapsed && (
              <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Workspaces
              </span>
            )}
            <Tooltip content="Create Workspace" side="right">
              <Button
                variant="ghost"
                className="h-7 w-7 p-0 flex items-center justify-center"
                onClick={() => setShowCreateWorkspace(true)}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>

          <div className="mt-1 space-y-1">
            {isLoading ? (
              // Loading placeholders
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-3 py-2 ${
                      collapsed ? "justify-center px-2" : ""
                    }`}
                  >
                    <Skeleton className="h-5 w-5 rounded-md" />
                    {!collapsed && <Skeleton className="h-4 flex-1" />}
                  </div>
                ))
            ) : workspaces && workspaces.length > 0 ? (
              // Actual workspaces
              workspaces.map((workspace) => (
                <Tooltip
                  key={workspace._id}
                  content={collapsed ? workspace.name : ""}
                  side="right"
                >
                  <Button
                    variant={
                      location.pathname.includes(`/workspaces/${workspace._id}`)
                        ? "secondary"
                        : "ghost"
                    }
                    className={`w-full justify-start gap-3 font-normal ${
                      collapsed ? "justify-center px-2" : ""
                    }`}
                    onClick={() => handleWorkspaceClick(workspace)}
                  >
                    {/* Workspace icon or color indicator */}
                    <div
                      className="h-5 w-5 rounded"
                      style={{
                        backgroundColor: workspace.color || "#6366F1",
                      }}
                    />
                    {!collapsed && (
                      <span className="flex-1 truncate text-left">
                        {workspace.name}
                      </span>
                    )}
                  </Button>
                </Tooltip>
              ))
            ) : (
              // No workspaces state
              <div
                className={`flex flex-col items-center py-2 text-sm text-gray-500 dark:text-gray-400 ${
                  collapsed ? "hidden" : ""
                }`}
              >
                <p className="mb-2">No workspaces yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateWorkspace(true)}
                  leftIcon={<PlusIcon className="h-4 w-4" />}
                >
                  Create first workspace
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Push remaining items to bottom */}
        <div className="mt-auto px-3 pb-4">
          {renderSidebarItem(
            "Settings",
            "/settings",
            <SettingsIcon className="h-5 w-5" />
          )}
          {renderSidebarItem(
            "Help & Support",
            "/help",
            <HelpCircleIcon className="h-5 w-5" />
          )}
        </div>
      </div>

      {/* Create workspace dialog */}
      {showCreateWorkspace && (
        <CreateWorkspaceDialog
          open={showCreateWorkspace}
          onOpenChange={setShowCreateWorkspace}
        />
      )}
    </>
  );
};

export default Sidebar;
