import React from 'react';

const StatCard = ({ title, value, colorClass, bgClass, icon }) => (
  <div className="group relative">
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
          <h3 className={`text-3xl font-bold ${colorClass} tracking-tight`}>
            {value}
          </h3>
        </div>
        <div className={`p-3 ${bgClass} rounded-lg`}>
          {icon}
        </div>
      </div>
      <div className={`h-1 w-full ${bgClass} rounded-full mt-4 opacity-20`}></div>
    </div>
  </div>
);

const StatsOverview = ({ stats, aiInsights }) => {
  if (!stats) return null;
  
  // Safety check for required properties
  const totalSpent = stats.total_spent || 0;
  const totalIncome = stats.total_income || 0;
  const numTransactions = stats.num_transactions || 0;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard 
        title="Total Spent" 
        value={`₹${totalSpent.toLocaleString()}`} 
        colorClass="text-slate-900"
        bgClass="bg-slate-100"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-slate-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
        }
      />
      
      <StatCard 
        title="Total Income" 
        value={`₹${totalIncome.toLocaleString()}`} 
        colorClass="text-emerald-700"
        bgClass="bg-emerald-50"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-emerald-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
        }
      />

      <StatCard 
        title="Transactions" 
        value={numTransactions} 
        colorClass="text-blue-700"
        bgClass="bg-blue-50"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-blue-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        }
      />
    </section>
  );
};

export default StatsOverview;
