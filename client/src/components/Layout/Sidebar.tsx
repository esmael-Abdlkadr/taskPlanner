import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  PlusIcon,
  LayoutDashboardIcon,
  CheckSquareIcon,
  CalendarIcon,
  StarIcon,
  SettingsIcon,
  HelpCircleIcon,
  FolderIcon,
  FolderOpenIcon,
  ChevronRightIcon,
  BriefcaseIcon,
  UserPlusIcon,
  Users2Icon,
} from "lucide-react";

// Import our custom components
import Button from "../ui/button";
import { Tooltip } from "../ui/tooltip";
import Skeleton from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { CreateWorkspaceDialog } from "../../features/workspace/component/CreateWorkspaceDialog";
import { useWorkspaces } from "../../hooks/useWorkspace";
import { Dropdown } from "../ui/dropdown";

interface SidebarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar = ({ collapsed, toggleCollapse }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore();

  // Fetch workspaces using our custom hook
  const { data: workspaces, isLoading } = useWorkspaces();

  // Helper to check if a route is active
  const isRouteActive = (path: string) => {
    // Exact match for dashboard
    if (path === "/dashboard" && location.pathname === "/dashboard") {
      return true;
    }
    
    // Exact match for specific routes
    if (path === location.pathname) {
      return true;
    }

    // Special case for workspace routes
    if (path.startsWith("/workspaces/") && path !== "/workspaces/all") {
      return location.pathname.startsWith(path);
    }
    
    // Special case for workspaces listing
    if (path === "/workspaces" || path === "/workspaces/all") {
      return location.pathname === "/workspaces" || 
             location.pathname === "/workspaces/all";
    }

    return false;
  };

  // Open workspace when clicking on it
  const handleWorkspaceClick = (workspace: any) => {
    setActiveWorkspace(workspace);
    navigate(`/workspaces/${workspace._id}`);
  };

  // Navigation items
  const primaryNavItems = [
    { 
      label: "Dashboard", 
      path: "/dashboard", 
      icon: <LayoutDashboardIcon className="h-5 w-5" /> 
    },
    { 
      label: "Tasks", 
      path: "/tasks", 
      icon: <CheckSquareIcon className="h-5 w-5" /> 
    },
    { 
      label: "Favorites", 
      path: "/favorites", 
      icon: <StarIcon className="h-5 w-5" />,
      highlight: true
    },
    { 
      label: "Calendar", 
      path: "/calendar", 
      icon: <CalendarIcon className="h-5 w-5" /> 
    },
  ];

  const footerNavItems = [
    { 
      label: "Settings", 
      path: "/settings", 
      icon: <SettingsIcon className="h-5 w-5" /> 
    },
    { 
      label: "Help & Support", 
      path: "/help", 
      icon: <HelpCircleIcon className="h-5 w-5" /> 
    }
  ];

  const renderSidebarItem = (item: {
    label: string,
    path: string,
    icon: React.ReactNode,
    badge?: number | undefined,
    highlight?: boolean
  }) => {
    const { label, path, icon, badge, highlight } = item;
    const isActive = isRouteActive(path);

    return (
      <Tooltip key={path} content={collapsed ? label : ""} side="right">
        <Link to={path}>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={`
              w-full justify-start gap-3 font-normal 
              ${collapsed ? "justify-center px-2" : ""} 
              ${highlight && !isActive ? "text-indigo-600 dark:text-indigo-400" : ""}
            `}
          >
            {highlight && !isActive ? (
              <span className="relative">
                {icon}
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-indigo-500"></span>
              </span>
            ) : icon}
            
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
          {primaryNavItems.map(item => renderSidebarItem(item))}
        </div>

        {/* Workspaces section */}
        <div className="mt-2 px-3">
          <div className={`flex items-center justify-between py-2 ${collapsed ? "justify-center" : ""}`}>
            {!collapsed && (
              <Link to="/workspaces" className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Workspaces
              </Link>
            )}
            
            {/* Workspace Management Dropdown */}
            <Dropdown
              trigger={
                <Button
                  variant="ghost"
                  className="h-7 w-7 p-0 flex items-center justify-center"
                  title="Workspace options"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              }
              items={[
                {
                  label: "Create Workspace",
                  icon: <PlusIcon className="mr-2 h-4 w-4" />,
                  onClick: () => setShowCreateWorkspace(true)
                },
                {
                  label: "Manage Workspaces",
                  icon: <FolderIcon className="mr-2 h-4 w-4" />,
                  onClick: () => navigate('/workspaces')
                },
                {
                  label: "Manage Members",
                  icon: <Users2Icon className="mr-2 h-4 w-4" />,
                  onClick: () => {
                    if (activeWorkspace) {
                      navigate(`/workspaces/${activeWorkspace._id}/settings`);
                    } else {
                      navigate('/workspaces');
                    }
                  },
                  disabled: !activeWorkspace
                },
              ]}
            />
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
              workspaces.map((workspace) => {
                const isActive = location.pathname.includes(`/workspaces/${workspace._id}`);
                const isPersonal = workspace.isPersonal;
                const iconClassName = isActive ? "h-5 w-5 text-white" : "h-5 w-5";
                
                return (
                <Tooltip
                  key={workspace._id}
                  content={collapsed ? workspace.name : ""}
                  side="right"
                >
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start gap-3 font-normal ${
                      collapsed ? "justify-center px-2" : ""
                    }`}
                    onClick={() => handleWorkspaceClick(workspace)}
                  >
                    {/* Workspace icon or color indicator */}
                    <div
                      className={`h-5 w-5 rounded flex items-center justify-center ${
                        isPersonal ? "bg-blue-500" : ""
                      }`}
                      style={{
                        backgroundColor: isPersonal ? undefined : (workspace.color || "#6366F1")
                      }}
                    >
                      {isPersonal && <BriefcaseIcon className={iconClassName} size={12} />}
                    </div>
                    
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate text-left">
                          {workspace.name}
                        </span>
                        {isPersonal && (
                          <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                            Personal
                          </span>
                        )}
                        {workspace.role && workspace.role !== 'owner' && (
                          <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
                            {workspace.role}
                          </span>
                        )}
                      </>
                    )}
                  </Button>
                </Tooltip>
              )})
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
          {footerNavItems.map(item => renderSidebarItem(item))}
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