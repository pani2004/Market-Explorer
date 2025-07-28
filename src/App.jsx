import { Provider } from 'react-redux';
import store from './store/store';
import './App.css';
import Calendar from './components/Calendar/Calendar';
import DashboardPanel from './components/DashboardPanel';
import BinanceOrderBookProvider from './components/BinanceOrderBookProvider';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';

function CalendarWithRouting(props) {
  const navigate = useNavigate();
  return (
    <Calendar
      {...props}
      onCellClick={date => navigate(`/dashboard/${date.format('YYYY-MM-DD')}`)}
    />
  );
}

function DashboardWithParams({ selectedInstrument }) {
  const { date } = useParams();
  return <DashboardPanel 
    date={dayjs(date)} 
    onClose={() => window.history.back()} 
    instrument={selectedInstrument}
  />;
}

function App() {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedInstrument, setSelectedInstrument] = useState('BTCUSDT');
  
  return (
    <Provider store={store}>
      <BinanceOrderBookProvider symbol={selectedInstrument} currentMonth={currentMonth}>
        <Router>
          <div className="min-h-screen bg-[#1a2746] flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-6 text-white drop-shadow">Market Explorer Calendar</h1>
            <Routes>
              <Route path="/" element={<CalendarWithRouting 
                currentMonth={currentMonth} 
                setCurrentMonth={setCurrentMonth}
                selectedInstrument={selectedInstrument}
                setSelectedInstrument={setSelectedInstrument}
              />} />
              <Route path="/dashboard/:date" element={<DashboardWithParams selectedInstrument={selectedInstrument} />} />
            </Routes>
          </div>
        </Router>
      </BinanceOrderBookProvider>
    </Provider>
  );
}

export default App;
