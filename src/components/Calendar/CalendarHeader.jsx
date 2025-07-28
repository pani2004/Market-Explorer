import React, { useEffect } from 'react';
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

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handlePrev();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNext();
          break;
        case 'Home':
          event.preventDefault();
          handleToday();
          break;
        case 't':
        case 'T':
          event.preventDefault();
          handleToday();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentDate, viewMode]); 
    return (
    <div className="flex flex-col items-center gap-2 w-full">

      {/* Navigation Buttons */}
      <div className="flex gap-2 ml-9 justify-center w-full flex-wrap md:flex-nowrap">
        <button 
          onClick={handlePrev} 
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-base md:text-lg min-w-[80px] md:min-w-[100px] active:scale-95 transition"
          title="Previous (←)"
        >
          ← Prev
        </button>
        <button 
          onClick={handleToday} 
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 text-base md:text-lg min-w-[80px] md:min-w-[100px] active:scale-95 transition"
          title="Today (T or Home)"
        >
          Today
        </button>
        <button 
          onClick={handleNext} 
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-base md:text-lg min-w-[80px] md:min-w-[100px] active:scale-95 transition"
          title="Next (→)"
        >
          Next →
        </button>
      </div>

      {/* Month Label */}
      <div className="text-lg md:text-2xl font-semibold text-white drop-shadow mt-1 text-center w-full">
        {currentDate.format('MMMM YYYY')}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="text-xs text-slate-400 opacity-75 text-center">
        Use ← → arrow keys to navigate • T or Home for today
      </div>
    </div>
  );
};

export default CalendarHeader;
