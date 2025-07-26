import React, { useState, useRef, useEffect } from 'react';
import CalendarHeader from './CalendarHeader';
import ViewToggleButtons from './ViewToggleButtons';
import CalendarBody from './CalendarBody';

const Calendar = ({ currentMonth, setCurrentMonth, onCellClick }) => {
  const [currentDate, setCurrentDate] = useState(currentMonth);
  const [viewMode, setViewMode] = useState('month');
  const [selectedDate, setSelectedDate] = useState(currentMonth);
  const [focusedDate, setFocusedDate] = useState(currentMonth);
  const gridRef = useRef(null);

  useEffect(() => {
    if (gridRef.current) {
      const focusedCell = gridRef.current.querySelector('[tabindex="0"]');
      if (focusedCell) focusedCell.focus();
    }
  }, [focusedDate, viewMode, currentDate]);

  // Update parent currentMonth when month changes
  useEffect(() => {
    setCurrentMonth(currentDate.startOf('month'));
  }, [currentDate]);

  // Keyboard navigation handler at grid level
  const handleGridKeyDown = (e) => {
    let newDate = focusedDate;
    if (e.key === 'ArrowRight') newDate = focusedDate.add(1, 'day');
    else if (e.key === 'ArrowLeft') newDate = focusedDate.subtract(1, 'day');
    else if (e.key === 'ArrowUp') newDate = focusedDate.subtract(7, 'day');
    else if (e.key === 'ArrowDown') newDate = focusedDate.add(7, 'day');
    else if (e.key === 'Enter') setSelectedDate(focusedDate);
    else if (e.key === 'Escape') return;
    if (newDate !== focusedDate) {
      setFocusedDate(newDate);
      e.preventDefault();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 rounded-xl shadow-lg" style={{ background: 'rgba(17, 28, 48, 0.95)' }}>
      <CalendarHeader
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        viewMode={viewMode}
        setViewMode={setViewMode}
        setFocusedDate={setFocusedDate}
      />
      <ViewToggleButtons viewMode={viewMode} setViewMode={setViewMode} />
      <div
        ref={gridRef}
        tabIndex={0}
        onKeyDown={handleGridKeyDown}
        aria-label="Calendar grid navigation"
        className="outline-none"
      >
        <CalendarBody
          currentDate={currentDate}
          viewMode={viewMode}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          focusedDate={focusedDate}
          setFocusedDate={setFocusedDate}
          onCellClick={onCellClick}
        />
      </div>
    </div>
  );
};

export default Calendar;
