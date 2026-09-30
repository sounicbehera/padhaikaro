import React, { useEffect, useState } from 'react';

const TimerWidget = ({ startTime, durationMinutes, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = durationMinutes * 60 - elapsed;
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        onExpire();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, durationMinutes, onExpire]);

  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className={`text-xl font-bold font-mono ${timeLeft < 300 ? 'text-red-500' : 'text-gray-800'}`}>
      {m}:{s}
    </div>
  );
};

export default TimerWidget;
