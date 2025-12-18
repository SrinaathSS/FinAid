import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { getInsights, calculateStats, askAI } from './utils';
import { useAuth } from './context/AuthContext';
import { transactionsAPI } from './api';

// Components
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import StatsOverview from './components/StatsOverview';
import ChartsSection from './components/ChartsSection';
import Login from './components/Login';
import MonthlyHistory from './components/MonthlyHistory';
import MonthSelector from './components/MonthSelector';
import MonthYearSelector from './components/MonthYearSelector';
import ChatWidget from './components/ChatWidget';
import AISuggestions from './components/AISuggestions';

function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedTransactions, setUploadedTransactions] = useState(null);
  const [selectedMonthKey, setSelectedMonthKey] = useState(null);
  const [viewingMonth, setViewingMonth] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMonthKey, setUploadMonthKey] = useState(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Hi! I am your financial assistant. Ask me anything about your spending!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // --- Logic ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      let jsonData = XLSX.utils.sheet_to_json(worksheet);

      // --- Begin Transformation Logic ---
      const hasRequiredColumns = jsonData.length > 0 &&
        ['type', 'amount', 'description'].every(col => Object.keys(jsonData[0]).map(k => k.toLowerCase()).includes(col));

      if (!hasRequiredColumns) {
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const headerRowIndex = rawRows.findIndex(row =>
          row.includes('Description') && row.includes('Debit Amount') && row.includes('Credit Amount')
        );
        if (headerRowIndex === -1) {
          alert('❌ Could not find proper header row. Please check your file.');
          return;
        }
        const headers = rawRows[headerRowIndex];
        const transactionRows = rawRows.slice(headerRowIndex + 1);
        
        console.log('🔍 Found header at row:', headerRowIndex);
        console.log('📋 Headers found:', headers);
        console.log('📋 Total rows after header:', transactionRows.length);
        console.log('📋 First 3 raw rows:', transactionRows.slice(0, 3));
        
        const rows = transactionRows.map(row => {
          const obj = {};
          headers.forEach((key, i) => obj[key] = row[i]);
          return obj;
        });
        
        console.log('📊 Rows converted to objects:', rows.length);
        console.log('Sample row:', rows[0]);
        
        const generateTransactionID = () => Math.random().toString(36).substring(2, 10).toUpperCase();
        jsonData = rows
          .map(row => {
            const description = String(row['Description'] || '');
            const parts = description.split('/');
            
            // Simple extraction: merchant is 2nd part, category is last part
            const mid = parts.length > 1 ? parts[1].trim() : description.trim();
            const category = parts.length > 2 ? parts[parts.length - 1].trim() : 'Uncategorized';
            
            const debitAmount = row['Debit Amount'];
            const creditAmount = row['Credit Amount'];
            const date = row['Txn Date'] || '';
            
            // Parse and format date properly
            let formattedDate = '';
            if (date) {
              const parsedDate = new Date(date);
              if (!isNaN(parsedDate.getTime())) {
                const year = parsedDate.getFullYear();
                const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
                const day = String(parsedDate.getDate()).padStart(2, '0');
                formattedDate = `${year}-${month}-${day}`;
              }
            }
            
            // If no valid date, use the month_key to generate a date
            // This ensures all transactions have dates for proper backend storage
            
            let amount = '';
            let type = '';
            let sender = '';
            let receiver = '';
            
            // Parse amounts - handle empty strings and zeros
            const debit = debitAmount && String(debitAmount).trim() !== '' ? Number(debitAmount) : 0;
            const credit = creditAmount && String(creditAmount).trim() !== '' ? Number(creditAmount) : 0;
            
            // Debug logging for first few rows
            if (rows.indexOf(row) < 5) {
              console.log('🔍 Row debug:', {
                description,
                debitAmount,
                creditAmount,
                debitParsed: debit,
                creditParsed: credit,
                date: formattedDate
              });
            }
            
            if (debit > 0) {
              type = 'debit';
              amount = debit;
              sender = 'DEEPAK';
              receiver = mid;
            } else if (credit > 0) {
              type = 'credit';
              amount = credit;
              receiver = 'DEEPAK';
              sender = mid;
            } else {
              // Skip transactions with no amount at all
              console.log('⚠️ Skipping row (no amount):', { description, debitAmount, creditAmount, debit, credit });
              return null;
            }
            
            return {
              date: formattedDate || null,  // Allow null dates, backend supports it
              transaction_id: generateTransactionID(),
              sender,
              receiver,
              category,
              amount: Number(amount),
              type,
              description
            };
          })
          .filter(t => {
            if (t === null) return false;
            // Also filter out the "Total" row
            if (t.description && t.description.toLowerCase().includes('total')) {
              console.log('⚠️ Skipping Total row');
              return false;
            }
            return true;
          });
      }
      // --- End Transformation Logic ---

      console.log('📊 Parsed transactions:', jsonData.length);
      console.log('Sample transaction:', jsonData[0]);
      console.log('Categories found:', [...new Set(jsonData.map(t => t.category))]);

      setUploadedTransactions(jsonData);

      // 1. Calculate Stats Locally (Instant)
      const calculatedStats = calculateStats(jsonData);
      setStats(calculatedStats);

      // 2. Fetch AI Insights (Async)
      setLoading(true);
      const aiResult = await getInsights(jsonData, calculatedStats);
      setAiInsights(aiResult);
      setLoading(false);

      // 3. Save to Backend
      try {
        if (!uploadMonthKey) {
          alert('⚠️ Please select a month before uploading');
          return;
        }
        
        // Fix transactions with null dates by using the uploadMonthKey
        const transactionsToUpload = jsonData.map(t => {
          if (!t.date && uploadMonthKey) {
            // Use first day of the selected month as fallback
            return { ...t, date: `${uploadMonthKey}-01` };
          }
          return t;
        });
        
        // Ensure stats have valid numeric values
        // Send only the required numeric fields, and put everything else in stats_json
        // Round to 2 decimal places to fit DecimalField(max_digits=12, decimal_places=2)
        const safeStats = {
          total_spent: Math.round((Number(calculatedStats.total_spent) || 0) * 100) / 100,
          total_income: Math.round((Number(calculatedStats.total_income) || 0) * 100) / 100,
          num_transactions: Number(calculatedStats.num_transactions) || 0,
          // Put all the complex nested data in stats_json for the JSONField
          stats_json: {
            average_transaction: Math.round((Number(calculatedStats.average_transaction) || 0) * 100) / 100,
            highest_category: calculatedStats.highest_category || '-',
            chart_insights: calculatedStats.chart_insights || [],
            top_merchants: calculatedStats.top_merchants || [],
            monthly_trends: calculatedStats.monthly_trends || []
          }
        };
        
        console.log('Saving to backend with month:', uploadMonthKey);
        console.log('Sending', transactionsToUpload.length, 'transactions to backend');
        console.log('First transaction sample:', transactionsToUpload[0]);
        console.log('📊 Stats being sent:', safeStats);
        console.log('  - total_spent type:', typeof safeStats.total_spent, 'value:', safeStats.total_spent);
        console.log('  - total_income type:', typeof safeStats.total_income, 'value:', safeStats.total_income);
        console.log('  - num_transactions type:', typeof safeStats.num_transactions, 'value:', safeStats.num_transactions);
        await transactionsAPI.uploadMonthlyData(transactionsToUpload, safeStats, uploadMonthKey);
        console.log('✅ Data saved to backend for month:', uploadMonthKey);
        
        // Close modal and reload
        setShowUploadModal(false);
        setUploadMonthKey(null);
        
        // Reload the uploaded month's data to show updated count
        await loadMonthData(uploadMonthKey);
        alert('✅ Statement uploaded successfully!');
      } catch (error) {
        console.error('Failed to save to backend:', error);
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response?.data);
        console.error('Full error details:', JSON.stringify(error.response?.data, null, 2));
        alert('❌ Failed to save to server: ' + (error.response?.data?.error || error.message));
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    const response = await askAI(userMsg, uploadedTransactions, stats);
    setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    setChatLoading(false);
  };

  // Load specific month data
  const loadMonthData = async (monthKey) => {
    if (!monthKey) return;
    
    setLoading(true);
    setViewingMonth(monthKey);
    
    try {
      const monthData = await transactionsAPI.getMonthlyData(monthKey);
      const transactions = monthData.transactions;
      const stats = monthData.stats; // Backend returns {stats: {...}, transactions: [...]}
      
      // Use backend stats directly - they are already correct!
      const backendStats = {
        total_spent: stats.total_spent,
        total_income: stats.total_income,
        num_transactions: stats.num_transactions,
        average_transaction: stats.num_transactions > 0 ? stats.total_spent / stats.num_transactions : 0,
        highest_category: stats.highest_category || '-',
        chart_insights: stats.chart_insights || [],
        top_merchants: stats.top_merchants || [],
        monthly_trends: stats.monthly_trends || []
      };
      
      // If chart_insights is empty, calculate from transactions
      if (!backendStats.chart_insights || backendStats.chart_insights.length === 0) {
        const categoryMap = {};
        transactions.forEach(t => {
          if (t.type === 'debit' && t.category) {
            const category = t.category;
            const amount = Number(t.amount) || 0;
            categoryMap[category] = (categoryMap[category] || 0) + amount;
          }
        });
        
        backendStats.chart_insights = Object.keys(categoryMap).map(cat => ({
          label: cat,
          amount: categoryMap[cat]
        })).sort((a, b) => b.amount - a.amount);
      }
      
      // Fix transaction count - should be total transactions, not just from stats
      backendStats.num_transactions = transactions.length;
      
      setStats(backendStats);
      setUploadedTransactions(transactions);
      
      // Get AI insights for this month (optional - don't crash if it fails)
      try {
        const aiResult = await getInsights(transactions, backendStats);
        setAiInsights(aiResult);
      } catch (aiError) {
        console.log('AI insights unavailable:', aiError.message);
        setAiInsights({ 
          suggestions: ['AI insights temporarily unavailable'], 
          reports: ['AI quota limit reached'],
          anomalies: [],
          financial_health_score: 0
        });
      }
    } catch (error) {
      console.error('Failed to load month data:', error);
      alert('Failed to load month data');
    } finally {
      setLoading(false);
    }
  };

  // If not authenticated, show login
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      <Header />

      {/* Dashboard Header */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-600">Welcome, <span className="font-semibold text-blue-600">{user?.username}</span>!</p>
            <MonthSelector onMonthSelect={loadMonthData} selectedMonth={viewingMonth} />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Statement
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Upload New Statement</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadMonthKey(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <MonthYearSelector onSelect={(monthKey) => {
                console.log('Month selected:', monthKey);
                setUploadMonthKey(monthKey);
              }} />
            </div>
            
            {uploadMonthKey ? (
              <FileUploader onFileUpload={async (e) => {
                await handleFileUpload(e);
                setShowUploadModal(false);
                setUploadMonthKey(null);
              }} />
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>Please select a month first</p>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* State: No Data Uploaded */}
        {!stats && (
           <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
             <div className="text-center">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 mx-auto text-slate-300 mb-4">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
               </svg>
               <h3 className="text-xl font-bold text-slate-700 mb-2">No Data Available</h3>
               <p className="text-slate-500 mb-6">Upload your first bank statement to get started</p>
               <button
                 onClick={() => setShowUploadModal(true)}
                 className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
               >
                 Upload Statement
               </button>
             </div>
           </div>
        )}

        {/* State: Data Loaded */}
        {stats && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* 1. Key Metrics */}
            <StatsOverview stats={stats} aiInsights={aiInsights} />

            {/* 2. Main Analytics Grid - 2 Columns */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* Left Column: Charts + Monthly History */}
              <div className="space-y-8 flex flex-col">
                {/* Charts Section */}
                <ChartsSection stats={stats} />
                
                {/* Monthly History - Fixed Height with Scroll */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <MonthlyHistory />
                  </div>
                </div>
              </div>

              {/* Right Column: AI Insights + Chat - Equal Height */}
              <div className="space-y-8 flex flex-col">
                {/* AI Suggestions - Fixed Height with Scroll */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <AISuggestions suggestions={aiInsights?.suggestions} loading={loading} />
                  </div>
                </div>
                
                {/* Chat Widget - Flexible Height */}
                <div className="flex-1 min-h-[400px]">
                  <ChatWidget 
                    messages={chatMessages} 
                    input={chatInput} 
                    setInput={setChatInput} 
                    onSend={handleSendMessage} 
                    loading={chatLoading} 
                  />
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;