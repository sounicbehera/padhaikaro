import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, Sparkles, X } from 'lucide-react';

const PointToast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToastEvent = (e) => {
      const { message, points = 10 } = e.detail || {};
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, points }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    };

    window.addEventListener('pk-point-toast', handleToastEvent);
    return () => window.removeEventListener('pk-point-toast', handleToastEvent);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-surface-container-high/95 backdrop-blur-xl border border-primary/40 rounded-xl p-4 shadow-[0_10px_30px_rgba(208,188,255,0.25)] flex items-center justify-between gap-3 animate-bounce-in transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(208,188,255,0.6)]">
              <Sparkles className="w-5 h-5 text-on-primary" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-on-surface text-sm">Achievement Unlocked!</span>
                <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full border border-primary/30">
                  +{toast.points} XP
                </span>
              </div>
              <p className="text-xs text-on-surface-variant truncate max-w-[210px] mt-0.5">
                {toast.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default PointToast;
