import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import { Download, FileText, Image, Database, Filter, ChevronDown } from 'lucide-react';
import CalendarHeader from './CalendarHeader';
import ViewToggleButtons from './ViewToggleButtons';
import CalendarBody from './CalendarBody';

const Calendar = ({ currentMonth, setCurrentMonth, onCellClick, selectedInstrument = 'BTCUSDT', setSelectedInstrument }) => {
  const [currentDate, setCurrentDate] = useState(currentMonth);
  const [viewMode, setViewMode] = useState('month');
  const [selectedDate, setSelectedDate] = useState(currentMonth);
  const [focusedDate, setFocusedDate] = useState(currentMonth);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showInstrumentFilter, setShowInstrumentFilter] = useState(false);
  const [filterPosition, setFilterPosition] = useState({ top: 0, left: 0 });
  const [isLoadingInstrument, setIsLoadingInstrument] = useState(false);
  const gridRef = useRef(null);
  const exportMenuRef = useRef(null);
  const exportButtonRef = useRef(null);
  const filterMenuRef = useRef(null);
  const filterButtonRef = useRef(null);

  const binanceInstruments = [
    { symbol: 'BTCUSDT', name: 'Bitcoin', category: 'Major' },
    { symbol: 'ETHUSDT', name: 'Ethereum', category: 'Major' },
    { symbol: 'BNBUSDT', name: 'Binance Coin', category: 'Major' },
    { symbol: 'ADAUSDT', name: 'Cardano', category: 'Altcoin' },
    { symbol: 'SOLUSDT', name: 'Solana', category: 'Altcoin' },
    { symbol: 'XRPUSDT', name: 'Ripple', category: 'Altcoin' },
    { symbol: 'DOTUSDT', name: 'Polkadot', category: 'Altcoin' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin', category: 'Meme' },
    { symbol: 'AVAXUSDT', name: 'Avalanche', category: 'DeFi' },
    { symbol: 'LINKUSDT', name: 'Chainlink', category: 'DeFi' },
    { symbol: 'MATICUSDT', name: 'Polygon', category: 'Layer2' },
    { symbol: 'LTCUSDT', name: 'Litecoin', category: 'Major' },
    { symbol: 'UNIUSDT', name: 'Uniswap', category: 'DeFi' },
    { symbol: 'ATOMUSDT', name: 'Cosmos', category: 'Altcoin' },
    { symbol: 'FTMUSDT', name: 'Fantom', category: 'DeFi' }
  ];

  useEffect(() => {
    if (gridRef.current) {
      const focusedCell = gridRef.current.querySelector('[tabindex="0"]');
      if (focusedCell) focusedCell.focus();
    }
  }, [focusedDate, viewMode, currentDate]);

  useEffect(() => {
    setCurrentMonth(currentDate.startOf('month'));
  }, [currentDate]);

  // Effect to fetch data when instrument changes
  useEffect(() => {
    console.log(`Fetching data for ${selectedInstrument}`);
    setIsLoadingInstrument(true);
    setTimeout(() => {
      setIsLoadingInstrument(false);
    }, 800);
  }, [selectedInstrument]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target) &&
          exportButtonRef.current && !exportButtonRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target) &&
          filterButtonRef.current && !filterButtonRef.current.contains(event.target)) {
        setShowInstrumentFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportClick = () => {
    if (exportButtonRef.current) {
      const rect = exportButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.right - 192 
      });
    }
    setShowExportMenu(!showExportMenu);
  };

  const handleFilterClick = () => {
    if (filterButtonRef.current) {
      const rect = filterButtonRef.current.getBoundingClientRect();
      setFilterPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
    }
    setShowInstrumentFilter(!showInstrumentFilter);
  };

  const handleInstrumentSelect = (instrument) => {
    if (setSelectedInstrument) {
      setSelectedInstrument(instrument.symbol);
    }
    setShowInstrumentFilter(false);
  };

  const handleGridKeyDown = (e) => {
    let newDate = focusedDate;
    if (e.key === 'ArrowRight') newDate = focusedDate.add(1, 'day');
    else if (e.key === 'ArrowLeft') newDate = focusedDate.subtract(1, 'day');
    else if (e.key === 'ArrowUp') newDate = focusedDate.subtract(7, 'day');
    else if (e.key === 'ArrowDown') newDate = focusedDate.add(7, 'day');
    else if (e.key === 'Enter') {
      setSelectedDate(focusedDate);
      if (onCellClick) onCellClick(focusedDate);
    }
    else if (e.key === 'Escape') return;
    
    if (newDate !== focusedDate) {
      setFocusedDate(newDate);
      e.preventDefault();
    }
  };

  const orderBook = useSelector(state => state.orderBook);
  const instrumentData = orderBook[selectedInstrument] || orderBook;
  
  let days = [];
  if (viewMode === 'month') {
    const start = currentDate.startOf('month').startOf('week');
    const end = currentDate.endOf('month').endOf('week');
    let curr = start;
    while (curr.isBefore(end) || curr.isSame(end, 'day')) {
      days.push(curr);
      curr = curr.add(1, 'day');
    }
  } else if (viewMode === 'week') {
    const start = currentDate.startOf('week');
    const end = currentDate.endOf('week');
    let curr = start;
    while (curr.isBefore(end) || curr.isSame(end, 'day')) {
      days.push(curr);
      curr = curr.add(1, 'day');
    }
  } else if (viewMode === 'day') {
    days.push(currentDate);
  }
  
  const calendarData = days.map(date => {
    const key = date.format('YYYY-MM-DD');
    const volatilityRaw = instrumentData.volatility?.[key];
    const volatility = volatilityRaw && typeof volatilityRaw === 'object' ? 
      (volatilityRaw.value || volatilityRaw.volatility || volatilityRaw.price || null) : 
      volatilityRaw;
    const volumeRaw = instrumentData.volume?.[key];
    const volume = volumeRaw && typeof volumeRaw === 'object' ? 
      (volumeRaw.value || volumeRaw.volume || volumeRaw.amount || null) : 
      volumeRaw;
    let perf = null;
    if (instrumentData.close && instrumentData.close[key] != null) {
      const prevKey = date.clone().subtract(1, 'day').format('YYYY-MM-DD');
      const todayClose = instrumentData.close[key];
      const prevClose = instrumentData.close[prevKey];
      if (todayClose != null && prevClose != null && prevClose !== 0) {
        perf = ((todayClose - prevClose) / Math.abs(prevClose)) * 100;
      }
    }
    return {
      date: key,
      volatility: typeof volatility === 'number' ? volatility.toFixed(4) : volatility,
      volume: typeof volume === 'number' ? volume.toFixed(2) : volume,
      perf,
      close: instrumentData.close?.[key] || null
    };
  });

  // Export Functions
  const exportAsCSV = () => {
    setIsExporting(true);
    try {
      const selectedInstrumentInfo = binanceInstruments.find(i => i.symbol === selectedInstrument);
      const headers = ['Date', 'Volatility', 'Volume', 'Performance (%)', 'Close Price'];
      const csvContent = [
        `# ${selectedInstrumentInfo?.name || selectedInstrument} (${selectedInstrument}) - Calendar Data Export`,
        `# Generated on: ${new Date().toLocaleString()}`,
        `# View: ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}`,
        '',
        headers.join(','),
        ...calendarData.map(row => [
          row.date || '',
          row.volatility || '',
          row.volume || '',
          row.perf ? row.perf.toFixed(2) : '',
          row.close || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${selectedInstrument}-calendar-data-${viewMode}-${currentDate.format('YYYY-MM-DD')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export failed:', error);
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const exportAsPDF = () => {
    setIsExporting(true);
    try {
      const selectedInstrumentInfo = binanceInstruments.find(i => i.symbol === selectedInstrument);
      const printWindow = window.open('', '_blank');
      const title = `${selectedInstrumentInfo?.name || selectedInstrument} (${selectedInstrument}) - ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View - ${currentDate.format('MMMM YYYY')}`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            h1 { color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
            .instrument-info { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .instrument-symbol { font-size: 18px; font-weight: bold; color: #7c3aed; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            th { background-color: #f8fafc; font-weight: bold; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .positive { color: #059669; }
            .negative { color: #dc2626; }
            .export-info { margin-top: 20px; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <h1>Binance Trading Calendar</h1>
          <div class="instrument-info">
            <div class="instrument-symbol">${selectedInstrument}</div>
            <div>${selectedInstrumentInfo?.name || 'Unknown'} - ${selectedInstrumentInfo?.category || 'Trading Pair'}</div>
          </div>
          <h2>${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View - ${currentDate.format('MMMM YYYY')}</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Volatility</th>
                <th>Volume</th>
                <th>Performance (%)</th>
                <th>Close Price</th>
              </tr>
            </thead>
            <tbody>
              ${calendarData.map(row => `
                <tr>
                  <td>${row.date || 'N/A'}</td>
                  <td>${row.volatility || 'N/A'}</td>
                  <td>${row.volume || 'N/A'}</td>
                  <td class="${row.perf > 0 ? 'positive' : row.perf < 0 ? 'negative' : ''}">${row.perf ? row.perf.toFixed(2) + '%' : 'N/A'}</td>
                  <td>${row.close || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="export-info">
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Trading Pair: ${selectedInstrument}</p>
            <p>View: ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}</p>
            <p>Total Records: ${calendarData.length}</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const exportAsImage = () => {
    setIsExporting(true);
    try {
      const selectedInstrumentInfo = binanceInstruments.find(i => i.symbol === selectedInstrument);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 900;
      canvas.height = 650;
      
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#1e293b');
      gradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Title
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Binance Trading Calendar', canvas.width / 2, 40);
      
      // Instrument info
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = '#a855f7';
      ctx.fillText(selectedInstrument, canvas.width / 2, 70);
      
      ctx.font = '14px Arial';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`${selectedInstrumentInfo?.name || 'Trading Pair'} - ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View - ${currentDate.format('MMMM YYYY')}`, canvas.width / 2, 90);
      
      // Data visualization
      const startY = 130;
      const rowHeight = 28;
      const colWidth = canvas.width / 5;
      
      // Headers
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#3b82f6';
      const headers = ['Date', 'Volatility', 'Volume', 'Performance', 'Close'];
      headers.forEach((header, i) => {
        ctx.fillText(header, (i + 0.5) * colWidth, startY);
      });
      
      // Data rows 
      ctx.font = '13px Arial';
      const displayData = calendarData.slice(0, 15);
      
      displayData.forEach((row, rowIndex) => {
        const y = startY + (rowIndex + 1) * rowHeight;
        
        if (rowIndex % 2 === 0) {
          ctx.fillStyle = 'rgba(51, 65, 85, 0.3)';
          ctx.fillRect(0, y - 18, canvas.width, rowHeight);
        }
        
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        
        ctx.fillText(row.date || 'N/A', 0.5 * colWidth, y);
        ctx.fillText(row.volatility || 'N/A', 1.5 * colWidth, y);
        ctx.fillText(row.volume || 'N/A', 2.5 * colWidth, y);
        
        if (row.perf !== null && !isNaN(row.perf)) {
          ctx.fillStyle = row.perf > 0 ? '#10b981' : row.perf < 0 ? '#ef4444' : '#f8fafc';
          ctx.fillText(row.perf.toFixed(2) + '%', 3.5 * colWidth, y);
        } else {
          ctx.fillStyle = '#f8fafc';
          ctx.fillText('N/A', 3.5 * colWidth, y);
        }
        
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(row.close || 'N/A', 4.5 * colWidth, y);
      });
      
      // Footer
      ctx.font = '12px Arial';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(`Generated on ${new Date().toLocaleString()} | ${selectedInstrument} | ${calendarData.length} records`, canvas.width / 2, canvas.height - 20);
      
      // Download the image
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedInstrument}-calendar-data-${viewMode}-${currentDate.format('YYYY-MM-DD')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Image export failed:', error);
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  return (
    <div className="w-full max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto p-3 sm:p-4 md:p-6 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/50 overflow-visible">
        
        {/* Top Controls: Header with enhanced styling */}
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm border-b border-slate-600/30 px-3 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 overflow-visible">
          <div className="flex items-center justify-between overflow-visible">
            <CalendarHeader
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              viewMode={viewMode}
              setViewMode={setViewMode}
              setFocusedDate={setFocusedDate}
              calendarData={calendarData}
            />
            
            <div className="flex items-center gap-3">
              {/* Instrument Filter */}
              <div className="relative z-50">
                <button
                  ref={filterButtonRef}
                  onClick={handleFilterClick}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-105"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {binanceInstruments.find(i => i.symbol === selectedInstrument)?.symbol || 'BTCUSDT'}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* Export Button */}
              <div className="relative z-50">
                <button
                  ref={exportButtonRef}
                  onClick={handleExportClick}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105 disabled:cursor-not-allowed disabled:scale-100"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instrument Filter Menu Portal */}
        {showInstrumentFilter && createPortal(
          <div 
            ref={filterMenuRef}
            className="fixed w-64 bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-xl shadow-2xl shadow-black/50 z-[99999] max-h-80 overflow-y-auto"
            style={{
              top: `${filterPosition.top}px`,
              left: `${filterPosition.left}px`
            }}
          >
            <div className="p-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
                Binance Trading Pairs
              </div>
              <div className="space-y-1">
                {['Major', 'Altcoin', 'DeFi', 'Layer2', 'Meme'].map(category => (
                  <div key={category}>
                    <div className="text-xs font-medium text-slate-500 px-3 py-1 border-b border-slate-700/50">
                      {category}
                    </div>
                    {binanceInstruments
                      .filter(instrument => instrument.category === category)
                      .map(instrument => (
                        <button
                          key={instrument.symbol}
                          onClick={() => handleInstrumentSelect(instrument)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm transition-colors rounded-lg ${
                            selectedInstrument === instrument.symbol
                              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                              : 'text-slate-200 hover:bg-slate-700'
                          }`}
                        >
                          <div>
                            <span className="font-medium">{instrument.symbol}</span>
                            <div className="text-xs text-slate-400">{instrument.name}</div>
                          </div>
                          {selectedInstrument === instrument.symbol && (
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          )}
                        </button>
                      ))
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Export Menu Portal */}
        {showExportMenu && createPortal(
          <div 
            ref={exportMenuRef}
            className="fixed w-48 bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-xl shadow-2xl shadow-black/50 z-[99999]"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`
            }}
          >
            <div className="p-2 space-y-1">
              <button
                onClick={exportAsCSV}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Database className="w-4 h-4 text-green-400" />
                <span>Export as CSV</span>
              </button>
              <button
                onClick={exportAsPDF}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4 text-red-400" />
                <span>Export as PDF</span>
              </button>
              <button
                onClick={exportAsImage}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Image className="w-4 h-4 text-purple-400" />
                <span>Export as Image</span>
              </button>
            </div>
          </div>,
          document.body
        )}

        {/* Calendar Grid with professional spacing */}
        <div className="p-3 sm:p-6 md:p-8">
          {isLoadingInstrument && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-slate-300 text-sm">Loading {selectedInstrument} data...</p>
              </div>
            </div>
          )}
          <div
            ref={gridRef}
            tabIndex={0}
            onKeyDown={handleGridKeyDown}
            aria-label="Calendar grid navigation"
            className={`outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1 sm:focus:ring-offset-2 focus:ring-offset-slate-900 rounded-xl sm:rounded-2xl transition-all duration-200 ${isLoadingInstrument ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <CalendarBody
              currentDate={currentDate}
              viewMode={viewMode}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              focusedDate={focusedDate}
              setFocusedDate={setFocusedDate}
              onCellClick={onCellClick}
              selectedInstrument={selectedInstrument}
              instrumentData={instrumentData}
              cellClassName="group relative p-2 sm:p-3 md:p-4 cursor-pointer rounded-lg sm:rounded-xl transition-all duration-300 ease-out min-h-[70px] sm:min-h-[80px] md:min-h-[100px] lg:min-h-[120px] min-w-[40px] sm:min-w-[60px] md:min-w-[80px] text-center select-none bg-slate-800/40 hover:bg-slate-700/60 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.01] sm:hover:scale-[1.02] hover:z-10 border border-slate-600/20 hover:border-slate-500/40 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Bottom Controls: View toggle with enhanced design */}
        <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-sm border-t border-slate-600/30 px-3 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 flex justify-center">
          <div className="bg-slate-800/80 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 border border-slate-600/30 shadow-lg">
            <ViewToggleButtons viewMode={viewMode} setViewMode={setViewMode} />
          </div>
        </div>
        
      </div>
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Calendar;