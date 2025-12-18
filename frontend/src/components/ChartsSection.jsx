import React, { useState, useEffect } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { transactionsAPI } from '../api';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartsSection = ({ stats }) => {
  const [activeTab, setActiveTab] = useState('category');
  const [monthlyData, setMonthlyData] = useState([]);
  const [trendsLoading, setTrendsLoading] = useState(true);

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    try {
      const data = await transactionsAPI.getAllMonthlyData();
      const sorted = data.sort((a, b) => a.month_key.localeCompare(b.month_key));
      setMonthlyData(sorted);
    } catch (error) {
      console.error('Failed to load trends:', error);
    } finally {
      setTrendsLoading(false);
    }
  };

  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (!stats) return null;

  // Safety check for chart data
  const hasChartData = stats.chart_insights && stats.chart_insights.length > 0;

  const chartData = {
    labels: hasChartData ? stats.chart_insights.map(item => item.label) : ['No Data'],
    datasets: [{
      label: 'Spending by Category',
      data: hasChartData ? stats.chart_insights.map(item => item.amount) : [0],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(14, 165, 233, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(168, 85, 247, 0.8)',
      ],
      borderColor: 'rgba(255, 255, 255, 1)',
      borderWidth: 2,
    }],
  };

  const trendsChartData = {
    labels: monthlyData.map(m => formatMonth(m.month_key)),
    datasets: [
      {
        label: 'Total Spent',
        data: monthlyData.map(m => m.total_spent),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Total Income',
        data: monthlyData.map(m => m.total_income),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const trendsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '₹' + value.toLocaleString(),
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('category')}
          className={`px-4 py-2 font-semibold text-sm transition-all ${
            activeTab === 'category'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Category Breakdown
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`px-4 py-2 font-semibold text-sm transition-all ${
            activeTab === 'trends'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Monthly Trends
        </button>
      </div>

      {/* Chart Display */}
      <div className="h-80">
        {activeTab === 'category' ? (
          <Pie data={chartData} options={{ maintainAspectRatio: false }} />
        ) : trendsLoading ? (
          <div className="flex items-center justify-center h-full">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : monthlyData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-slate-400">Upload data for multiple months to see trends</p>
          </div>
        ) : (
          <Line data={trendsChartData} options={trendsChartOptions} />
        )}
      </div>
    </div>
  );
};

export default ChartsSection;
