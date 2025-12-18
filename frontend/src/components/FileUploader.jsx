import React from 'react';

const FileUploader = ({ onFileUpload }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative group cursor-pointer">
        <label className="flex flex-col items-center justify-center w-full max-w-lg p-12 bg-white rounded-xl shadow-sm hover:shadow-md border-2 border-dashed border-slate-300 hover:border-blue-400 transition-all duration-300">
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Upload Bank Statement
            </h3>
            <p className="text-sm text-slate-500 mb-6 max-w-xs">
              Drag and drop your file here, or click to browse
            </p>
            
            <span className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
              Choose File
            </span>
          </div>

          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            onChange={onFileUpload} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          />
        </label>
      </div>
      <p className="mt-6 text-xs font-medium text-slate-400">
        Supported formats: .xlsx, .xls, .csv
      </p>
    </div>
  );
};

export default FileUploader;
