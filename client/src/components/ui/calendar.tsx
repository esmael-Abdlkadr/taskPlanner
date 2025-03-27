import React, { useState } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({ selected, onSelect, className = "" }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-2">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    return (
      <div className="grid grid-cols-7 gap-0">
        {days.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 p-1"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDate = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = selected ? isSameDay(day, selected) : false;
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            key={day.toString()}
            className={`
              relative p-1 text-center text-sm cursor-pointer 
              ${isCurrentMonth ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-600"}
              ${isSelected ? "bg-blue-100 dark:bg-blue-900/30 rounded-full font-semibold" : ""}
              ${
                isToday && !isSelected
                  ? "font-semibold text-blue-600 dark:text-blue-400"
                  : ""
              }
              hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full
            `}
            onClick={() => onSelect(currentDate)}
          >
            <span className="flex items-center justify-center h-8 w-8">
              {format(currentDate, "d")}
            </span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-0">
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className={`calendar w-full ${className}`}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default Calendar;