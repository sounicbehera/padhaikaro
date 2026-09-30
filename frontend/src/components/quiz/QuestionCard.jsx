import React from 'react';

const QuestionCard = ({ question, selectedAnswer, onSelect }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{question.question}</h3>
      <div className="flex flex-col gap-3">
        {question.options.map((opt, idx) => (
          <label 
            key={idx} 
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedAnswer === opt ? 'bg-blue-50 border-blue-500' : 'border-gray-300 hover:bg-gray-50'}`}
          >
            <input 
              type="radio" 
              name={`q-${question.id}`} 
              value={opt} 
              checked={selectedAnswer === opt} 
              onChange={() => onSelect(opt)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-gray-700">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
