import { useEffect, useState } from 'react';

interface CircularProgressProps {
  value: number;
  maxValue?: number;
  className?: string;
  strokeWidth?: number;
  textClassName?: string;
  showPercentage?: boolean;
}

export const CircularProgress = ({
  value,
  maxValue = 100,
  className = '',
  strokeWidth = 6,
  textClassName = '',
  showPercentage = true
}: CircularProgressProps) => {
  const [progress, setProgress] = useState(0);
  
  // Normalize value between 0 and 100
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percentage);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [percentage]);
  
  // Calculate SVG properties
  const size = 36; // SVG viewbox size
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        className="transform -rotate-90"
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="opacity-20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {showPercentage && (
        <div className={`absolute inset-0 flex items-center justify-center text-center ${textClassName}`}>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
};