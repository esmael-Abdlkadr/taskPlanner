import React from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className = "", error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}

        <textarea
          className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                    disabled:opacity-50 disabled:bg-gray-50 resize-none
                    dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400
                    ${
                      error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }
                    ${className}`}
          ref={ref}
          {...props}
        />

        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
