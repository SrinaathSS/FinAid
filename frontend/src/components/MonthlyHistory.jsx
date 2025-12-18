import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '../api';

const MonthlyHistory = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    loadMonthlyData();
  }, []);

  const loadMonthlyData = async () => {
    try {
      const data = await transactionsAPI.getAllMonthlyData();
      setMonthlyData(data);
    } catch (error) {
      console.error('Failed to load monthly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (monthKey) => {
    if (!window.confirm(`Delete all data for ${monthKey}?`)) return;
    
    try {
      console.log('Deleting month:', monthKey);
      await transactionsAPI.deleteMonthlyData(monthKey);
      // Update state by filtering out the deleted month
      setMonthlyData(prevData => prevData.filter(m => m.month_key !== monthKey));
      alert('✅ Month data deleted successfully');
      console.log('Delete successful');
    } catch (error) {
      console.error('Delete error:', error);
      console.error('Error response:', error.response?.data);
      alert('❌ Failed to delete month data: ' + (error.response?.data?.error || error.message));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-blue-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
            <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
            <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-800">Monthly History</h2>
      </div>

      {monthlyData.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p className="text-sm">No monthly data yet. Upload your first transaction file!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {monthlyData.map((month) => (
            <div
              key={month.month_key}
              className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{formatMonth(month.month_key)}</h3>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-slate-600">
                      Spent: <span className="font-semibold text-red-600">{formatCurrency(month.total_spent)}</span>
                    </span>
                    <span className="text-slate-600">
                      Income: <span className="font-semibold text-green-600">{formatCurrency(month.total_income)}</span>
                    </span>
                    <span className="text-slate-600">
                      Transactions: <span className="font-semibold">{month.num_transactions}</span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(month.month_key)}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonthlyHistory;
