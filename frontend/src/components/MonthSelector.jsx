import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '../api';

const MonthSelector = ({ onMonthSelect, selectedMonth }) => {
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonths();
  }, []);

  const loadMonths = async () => {
    try {
      const data = await transactionsAPI.getAllMonthlyData();
      const sorted = data.sort((a, b) => b.month_key.localeCompare(a.month_key)); // Latest first
      setMonths(sorted);
      
      // Auto-select the latest month if none selected
      if (!selectedMonth && sorted.length > 0) {
        onMonthSelect(sorted[0].month_key);
      }
    } catch (error) {
      console.error('Failed to load months:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading months...
      </div>
    );
  }

  if (months.length === 0) {
    return (
      <div className="text-sm text-slate-600">
        No data yet. Upload your first statement!
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-semibold text-slate-700">Viewing:</label>
      <select
        value={selectedMonth || ''}
        onChange={(e) => onMonthSelect(e.target.value)}
        className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      >
        {months.map((month) => (
          <option key={month.month_key} value={month.month_key}>
            {formatMonth(month.month_key)} ({month.num_transactions} transactions)
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthSelector;
