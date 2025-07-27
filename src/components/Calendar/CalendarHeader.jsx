import React from 'react';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';

const CalendarHeader = ({ currentDate, setCurrentDate, viewMode, setViewMode, setFocusedDate, calendarData }) => {
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
    <div className="flex flex-col items-center gap-2 w-full">

      {/* Navigation Buttons */}
      <div className="flex gap-2 justify-center w-full flex-wrap md:flex-nowrap">
        <button onClick={handlePrev} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-base md:text-lg min-w-[80px] md:min-w-[100px] active:scale-95 transition">← Prev</button>
        <button onClick={handleToday} className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 text-base md:text-lg min-w-[80px] md:min-w-[100px] active:scale-95 transition">Today</button>
        <button onClick={handleNext} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-base md:text-lg min-w-[80px] md:min-w-[100px] active:scale-95 transition">Next →</button>
      </div>

      {/* Month Label */}
      <div className="text-lg md:text-2xl font-semibold text-white drop-shadow mt-1 text-center w-full">
        {currentDate.format('MMMM YYYY')}
      </div>
    </div>
  );
};

export default CalendarHeader;
