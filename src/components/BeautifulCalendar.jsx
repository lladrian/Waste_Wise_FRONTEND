import { useState, useEffect } from 'react';

const BeautifulCalendar = ({ value, onChange, name, minDate, isOpen, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);

  // Days of the week headers
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Months array
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      days.push(date);
    }

    return days;
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // FIXED: Handle date selection without timezone issues
  const handleDateSelect = (date) => {
    if (!date) return;
    
    // Create a date without time component to avoid timezone issues
    const selectedDateLocal = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Check if date is before minDate
    if (minDate) {
      const minDateObj = new Date(minDate);
      const minDateLocal = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), minDateObj.getDate());
      if (selectedDateLocal < minDateLocal) return;
    }

    setSelectedDate(selectedDateLocal);
    
    // FIXED: Format date as YYYY-MM-DD without timezone issues
    const year = selectedDateLocal.getFullYear();
    const month = String(selectedDateLocal.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDateLocal.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    console.log('Selected date:', selectedDateLocal);
    console.log('Formatted date:', formattedDate);
    
    onChange({
      target: {
        name: name,
        value: formattedDate
      }
    });
    
    // Close modal after selection
    onClose();
  };

  // FIXED: Check if date is today (local time)
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  // FIXED: Check if date is selected (local time)
  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };

  // FIXED: Check if date is disabled (before minDate - local time)
  const isDisabled = (date) => {
    if (!date || !minDate) return false;
    const minDateObj = new Date(minDate);
    const dateLocal = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const minDateLocal = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), minDateObj.getDate());
    return dateLocal < minDateLocal;
  };

  // Initialize selected date when value changes
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      // Create date without time component
      const dateLocal = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      setSelectedDate(dateLocal);
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const calendarDays = generateCalendarDays();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
        onClick={onClose}
      >
        {/* Calendar Modal - Fixed 600px width and 400px height */}
        <div 
          className="bg-white rounded-2xl shadow-2xl w-[800px] h-[700px] mx-auto transform transition-all duration-300 scale-100 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header - Blue Theme */}
          <div className="px-6 py-4 border-b border-blue-200 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Select Collection Date</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-blue-400 rounded-full transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Calendar Content - Compact layout to fit 400px height */}
          <div className="flex-1 p-4 flex flex-col">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105"
              >
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h3 className="text-lg font-bold text-gray-800">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105"
              >
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Days of Week Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map(day => (
                <div key={day} className="text-center text-sm font-semibold text-blue-600 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid - Smaller to fit height */}
            <div className="grid grid-cols-7 gap-1 flex-1">
              {calendarDays.map((date, index) => (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  disabled={!date || isDisabled(date)}
                  className={`
                    rounded-lg text-sm font-medium transition-all duration-200
                    transform hover:scale-105 active:scale-95
                    ${!date ? 'invisible' : ''}
                    ${isDisabled(date) 
                      ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
                      : isSelected(date)
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105 ring-2 ring-blue-200'
                      : isToday(date)
                      ? 'bg-blue-100 text-blue-700 border border-blue-300 shadow-sm'
                      : 'text-gray-700 hover:bg-blue-50 hover:shadow-sm'
                    }
                  `}
                >
                  {date ? date.getDate() : ''}
                </button>
              ))}
            </div>

            {/* Action Buttons - Compact */}
            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-xs text-gray-600">Selected</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                  <span className="text-xs text-gray-600">Today</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDateSelect(new Date())}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                >
                  Today
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Selected Date Display */}
            {selectedDate && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 text-center">
                  Selected: <span className="font-semibold">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BeautifulCalendar;