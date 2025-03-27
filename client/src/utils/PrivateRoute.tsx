import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Loader2 } from "lucide-react";

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have auth data in localStorage directly
    const checkLocalStorage = () => {
      try {
        const storedData = localStorage.getItem("auth-storage");
        if (storedData) {
          const parsedData = JSON.parse(storedData);

          if (parsedData.state?.isAuthenticated) {
            // Give Zustand store time to hydrate
            setTimeout(() => {
              setIsLoading(false);
            }, 100);
            return;
          }
        }
        // No valid auth data found
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking localStorage:", error);
        setIsLoading(false);
      }
    };

    // If Zustand already has auth data, don't wait
    if (user && isAuthenticated) {
      setIsLoading(false);
    } else {
      checkLocalStorage();
    }
  }, [isAuthenticated, user]);

  // Show loading indicator while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // If not authenticated after loading, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise render the children
  return <>{children}</>;
};
