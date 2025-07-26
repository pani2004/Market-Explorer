import React from 'react';
import CalendarCell from './CalendarCell';
import { getDaysInMonth, getStartOfWeek, getEndOfWeek, isSameDay } from '../../utils/dateHelpers';

const CalendarBody = ({ currentDate, viewMode, selectedDate, setSelectedDate, focusedDate, setFocusedDate, onCellClick }) => {
  let days = [];
  if (viewMode === 'month') {
    days = getDaysInMonth(currentDate);
  } else if (viewMode === 'week') {
    const start = getStartOfWeek(currentDate);
    const end = getEndOfWeek(currentDate);
    let curr = start;
    while (curr.isBefore(end) || curr.isSame(end, 'day')) {
      days.push(curr);
      curr = curr.add(1, 'day');
    }
  } else if (viewMode === 'day') {
    // Show only the selected day
    days.push(currentDate);
  }

  const handleCellClick = (date) => {
    setSelectedDate(date);
    setFocusedDate(date);
  };

  const handleCellKeyDown = (e, date, idx) => {
    let newDate = date;
    if (e.key === 'ArrowRight') newDate = date.add(1, 'day');
    else if (e.key === 'ArrowLeft') newDate = date.subtract(1, 'day');
    else if (e.key === 'ArrowUp') newDate = date.subtract(7, 'day');
    else if (e.key === 'ArrowDown') newDate = date.add(7, 'day');
    else if (e.key === 'Enter') setSelectedDate(date);
    else if (e.key === 'Escape') e.target.blur();
    if (newDate !== date) {
      setFocusedDate(newDate);
    }
  };

  return (
    <div role="grid" className="grid grid-cols-7 gap-1 bg-[#1a2746] rounded p-2 min-h-[300px]">
      {days.map((date, idx) => (
        <CalendarCell
          key={date.format('YYYY-MM-DD')}
          date={date}
          selected={isSameDay(date, selectedDate)}
          focused={isSameDay(date, focusedDate)}
          onClick={() => handleCellClick(date)}
          onKeyDown={(e) => handleCellKeyDown(e, date, idx)}
          onCellClick={onCellClick}
        />
      ))}
    </div>
  );
};

export default CalendarBody;
