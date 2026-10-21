import React, { useState, useEffect } from 'react';
import { Clock, Target, CheckCircle2, TrendingUp, Sparkles, Activity } from 'lucide-react';
import { getTimeSpentSeconds, formatDuration } from '../../utils/tracker';

const WeeklyGoal = ({ weeklyGoal }) => {
  // Local state for live reactivity
  const [liveSeconds, setLiveSeconds] = useState(() => {
    const serverSeconds = weeklyGoal?.timeSpentSeconds || 0;
    const localSecs = getTimeSpentSeconds();
    return Math.max(serverSeconds, localSecs);
  });

  useEffect(() => {
    // If weeklyGoal changes from query, sync up
    if (weeklyGoal?.timeSpentSeconds !== undefined) {
      setLiveSeconds((prev) => Math.max(prev, weeklyGoal.timeSpentSeconds));
    }

    const handleTrackerUpdate = (e) => {
      const updatedSeconds = e.detail?.timeSpentSeconds;
      if (updatedSeconds !== undefined) {
        setLiveSeconds(updatedSeconds);
      }
    };

    window.addEventListener('pk-tracker-update', handleTrackerUpdate);
    return () => window.removeEventListener('pk-tracker-update', handleTrackerUpdate);
  }, [weeklyGoal]);

  if (!weeklyGoal) return null;

  const targetHours = weeklyGoal.targetHours || 10;
  const targetSeconds = targetHours * 3600;

  // Compute percentage based on tracked live time
  const calculatedPercentage = Math.min(
    100,
    Math.round(((liveSeconds / targetSeconds) * 100) * 10) / 10
  );

  // If server had a higher completedPercentage (e.g. from prior course progress), preserve it
  const completedPercentage = Math.max(weeklyGoal.completedPercentage || 0, calculatedPercentage);

  const remainingSeconds = Math.max(0, targetSeconds - liveSeconds);

  return (
    <section className="bg-surface-container-high rounded-xl border border-white/10 p-unit-lg flex flex-col justify-between relative w-full shadow-[0px_20px_40px_rgba(0,0,0,0.3)] overflow-hidden group">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      {/* Header */}
      <div className="w-full flex items-start justify-between mb-4 z-10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Weekly Goal</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Tracking
            </span>
          </div>
          <p className="text-on-surface-variant font-body-sm text-body-sm mt-0.5">
            Target: Study {targetHours} hours this week
          </p>
        </div>
        <div className="p-2 rounded-lg bg-surface-container border border-white/5 text-primary">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      {/* Center Circular Progress */}
      <div className="relative w-44 h-44 mx-auto my-3 z-10 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle cx="50" cy="50" fill="none" r="45" stroke="#252528" strokeWidth="8"></circle>
          {/* Progress circle */}
          <circle 
            className="text-primary drop-shadow-[0_0_12px_rgba(208,188,255,0.6)] transition-all duration-700 ease-out" 
            cx="50" 
            cy="50" 
            fill="none" 
            r="45" 
            stroke="currentColor" 
            strokeDasharray="282.7" 
            strokeDashoffset={282.7 - (282.7 * Math.min(100, completedPercentage)) / 100} 
            strokeWidth="8"
            strokeLinecap="round">
          </circle>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-headline-md text-headline-md font-bold text-on-surface">
            {completedPercentage}%
          </span>
          <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider text-[11px] mt-0.5">
            Complete
          </span>
          <span className="text-primary/90 text-[11px] font-medium mt-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            {formatDuration(liveSeconds)} logged
          </span>
        </div>
      </div>

      {/* Tracker Module Metrics Bar */}
      <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5 z-10">
        <div className="bg-surface-container rounded-lg p-2.5 border border-white/5 flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <Clock className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold truncate">Time Spent</div>
            <div className="font-bold text-on-surface text-sm truncate">
              {formatDuration(liveSeconds)}
            </div>
          </div>
        </div>

        <div className="bg-surface-container rounded-lg p-2.5 border border-white/5 flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-secondary/10 text-secondary">
            <Target className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold truncate">Remaining</div>
            <div className="font-bold text-on-surface text-sm truncate">
              {remainingSeconds > 0 ? formatDuration(remainingSeconds) : 'Goal Reached! 🎯'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeeklyGoal;
