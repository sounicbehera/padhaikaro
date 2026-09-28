import React from 'react';

const WeeklyGoal = ({ weeklyGoal }) => {
  if (!weeklyGoal) return null;

  return (
    <section className="bg-surface-container-high rounded-xl border-t border-l border-white/10 p-unit-lg flex flex-col items-center justify-center relative w-full">
      <div className="w-full text-left mb-unit-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Weekly Goal</h2>
        <p className="text-on-surface-variant font-body-sm text-body-sm">Study {weeklyGoal.targetHours} hours</p>
      </div>

      {/* Circular Progress (CSS based) */}
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle cx="50" cy="50" fill="none" r="45" stroke="#2a2a2a" strokeWidth="8"></circle>
          {/* Progress circle */}
          <circle 
            className="text-secondary drop-shadow-[0_0_8px_rgba(173,198,255,0.5)] transition-all duration-1000 ease-out" 
            cx="50" 
            cy="50" 
            fill="none" 
            r="45" 
            stroke="currentColor" 
            strokeDasharray="282.7" 
            strokeDashoffset={282.7 - (282.7 * weeklyGoal.completedPercentage) / 100} 
            strokeWidth="8">
          </circle>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-headline-md text-headline-md text-on-surface">{weeklyGoal.completedPercentage}%</span>
          <span className="text-on-surface-variant font-label-sm text-label-sm">Complete</span>
        </div>
      </div>
    </section>
  );
};

export default WeeklyGoal;
