import React from 'react';
import dayjs from 'dayjs';

const CalendarHeader = ({ currentDate, setCurrentDate, viewMode, setViewMode, setFocusedDate }) => {
  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(currentDate.subtract(1, 'month'));
    else if (viewMode === 'week') setCurrentDate(currentDate.subtract(1, 'week'));
    else setCurrentDate(currentDate.subtract(1, 'day'));
  };
  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(currentDate.add(1, 'month'));
    else if (viewMode === 'week') setCurrentDate(currentDate.add(1, 'week'));
    else setCurrentDate(currentDate.add(1, 'day'));
  };
  const handleToday = () => {
    setCurrentDate(dayjs());
    setFocusedDate(dayjs());
  };
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-2 w-full">
      <div className="flex gap-2 mb-2 sm:mb-0">
        <button onClick={handlePrev} className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300">← Prev</button>
        <button onClick={handleToday} className="px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600">Today</button>
        <button onClick={handleNext} className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300">Next →</button>
      </div>
      <div className="flex-1 flex justify-center">
        <div className="text-lg font-semibold text-center w-full text-white drop-shadow">
          {currentDate.format('MMMM YYYY')}
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
