import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore"; 
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "../../lib/utils"; 
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  
  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Close mobile menu on location change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  
  // Simulate loading user data if needed
  useEffect(() => {
    // Here you could load initial data needed for the app
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-base">Loading your workspace...</span>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - desktop */}
      <div
        className={cn(
          "hidden md:flex h-screen flex-col fixed z-20 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />
      </div>
      
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={toggleMobileMenu}
          />
        )}
      </AnimatePresence>
      
      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ ease: "easeOut" }}
            className="fixed top-0 left-0 z-40 h-screen w-64 md:hidden"
          >
            <Sidebar collapsed={false} toggleCollapse={toggleSidebar} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main content */}
      <div
        className={cn(
          "flex flex-col flex-1 w-full transition-all duration-300",
          sidebarCollapsed ? "md:ml-16" : "md:ml-64"
        )}
      >
        {/* Header */}
        <Header 
          toggleMobileMenu={toggleMobileMenu} 
          toggleSidebar={toggleSidebar} 
          sidebarCollapsed={sidebarCollapsed}
        />
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;