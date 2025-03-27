import React from "react";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  label?: string;
  showPercentage?: boolean;
  color?: string;
}

const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className = "",
  label,
  showPercentage = false,
  color = "bg-indigo-600",
}) => {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="mb-1 flex justify-between">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full rounded-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Progress;
