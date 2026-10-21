import React, { useState, useMemo, useEffect, useRef } from 'react';
import { transformCloudinaryVideoUrl } from '../utils/videoUrlTransformer';
import { Play, CheckCircle, Gauge, Sparkles, Award } from 'lucide-react';
import {
  setVideoPlayingState,
  recordVideoCompletion,
  isVideoCompleted
} from '../utils/tracker';

const SPEEDS = [
  { label: '0.75x', value: 0.75 },
  { label: '1x', value: 1.0 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x', value: 1.5 },
  { label: '1.75x', value: 1.75 },
  { label: '2x (Max)', value: 2.0 },
];

export const AdaptiveVideoPlayer = ({ rawUrl, poster, title, lessonId, courseId, onComplete }) => {
  const videoRef = useRef(null);
  const [hasError, setHasError] = useState(false);
  const [isInteracted, setIsInteracted] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(1.0);
  const [isCompleted, setIsCompleted] = useState(() => isVideoCompleted(lessonId));
  const [progressPercent, setProgressPercent] = useState(0);
  const [showCelebrationBanner, setShowCelebrationBanner] = useState(false);

  const { hlsUrl, mp4Url } = useMemo(() => transformCloudinaryVideoUrl(rawUrl), [rawUrl]);

  useEffect(() => {
    // Check initial completion status whenever lessonId changes
    const completed = isVideoCompleted(lessonId);
    setIsCompleted(completed);
    setProgressPercent(0);
    setShowCelebrationBanner(false);
    setCurrentSpeed(1.0);

    const handleTrackerChange = () => {
      setIsCompleted(isVideoCompleted(lessonId));
    };
    window.addEventListener('pk-tracker-update', handleTrackerChange);
    return () => {
      setVideoPlayingState(false);
      window.removeEventListener('pk-tracker-update', handleTrackerChange);
    };
  }, [lessonId]);

  useEffect(() => {
    if (!document.querySelector('link[href="https://res.cloudinary.com"]')) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = 'https://res.cloudinary.com';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  }, []);

  const handleError = (e) => {
    console.error(`[VideoPlayer Error]: Failed to load video stream for ${rawUrl}`, e);
    setHasError(true);
    setVideoPlayingState(false);
  };

  const changeSpeed = (speed) => {
    // Enforce MAX 2X limit
    const clampedSpeed = Math.min(2.0, Math.max(0.5, speed));
    if (videoRef.current) {
      videoRef.current.playbackRate = clampedSpeed;
    }
    setCurrentSpeed(clampedSpeed);
  };

  const handleRateChange = () => {
    if (videoRef.current) {
      // Strict enforcement of max 2x
      if (videoRef.current.playbackRate > 2.0) {
        videoRef.current.playbackRate = 2.0;
      }
      setCurrentSpeed(videoRef.current.playbackRate);
    }
  };

  const triggerCompletion = async () => {
    if (isCompleted || !lessonId) return;
    setIsCompleted(true);
    setShowCelebrationBanner(true);
    await recordVideoCompletion({
      lessonId,
      lessonTitle: title,
      courseId
    });
    onComplete?.();
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const { currentTime, duration } = videoRef.current;
    if (duration > 0) {
      const pct = (currentTime / duration) * 100;
      setProgressPercent(pct);
      // If watched 95% or more, mark complete
      if (pct >= 95 && !isCompleted && lessonId) {
        triggerCompletion();
      }
    }
  };

  const handleEnded = () => {
    setVideoPlayingState(false);
    if (!isCompleted && lessonId) {
      triggerCompletion();
    }
  };

  if (!hlsUrl && !mp4Url) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-surface-container-highest text-on-surface rounded-xl p-6 text-center shadow-lg">
        <p>Invalid video URL provided.</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-surface-container-highest text-error rounded-xl p-6 text-center shadow-lg">
        <span className="material-symbols-outlined text-4xl mb-2">error</span>
        <p className="font-semibold">Media Playback Failed</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-black rounded-xl overflow-hidden shadow-2xl group">
      
      {/* Video Display Area */}
      <div className="relative w-full flex-grow aspect-video bg-black flex items-center justify-center overflow-hidden">
        {/* Facade Overlay */}
        <div 
          className={`absolute inset-0 z-20 flex flex-col justify-center items-center cursor-pointer bg-cover bg-center transition-opacity duration-300 ${isInteracted ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          style={{ backgroundImage: `url(${poster || 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=2000&auto=format&fit=crop'})` }}
          onClick={() => {
            setIsInteracted(true);
            setVideoPlayingState(true);
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity group-hover:bg-black/30"></div>
          <div className="relative z-30 w-20 h-20 rounded-full bg-primary/80 border-2 border-white/50 flex items-center justify-center backdrop-blur-md shadow-[0_0_40px_rgba(208,188,255,0.4)] group-hover:scale-110 transition-transform duration-300">
            <Play className="text-white w-10 h-10 ml-2 fill-current" />
          </div>
          <div className="relative z-30 mt-4 px-3 py-1 rounded-full bg-black/60 border border-white/20 text-xs text-white/90 font-medium">
            Click to Play Video • Earn +10 XP on Completion
          </div>
        </div>

        {/* Completion Toast Banner inside Player */}
        {showCelebrationBanner && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-emerald-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4" />
            <span>Video Completed! +10 Points Added to Profile!</span>
          </div>
        )}

        {/* Video Element */}
        <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isInteracted ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {isInteracted && (
            <video
              ref={videoRef}
              src={rawUrl}
              className="w-full h-full object-contain"
              controls
              autoPlay
              onPlay={() => setVideoPlayingState(true)}
              onPause={() => setVideoPlayingState(false)}
              onRateChange={handleRateChange}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onError={(e) => {
                console.error('Native video error:', e.nativeEvent);
                handleError(e);
              }}
            />
          )}
        </div>
      </div>

      {/* Speed Controls & Tracker Status Bar */}
      <div className="bg-surface-container-high/90 backdrop-blur-md border-t border-white/10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Speed Controls (Max 2X) */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 text-on-surface-variant font-medium mr-1">
            <Gauge className="w-3.5 h-3.5 text-primary" />
            <span>Speed (Max 2X):</span>
          </div>
          <div className="flex items-center gap-1 bg-surface-container rounded-lg p-0.5 border border-white/5">
            {SPEEDS.map((s) => {
              const active = Math.abs(currentSpeed - s.value) < 0.05;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => changeSpeed(s.value)}
                  className={`px-2 py-1 rounded font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-primary text-on-primary font-bold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                  }`}
                  title={`Play at ${s.label}`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Completion Tracker Status */}
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-semibold">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Video Completed (+10 pts)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-on-surface-variant bg-surface-container px-3 py-1 rounded-full border border-white/5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span>Watch to end for +10 points ({progressPercent.toFixed(0)}%)</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdaptiveVideoPlayer;
