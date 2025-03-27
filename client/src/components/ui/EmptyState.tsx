import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
      {icon && (
        <div className="mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">{description}</p>
      {action && action}
    </div>
  );
};

export default EmptyState;