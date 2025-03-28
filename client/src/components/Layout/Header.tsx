import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  User,
  Settings,
  LogOut,
  Bell,
  Menu,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import Button from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar } from "../common/Avatar";
import Input from "../ui/input";
import { useTheme } from "../../hooks/useTheme";
import { cn } from "../../lib/utils";

interface HeaderProps {
  toggleMobileMenu: () => void;
  toggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

const Header = ({
  toggleMobileMenu,
  toggleSidebar,
  sidebarCollapsed,
}: HeaderProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { theme, setTheme } = useTheme();

  // Get initials from user name
  const getInitials = () => {
    if (!user) return "U";
    return `${user.firstName?.charAt(0) || ""}${
      user.lastName?.charAt(0) || ""
    }`;
  };

  // Focus search input when search is shown
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname.startsWith("/workspaces/")) {
      // We could get the actual workspace name from state/store here
      return "Workspace";
    }
    if (pathname.startsWith("/tasks/")) {
      return "Task Details";
    }
    return "TaskNest";
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-800">
      {/* Left section: Mobile menu button, breadcrumb/title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
        
          className="md:hidden"
          onClick={toggleMobileMenu}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
  
          className="hidden md:flex"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>

        <div className="hidden md:block">
          <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
        </div>
      </div>

      {/* Mobile title (centered) */}
      <div className="absolute left-0 right-0 flex justify-center md:hidden">
        <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
      </div>

      {/* Right section: Search, notifications, theme toggle, user menu */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div
          className={cn("relative", showSearch ? "w-full md:w-64" : "w-auto")}
        >
          {showSearch ? (
            <div className="flex items-center rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <Search className="ml-2 h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search tasks..."
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                variant="ghost"
    
                className="h-8 w-8"
                onClick={() => setShowSearch(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
      
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" >
              <Bell className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No new notifications.
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button variant="ghost"  onClick={toggleTheme}>
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="relative h-9 w-9 rounded-full"
            >
              <Avatar className="h-9 w-9" name={getInitials()} />
            
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                to="/profile"
                className="flex w-full cursor-pointer items-center"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/settings"
                className="flex w-full cursor-pointer items-center"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex cursor-pointer items-center text-red-600 focus:text-red-600 dark:text-red-500 dark:focus:text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
