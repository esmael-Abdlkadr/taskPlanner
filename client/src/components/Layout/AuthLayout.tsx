import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M3 5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5z" />
                <path d="M7 9l3 3-3 3" />
                <path d="M12 9h5" />
                <path d="M12 15h5" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">TaskNest</span>
          </div>
        </motion.div>
        
        <Outlet />
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-sm text-center text-gray-500 dark:text-gray-400"
        >
          &copy; {new Date().getFullYear()} TaskNest. All rights reserved.
        </motion.p>
      </div>
    </div>
  );
};

export default AuthLayout;