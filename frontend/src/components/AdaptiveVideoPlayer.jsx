import React, { useState, useMemo, useEffect } from 'react';
import { transformCloudinaryVideoUrl } from '../utils/videoUrlTransformer';
import { Play } from 'lucide-react';

export const AdaptiveVideoPlayer = ({ rawUrl, poster, title }) => {
  const [hasError, setHasError] = useState(false);
  const [isInteracted, setIsInteracted] = useState(false);

  const { hlsUrl, mp4Url } = useMemo(() => transformCloudinaryVideoUrl(rawUrl), [rawUrl]);

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
    <div className="relative w-full h-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group">
      
      {/* Facade Overlay */}
      <div 
        className={`absolute inset-0 z-20 flex flex-col justify-center items-center cursor-pointer bg-cover bg-center transition-opacity duration-300 ${isInteracted ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{ backgroundImage: `url(${poster || 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=2000&auto=format&fit=crop'})` }}
        onClick={() => setIsInteracted(true)}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity group-hover:bg-black/30"></div>
        <div className="relative z-30 w-20 h-20 rounded-full bg-primary/80 border-2 border-white/50 flex items-center justify-center backdrop-blur-md shadow-[0_0_40px_rgba(208,188,255,0.4)] group-hover:scale-110 transition-transform duration-300">
          <Play className="text-white w-10 h-10 ml-2 fill-current" />
        </div>
      </div>

        <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isInteracted ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {isInteracted && (
            <video
              src={rawUrl}
              className="w-full h-full object-contain"
              controls
              autoPlay
              onError={(e) => {
                console.error('Native video error:', e.nativeEvent);
                handleError(e);
              }}
            />
          )}
        </div>
    </div>
  );
};

export default AdaptiveVideoPlayer;
