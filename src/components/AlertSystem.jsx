import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import { Bell, BellRing, AlertTriangle, TrendingUp, TrendingDown, X, Plus, Settings } from 'lucide-react';
import dayjs from 'dayjs';

const AlertSystem = ({ instrument = 'BTCUSDT' }) => {
  const [alerts, setAlerts] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showActiveAlerts, setShowActiveAlerts] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [newAlert, setNewAlert] = useState({
    type: 'volatility',
    condition: 'above',
    threshold: 5,
    instrument: instrument,
    enabled: true
  });

  const orderBook = useSelector(state => state.orderBook);

  // Alert types configuration
  const alertTypes = {
    volatility: {
      label: 'Volatility Alert',
      icon: AlertTriangle,
      color: 'text-orange-500',
      unit: '%',
      getValue: (date) => orderBook.volatility[date]?.value || 0
    },
    volume: {
      label: 'Volume Alert',
      icon: TrendingUp,
      color: 'text-blue-500',
      unit: 'M',
      getValue: (date) => (orderBook.volume[date] || 0) / 1000000
    },
    price: {
      label: 'Price Alert',
      icon: TrendingDown,
      color: 'text-green-500',
      unit: '$',
      getValue: (date) => orderBook.close[date] || 0
    },
    liquidity: {
      label: 'Liquidity Alert',
      icon: TrendingUp,
      color: 'text-purple-500',
      unit: 'M',
      getValue: (date) => (orderBook.liquidity[date] || 0) / 1000000
    }
  };

  // Check alerts against current data
  useEffect(() => {
    const checkAlerts = () => {
      const today = dayjs().format('YYYY-MM-DD');
      const newActiveAlerts = [];

      alerts.forEach(alert => {
        if (!alert.enabled) return;

        const currentValue = alertTypes[alert.type].getValue(today);
        const threshold = alert.threshold;
        
        let triggered = false;
        if (alert.condition === 'above' && currentValue > threshold) triggered = true;
        if (alert.condition === 'below' && currentValue < threshold) triggered = true;
        if (alert.condition === 'equals' && Math.abs(currentValue - threshold) < 0.01) triggered = true;

        if (triggered) {
          newActiveAlerts.push({
            ...alert,
            currentValue,
            timestamp: Date.now(),
            id: `${alert.id}-${Date.now()}`
          });
        }
      });

      setActiveAlerts(prev => {
        const existingIds = prev.map(a => a.id);
        const uniqueNew = newActiveAlerts.filter(a => !existingIds.includes(a.id));
        return [...prev, ...uniqueNew];
      });
    };

    const interval = setInterval(checkAlerts, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [alerts, orderBook]);

  const addAlert = () => {
    const alert = {
      ...newAlert,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    setAlerts(prev => [...prev, alert]);
    setShowAlertModal(false);
    setNewAlert({
      type: 'volatility',
      condition: 'above',
      threshold: 5,
      instrument: instrument,
      enabled: true
    });
  };

  const deleteAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const toggleAlert = (alertId) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, enabled: !a.enabled } : a
    ));
  };

  const dismissActiveAlert = (alertId) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const formatValue = (value, type) => {
    const { unit } = alertTypes[type];
    if (unit === 'M') return `${value.toFixed(2)}M`;
    if (unit === '$') return `$${value.toLocaleString()}`;
    if (unit === '%') return `${value.toFixed(2)}%`;
    return value.toString();
  };

  const handleAlertClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setModalPosition({
      top: window.innerHeight / 2 - 300, // Center vertically
      left: window.innerWidth / 2 - 192  // Center horizontally (384px/2 = 192px)
    });
    setShowAlertModal(true);
  };

  const handleBellClick = (event) => {
    if (activeAlerts.length > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right - 320 + window.scrollX // 320px = w-80
      });
      setShowActiveAlerts(!showActiveAlerts);
    } else {
      handleAlertClick(event);
    }
  };

  return (
    <div className="relative">
      {/* Alert Bell Icon */}
      <button
        onClick={handleBellClick}
        className={`p-2 rounded-lg transition-colors ${
          activeAlerts.length > 0 
            ? 'bg-red-100 text-red-600 animate-pulse' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title="Manage Alerts"
      >
        {activeAlerts.length > 0 ? (
          <BellRing className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {activeAlerts.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeAlerts.length}
          </span>
        )}
      </button>

      {/* Active Alerts Dropdown Portal */}
      {showActiveAlerts && activeAlerts.length > 0 && createPortal(
        <div 
          className="fixed w-80 bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-xl shadow-2xl shadow-black/50 z-[99999] max-h-64 overflow-y-auto"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          <div className="p-3 border-b border-slate-600/50">
            <h3 className="font-semibold text-red-400">Active Alerts</h3>
          </div>
          <div>
            {activeAlerts.map(alert => {
              const AlertIcon = alertTypes[alert.type].icon;
              return (
                <div key={alert.id} className="p-3 border-b border-slate-600/30 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertIcon className={`w-4 h-4 ${alertTypes[alert.type].color}`} />
                      <div>
                        <p className="font-medium text-sm text-slate-200">
                          {alertTypes[alert.type].label}
                        </p>
                        <p className="text-xs text-slate-300">
                          {alert.instrument} - {formatValue(alert.currentValue, alert.type)} is {alert.condition} {formatValue(alert.threshold, alert.type)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {dayjs(alert.timestamp).format('HH:mm:ss')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => dismissActiveAlert(alert.id)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-3 border-t border-slate-600/30">
            <button
              onClick={handleAlertClick}
              className="w-full text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Manage Alerts
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Alert Management Modal Portal */}
      {showAlertModal && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <div 
            className="bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-xl shadow-2xl shadow-black/50 p-6 w-96 max-h-[80vh] overflow-y-auto"
            style={{
              position: 'fixed',
              top: `${modalPosition.top}px`,
              left: `${modalPosition.left}px`,
              transform: 'none'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-200">Alert Management</h2>
              <button
                onClick={() => setShowAlertModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Alert */}
            <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600/30">
              <h3 className="font-medium mb-3 flex items-center text-slate-200">
                <Plus className="w-4 h-4 mr-2" />
                Create New Alert
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Alert Type</label>
                  <select
                    value={newAlert.type}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-2 border border-slate-600 rounded bg-slate-700 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(alertTypes).map(([key, type]) => (
                      <option key={key} value={key}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Condition</label>
                  <select
                    value={newAlert.condition}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full p-2 border border-slate-600 rounded bg-slate-700 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="above">Above</option>
                    <option value="below">Below</option>
                    <option value="equals">Equals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">
                    Threshold ({alertTypes[newAlert.type].unit})
                  </label>
                  <input
                    type="number"
                    value={newAlert.threshold}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
                    className="w-full p-2 border border-slate-600 rounded bg-slate-700 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
                  />
                </div>

                <button
                  onClick={addAlert}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors shadow-lg"
                >
                  Create Alert
                </button>
              </div>
            </div>

            {/* Existing Alerts */}
            <div>
              <h3 className="font-medium mb-3 flex items-center text-slate-200">
                <Settings className="w-4 h-4 mr-2" />
                Existing Alerts ({alerts.length})
              </h3>
              
              {alerts.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No alerts configured</p>
              ) : (
                <div className="space-y-2">
                  {alerts.map(alert => {
                    const AlertIcon = alertTypes[alert.type].icon;
                    return (
                      <div key={alert.id} className="flex items-center justify-between p-3 border border-slate-600/50 rounded bg-slate-700/30">
                        <div className="flex items-center space-x-3">
                          <AlertIcon className={`w-4 h-4 ${alertTypes[alert.type].color}`} />
                          <div>
                            <p className="font-medium text-sm text-slate-200">
                              {alertTypes[alert.type].label}
                            </p>
                            <p className="text-xs text-slate-400">
                              {alert.condition} {formatValue(alert.threshold, alert.type)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleAlert(alert.id)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              alert.enabled 
                                ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
                                : 'bg-slate-600/50 text-slate-400 border border-slate-500/30'
                            }`}
                          >
                            {alert.enabled ? 'ON' : 'OFF'}
                          </button>
                          <button
                            onClick={() => deleteAlert(alert.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AlertSystem;
