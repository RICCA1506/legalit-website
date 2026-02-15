import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from "react";

export interface VideoLogoRef {
  setProgress: (progress: number) => void;
  reset: () => void;
}

interface VideoLogoProps {
  videoSrc?: string;
  duration?: number;
  className?: string;
}

const VideoLogo = forwardRef<VideoLogoRef, VideoLogoProps>(
  ({ videoSrc, duration = 1.5, className = "" }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hasVideoSrc = !!videoSrc;
    const [isReady, setIsReady] = useState(false);
    const pendingProgressRef = useRef<number | null>(null);

    useImperativeHandle(ref, () => ({
      setProgress: (progress: number) => {
        if (!hasVideoSrc) return;
        
        const clampedProgress = Math.max(0, Math.min(1, progress));
        
        if (isReady && videoRef.current && videoRef.current.readyState >= 1) {
          const targetTime = clampedProgress * duration;
          videoRef.current.currentTime = targetTime;
          videoRef.current.pause();
        } else {
          pendingProgressRef.current = clampedProgress;
        }
      },
      reset: () => {
        if (!hasVideoSrc) return;
        
        if (isReady && videoRef.current && videoRef.current.readyState >= 1) {
          videoRef.current.currentTime = 0;
          videoRef.current.pause();
        } else {
          pendingProgressRef.current = 0;
        }
      },
    }), [hasVideoSrc, isReady, duration]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !hasVideoSrc) return;

      const handleLoadedMetadata = () => {
        setIsReady(true);
        video.pause();
        video.currentTime = 0;
        
        if (pendingProgressRef.current !== null) {
          const targetTime = pendingProgressRef.current * duration;
          video.currentTime = targetTime;
          pendingProgressRef.current = null;
        }
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      if (video.readyState >= 1) {
        handleLoadedMetadata();
      }

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }, [hasVideoSrc, duration]);

    if (!hasVideoSrc) {
      return (
        <div 
          className={`flex items-center justify-center bg-black/20 rounded-lg ${className}`}
          style={{ width: '660px', height: '660px', maxWidth: '85vw', maxHeight: '70vh' }}
        >
          <div className="text-center text-white/60">
            <div className="w-24 h-24 mx-auto mb-4 border-4 border-white/30 border-dashed rounded-full flex items-center justify-center">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm">Video placeholder</p>
            <p className="text-xs opacity-60 mt-1">Awaiting video1.mp4</p>
          </div>
        </div>
      );
    }

    return (
      <div 
        className={className}
        style={{ width: '660px', height: '660px', maxWidth: '85vw', maxHeight: '70vh' }}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-contain"
          muted
          playsInline
          preload="auto"
        />
      </div>
    );
  }
);

VideoLogo.displayName = "VideoLogo";

export default VideoLogo;
