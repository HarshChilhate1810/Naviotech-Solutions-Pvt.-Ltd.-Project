import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  RotateCw, 
  Film, 
  Settings, 
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';

// High-quality open-source cinematic stream fallbacks if no video is attached
const DEFAULT_MOVIE_STREAM = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';

export function MoviePlayerModal({ movie, onClose }) {
  const movieDetails = movie?.movie_details || {};
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Determine stream source: either user video_url, or fallback open stream
  const rawUrl = movieDetails.video_url || DEFAULT_MOVIE_STREAM;

  // Detect YouTube or Vimeo embed
  const isYouTube = rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be');
  const isVimeo = rawUrl.includes('vimeo.com');

  const getEmbedUrl = (url) => {
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (url.includes('watch?v=')) {
      const id = url.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (url.includes('vimeo.com/')) {
      const id = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
    return url;
  };

  const isEmbed = isYouTube || isVimeo;
  const embedUrl = isEmbed ? getEmbedUrl(rawUrl) : null;

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [bufferedEnd, setBufferedEnd] = useState(0);

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Autoplay video on mount if HTML5 video
  useEffect(() => {
    if (!isEmbed && videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay may be restricted with audio until user interaction
        setIsPlaying(false);
      });
    }
  }, [isEmbed, rawUrl]);

  // Hide controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Seek time
  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const seekTo = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTo;
    setCurrentTime(seekTo);
  };

  const seekRelative = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
  };

  // Volume control
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  // Playback speed
  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setSpeedMenuOpen(false);
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard controls: Space, Arrow keys, f, m, Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        seekRelative(5);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seekRelative(-5);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (videoRef.current) {
          const newVol = Math.min(1, videoRef.current.volume + 0.1);
          videoRef.current.volume = newVol;
          setVolume(newVol);
          setIsMuted(false);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (videoRef.current) {
          const newVol = Math.max(0, videoRef.current.volume - 0.1);
          videoRef.current.volume = newVol;
          setVolume(newVol);
        }
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Theater Container with ambient backlight glow */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full max-w-5xl h-[88vh] max-h-[760px] flex flex-col rounded-3xl bg-black border border-white/10 shadow-2xl overflow-hidden select-none group"
      >
        
        {/* Soft Ambient Cinematic Glow behind player */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-600/10 via-transparent to-blue-600/10 pointer-events-none opacity-50" />

        {/* Top Header Bar */}
        <div className={`absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Film className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-base sm:text-lg text-white truncate drop-shadow-md">
                {movie.title}
              </h3>
              <p className="text-xs text-slate-300 flex items-center gap-2 drop-shadow-xs">
                <span>{movie.genre}</span>
                {movieDetails.release_year && (
                  <>
                    <span>•</span>
                    <span>{movieDetails.release_year}</span>
                  </>
                )}
                {movieDetails.director && (
                  <>
                    <span>•</span>
                    <span>Dir. {movieDetails.director}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all hover:scale-105"
            title="Close Player (Esc)"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Surface */}
        <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
          
          {isEmbed ? (
            /* Embedded Player (YouTube / Vimeo) */
            <iframe
              src={embedUrl}
              title={movie.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            /* HTML5 Native / Custom Video Engine */
            <div 
              className="relative w-full h-full flex items-center justify-center cursor-pointer"
              onClick={togglePlay}
            >
              <video
                ref={videoRef}
                src={rawUrl}
                playsInline
                className="w-full h-full object-contain"
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                    if (videoRef.current.buffered.length > 0) {
                      setBufferedEnd(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
                    }
                  }
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(videoRef.current.duration);
                  }
                }}
                onEnded={() => setIsPlaying(false)}
              />

              {/* Central Big Play Icon overlay when paused */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-all">
                  <div className="w-20 h-20 rounded-full bg-amber-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
                    <Play className="w-9 h-9 ml-1 fill-current" />
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Bottom Custom Playback Controls Bar (for HTML5 video) */}
        {!isEmbed && (
          <div className={`absolute bottom-0 left-0 right-0 z-30 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            
            {/* Progress / Scrub Bar */}
            <div className="relative group/scrub mb-3 flex items-center">
              {/* Buffer Bar */}
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-white/20 pointer-events-none"
                style={{ width: `${duration > 0 ? (bufferedEnd / duration) * 100 : 0}%` }}
              />

              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:h-2 transition-all"
              />
            </div>

            {/* Control Buttons Row */}
            <div className="flex items-center justify-between text-white text-xs">
              
              {/* Left Controls: Play/Pause, Seek buttons, Volume, Time */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => seekRelative(-10)}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors hidden sm:inline-flex"
                  title="Rewind 10 seconds"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => seekRelative(10)}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors hidden sm:inline-flex"
                  title="Fast forward 10 seconds"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Volume & Mute */}
                <div className="flex items-center gap-2 group/vol">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                    title={isMuted ? 'Unmute (m)' : 'Mute (m)'}
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 sm:w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    title="Volume"
                  />
                </div>

                {/* Time Display */}
                <div className="font-mono text-[11px] text-slate-300 ml-1">
                  <span>{formatTime(currentTime)}</span>
                  <span className="opacity-40 mx-1">/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right Controls: Speed, Fullscreen */}
              <div className="flex items-center gap-2">
                
                {/* Speed Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
                    title="Playback speed"
                  >
                    {playbackSpeed}x
                  </button>

                  {speedMenuOpen && (
                    <div className="absolute bottom-full right-0 mb-2 py-1.5 w-24 rounded-xl bg-navy-900 border border-white/15 shadow-2xl z-40">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleSpeedChange(s)}
                          className={`w-full text-left px-3 py-1 text-xs hover:bg-white/10 transition-colors ${
                            playbackSpeed === s ? 'text-amber-400 font-bold' : 'text-slate-200'
                          }`}
                        >
                          {s}x {s === 1 && '(Normal)'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  title="Toggle Fullscreen (f)"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
