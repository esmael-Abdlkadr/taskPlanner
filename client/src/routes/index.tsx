import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuthStore } from '../store/authStore';
import AppLayout from '../components/Layout/AppLayout';
import AuthLayout from '../components/Layout/AuthLayout';
import { Loader2 } from 'lucide-react';

// Lazy-loaded pages
const Landing = lazy(() => import('../pages/Landing'));
const Login = lazy(() => import('../pages/Login'));
const Signup = lazy(() => import('../pages/Signup'));
// const VerifyEmail = lazy(() => import('@/pages/VerifyEmail/VerifyEmail'));
// const ForgotPassword = lazy(() => import('@/pages/ForgotPassword/ForgotPassword'));
// const ResetPassword = lazy(() => import('@/pages/ResetPassword/ResetPassword'));
// const Dashboard = lazy(() => import('@/pages/Dashboard/Dashboard'));
// const Workspace = lazy(() => import('@/pages/Workspace/Workspace'));
// const TaskDetail = lazy(() => import('@/pages/TaskDetail/TaskDetail'));
// const NotFound = lazy(() => import('@/pages/NotFound/NotFound'));

// Loading Spinner
const LoadingSpinner = () => (
  <div className="flex h-screen w-screen items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
  </div>
);

// Route guard for authenticated routes
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Create router
const router = createBrowserRouter([
  // Landing page (public)
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Landing />
      </Suspense>
    ),
  },
  
  // Auth routes
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <AuthLayout />
      </Suspense>
    ),
    children: [
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'signup',
        element: <Signup />
      },
    //   {
    //     path: 'verify-email',
    //     element: <VerifyEmail />
    //   },
    //   {
    //     path: 'forgot-password',
    //     element: <ForgotPassword />
    //   },
    //   {
    //     path: 'reset-password/:token',
    //     element: <ResetPassword />
    //   }
    ]
  },
  
  // App routes (protected)
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <PrivateRoute>
          <AppLayout />
        </PrivateRoute>
      </Suspense>
    ),
    children: [
    //   {
    //     path: 'dashboard',
    //     element: <Dashboard />
    //   },
    //   {
    //     path: 'workspaces/:workspaceId',
    //     element: <Workspace />
    //   },
    //   {
    //     path: 'tasks/:taskId',
    //     element: <TaskDetail />
    //   }
    ]
  },
  
  // 404 route
  {
    path: '*',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <NotFound /> */}
      </Suspense>
    )
  }
]);

// Router component
const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;