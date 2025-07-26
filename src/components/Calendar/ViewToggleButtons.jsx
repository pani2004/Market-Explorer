import React from 'react';

const ViewToggleButtons = ({ viewMode, setViewMode }) => (
  <div className="flex gap-2 mb-4">
    <button
      className={`px-3 py-1 rounded ${viewMode === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      onClick={() => setViewMode('day')}
    >
      Daily
    </button>
    <button
      className={`px-3 py-1 rounded ${viewMode === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      onClick={() => setViewMode('week')}
    >
      Weekly
    </button>
    <button
      className={`px-3 py-1 rounded ${viewMode === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      onClick={() => setViewMode('month')}
    >
      Monthly
    </button>
  </div>
);

export default ViewToggleButtons;
