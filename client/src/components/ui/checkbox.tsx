import React from "react";

interface CheckboxProps {
  label?: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  className = "",
  id,
}) => {
  const checkboxId =
    id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={(e) => onChange && onChange(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 
                    dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-indigo-600 dark:focus:ring-offset-gray-900
                    disabled:opacity-50"
        />
        {checked && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none absolute h-4 w-4 text-white dark:text-gray-900"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
              className="text-white dark:text-gray-900"
            />
          </svg>
        )}
      </div>
      {label && (
        <label
          htmlFor={checkboxId}
          className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
