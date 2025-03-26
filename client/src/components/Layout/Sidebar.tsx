import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { 
  PlusIcon, 
  FolderIcon, 
  InboxIcon, 
  CalendarIcon, 
  ClockIcon, 
  StarIcon, 
  TagIcon,
  SettingsIcon,
  HelpCircleIcon
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
// import { useWorkspaceStore } from "@/store/workspaceStore";
// import { fetchUserWorkspaces } from "@/services/workspaceService";
// import { WorkspaceBasic } from "@/types/workspace.types";
// import { CreateWorkspaceDialog } from "@/features/workspaces/components/CreateWorkspaceDialog";

interface SidebarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar = ({ collapsed, toggleCollapse }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
//   const { setActiveWorkspace } = useWorkspaceStore();
  
//   // Fetch workspaces
//   const { data: workspaces, isLoading } = useQuery({
//     queryKey: ['workspaces'],
//     queryFn: fetchUserWorkspaces,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });
  
  // Helper to check if a route is active
  const isRouteActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }
    
    if (path.startsWith('/workspaces/')) {
      return location.pathname.startsWith(path);
    }
    
    return false;
  };
  
//   // Open workspace when clicking on it
//   const handleWorkspaceClick = (workspace: WorkspaceBasic) => {
//     setActiveWorkspace(workspace);
//     navigate(`/workspaces/${workspace._id}`);
//   };
  
  const renderSidebarItem = (
    label: string,
    path: string,
    icon: React.ReactNode,
    badge?: number | undefined
  ) => {
    const isActive = isRouteActive(path);
    
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to={path}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 font-normal",
                collapsed && "justify-center px-2"
              )}
            >
              {icon}
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{label}</span>
                  {badge !== undefined && (
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        badge > 0 ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      )}
                    >
                      {badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          </Link>
        </TooltipTrigger>
        {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    );
  };
  
  return (
    <>
      <div className="flex h-full w-full flex-col overflow-hidden">
        {/* App logo and name */}
        <div className={cn(
          "flex h-16 items-center px-4",
          collapsed ? "justify-center" : "justify-start"
        )}>
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
          {renderSidebarItem('Dashboard', '/dashboard', <InboxIcon className="h-5 w-5" />, 0)}
          {renderSidebarItem('Calendar', '/calendar', <CalendarIcon className="h-5 w-5" />)}
          {renderSidebarItem('Today', '/today', <ClockIcon className="h-5 w-5" />, 3)}
          {renderSidebarItem('Important', '/important', <StarIcon className="h-5 w-5" />, 2)}
          {renderSidebarItem('Tags', '/tags', <TagIcon className="h-5 w-5" />)}
        </div>
        
        {/* Workspaces section */}
        <div className="mt-2 px-3">
          <div className={cn(
            "flex items-center justify-between py-2",
            collapsed && "justify-center"
          )}>
            {!collapsed && <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Workspaces</span>}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setShowCreateWorkspace(true)}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Create Workspace</TooltipContent>
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
                    className={cn(
                      "flex items-center gap-3 px-3 py-2",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <Skeleton className="h-5 w-5 rounded-md" />
                    {!collapsed && <Skeleton className="h-4 flex-1" />}
                  </div>
                ))
            ) : (
              // Actual workspaces
              workspaces?.map((workspace) => (
                <Tooltip key={workspace._id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={location.pathname.includes(`/workspaces/${workspace._id}`) ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 font-normal",
                        collapsed && "justify-center px-2"
                      )}
                      onClick={() => handleWorkspaceClick(workspace)}
                    >
                      {/* Workspace icon or color indicator */}
                      <div 
                        className="h-5 w-5 rounded" 
                        style={{ backgroundColor: workspace.color || '#6366F1' }} 
                      />
                      {!collapsed && (
                        <span className="flex-1 truncate text-left">{workspace.name}</span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {collapsed && <TooltipContent side="right">{workspace.name}</TooltipContent>}
                </Tooltip>
              ))
            )}
          </div>
        </div>
        
        {/* Push remaining items to bottom */}
        <div className="mt-auto px-3 pb-4">
          {renderSidebarItem('Settings', '/settings', <SettingsIcon className="h-5 w-5" />)}
          {renderSidebarItem('Help & Support', '/help', <HelpCircleIcon className="h-5 w-5" />)}
        </div>
      </div>
      
      {/* Create workspace dialog */}
      <CreateWorkspaceDialog
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
      />
    </>
  );
};

export default Sidebar;