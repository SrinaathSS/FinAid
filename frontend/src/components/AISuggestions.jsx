import React from 'react';

const AISuggestions = ({ suggestions, loading }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-blue-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
            <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900">AI Insights</h3>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-2.5 bg-slate-200 rounded w-3/4"></div>
          <div className="h-2.5 bg-slate-200 rounded w-full"></div>
          <div className="h-2.5 bg-slate-200 rounded w-5/6"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions && suggestions.length > 0 ? (
            suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 font-bold text-xs rounded">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700 font-medium leading-relaxed pt-0.5">
                  {s}
                </p>
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-sm text-center py-4 bg-slate-50 rounded-lg">
              Upload data to receive insights
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AISuggestions;
