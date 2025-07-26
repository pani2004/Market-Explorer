
import { Provider } from 'react-redux';
import store from './store/store';
import './App.css';
import Calendar from './components/calendar/Calendar';
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

function DashboardWithParams() {
  const { date } = useParams();
  return <DashboardPanel date={dayjs(date)} onClose={() => window.history.back()} />;
}

function App() {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  return (
    <Provider store={store}>
      <BinanceOrderBookProvider symbol="BTCUSDT" currentMonth={currentMonth}>
        <Router>
          <div className="min-h-screen bg-[#1a2746] flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-6 text-white drop-shadow">Market Explorer Calendar</h1>
            <Routes>
              <Route path="/" element={<CalendarWithRouting currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />} />
              <Route path="/dashboard/:date" element={<DashboardWithParams />} />
            </Routes>
          </div>
        </Router>
      </BinanceOrderBookProvider>
    </Provider>
  );
}

export default App;
