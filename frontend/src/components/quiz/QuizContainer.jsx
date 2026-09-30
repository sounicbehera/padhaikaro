import React from 'react';
import { getQuizData } from './quizData';

const QuizContainer = () => {
  const quizData = getQuizData();
  return (
    <div className="bg-surface-container p-8 rounded-xl shadow-sm border border-outline-variant">
      <h2 className="text-2xl font-bold mb-6 text-on-surface">Available Certification Quizzes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.keys(quizData).map(subject => (
          <div key={subject} className="border border-outline-variant bg-surface p-6 rounded-lg text-center hover:border-primary transition shadow-sm hover:shadow-md flex flex-col items-center">
            <h3 className="text-xl font-bold text-on-surface mb-2">{subject}</h3>
            <p className="text-sm text-on-surface-variant mb-4">15 Questions • 30 Minutes</p>
            <button 
              onClick={() => window.open(`/quiz/${encodeURIComponent(subject)}`, '_blank')}
              className="mt-auto w-full py-2 bg-primary text-on-primary rounded font-medium hover:bg-primary/90 transition"
            >
              Take Quiz
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizContainer;
