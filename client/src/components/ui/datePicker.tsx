import React, { useState, useRef, useEffect } from "react";
import { format, isValid } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Calendar from "./calendar";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  label,
  error,
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (date: Date) => {
    if (onChange) {
      onChange(date);
    }
    setIsOpen(false);
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) {
      onChange(undefined);
    }
  };

  const formattedDate = value && isValid(value) 
    ? format(value, "MMM d, yyyy") 
    : "";

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      <div ref={pickerRef} className="relative">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            flex items-center w-full px-3 py-2 border rounded-md shadow-sm cursor-pointer
            ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white dark:bg-gray-800 hover:border-blue-400"}
            ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
            transition-colors duration-200
          `}
        >
          <CalendarIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" />
          
          <span className={`flex-grow truncate ${!formattedDate ? "text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-gray-100"}`}>
            {formattedDate || placeholder}
          </span>
          
          {value && (
            <button
              type="button"
              onClick={clearDate}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="sr-only">Clear date</span>
            </button>
          )}
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg p-2"
              style={{ width: 'min(100%, 280px)' }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-md overflow-hidden">
                <Calendar 
                  selected={value} 
                  onSelect={handleSelect}
                  className="border-0" 
                />
                <div className="mt-2 px-1 pb-1 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelect(new Date())}
                    className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Today
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>
      )}
    </div>
  );
};

export default DatePicker;