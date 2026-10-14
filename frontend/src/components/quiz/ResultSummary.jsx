import React from 'react';

const ResultSummary = ({ score, total, subject, onDownload, onClose, isDownloading }) => {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= 60; // 60% passing

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 text-center max-w-lg mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-gray-900">{passed ? 'Congratulations!' : 'Keep Practicing!'}</h2>
      <p className="text-gray-600 mb-6">You have completed the {subject} Quiz.</p>
      
      <div className="text-6xl font-black mb-2 text-blue-600">{percentage}%</div>
      <p className="text-gray-500 mb-8">Score: {score} out of {total}</p>

      {passed ? (
        <div className="flex flex-col gap-3">
          <p className="text-green-600 font-medium mb-4">You have successfully earned your certificate!</p>
          <button 
            onClick={onDownload}
            disabled={isDownloading}
            className={`w-full py-3 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 cursor-pointer ${
              isDownloading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-sm'
            }`}
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating Certificate PDF...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                <span>Download Certificate (PDF)</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <p className="text-red-500 font-medium mb-6">You need at least 60% to pass and earn a certificate. Try again later!</p>
      )}

      <button 
        onClick={onClose}
        disabled={isDownloading}
        className="mt-4 w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition cursor-pointer"
      >
        Return to Catalog
      </button>
    </div>
  );
};

export default ResultSummary;
