import React from 'react';

const ResultSummary = ({ score, total, subject, onDownload, onClose }) => {
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= 60; // 60% passing

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 text-center max-w-lg mx-auto">
      <h2 className="text-3xl font-bold mb-4">{passed ? 'Congratulations!' : 'Keep Practicing!'}</h2>
      <p className="text-gray-600 mb-6">You have completed the {subject} Quiz.</p>
      
      <div className="text-6xl font-black mb-2 text-blue-600">{percentage}%</div>
      <p className="text-gray-500 mb-8">Score: {score} out of {total}</p>

      {passed ? (
        <div className="flex flex-col gap-3">
          <p className="text-green-600 font-medium mb-4">You have successfully earned your certificate!</p>
          <button 
            onClick={onDownload}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Download Certificate (PDF)
          </button>
        </div>
      ) : (
        <p className="text-red-500 font-medium mb-6">You need at least 60% to pass and earn a certificate. Try again later!</p>
      )}

      <button 
        onClick={onClose}
        className="mt-4 w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
      >
        Return to Catalog
      </button>
    </div>
  );
};

export default ResultSummary;
