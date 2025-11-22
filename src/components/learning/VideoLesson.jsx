import React from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

/**
 * Video Lesson Component
 * Enhanced video player with YouTube IFrame API for progress tracking
 */
const VideoLesson = ({ lesson, onComplete, onProgressUpdate }) => {
  const playerRef = React.useRef(null);
  const playerInstanceRef = React.useRef(null);
  const progressIntervalRef = React.useRef(null);
  
  const [playerReady, setPlayerReady] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [hasWatchedEnough, setHasWatchedEnough] = React.useState(false);

  // Extract YouTube video ID
  const getYouTubeId = (url) => {
    if (!url) {
      console.warn('⚠️ No URL provided for video lesson');
      return null;
    }
    const match = url.match(/embed\/([^?]+)/);
    const id = match ? match[1] : null;
    console.log('🎬 Extracting video ID from URL:', { url, extractedId: id });
    return id;
  };

  const videoId = getYouTubeId(lesson?.content_url);

  React.useEffect(() => {
    console.log('🎥 VideoLesson mounted:', {
      lessonTitle: lesson.title,
      contentUrl: lesson.content_url,
      videoId: videoId,
      hasYTAPI: !!window.YT
    });
  }, []);

  // Load YouTube IFrame API
  React.useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }
    };
  }, [videoId]);

  const initPlayer = () => {
    if (!videoId || !window.YT) return;

    playerInstanceRef.current = new window.YT.Player(playerRef.current, {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        fs: 1,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  };

  const onPlayerReady = (event) => {
    setPlayerReady(true);
    const videoDuration = event.target.getDuration();
    setDuration(videoDuration);
  };

  const onPlayerStateChange = (event) => {
    // 1 = playing, 2 = paused
    if (event.data === 1) {
      setIsPlaying(true);
      startProgressTracking();
    } else {
      setIsPlaying(false);
      stopProgressTracking();
    }
  };

  const startProgressTracking = () => {
    if (progressIntervalRef.current) return;

    progressIntervalRef.current = setInterval(() => {
      if (playerInstanceRef.current) {
        const current = playerInstanceRef.current.getCurrentTime();
        const total = playerInstanceRef.current.getDuration();
        const prog = current / total;

        setCurrentTime(current);
        setProgress(prog);

        // Check if watched enough
        if (prog > 0.8 && !hasWatchedEnough) {
          setHasWatchedEnough(true);
        }

        // Report progress
        if (onProgressUpdate) {
          onProgressUpdate(prog);
        }
      }
    }, 1000); // Update every second
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  React.useEffect(() => {
    // Check if watched more than 80% to enable completion
    if (progress > 0.8 && !hasWatchedEnough) {
      console.log('🎉 80% threshold reached! Enabling complete button', {
        progress: (progress * 100).toFixed(1) + '%'
      });
      setHasWatchedEnough(true);
    }
  }, [progress]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    console.log('🎬 VideoLesson handleComplete called:', {
      hasWatchedEnough,
      completed: lesson.completed,
      progress: (progress * 100).toFixed(1) + '%',
      currentTime: formatTime(currentTime),
      duration: formatTime(duration)
    });

    if (onComplete && !lesson.completed && hasWatchedEnough) {
      console.log('✅ Calling onComplete callback...');
      onComplete();
    } else {
      console.log('⚠️ Complete blocked:', {
        hasOnComplete: !!onComplete,
        alreadyCompleted: lesson.completed,
        hasWatchedEnough
      });
    }
  };

  // If no valid video URL, show error
  if (!videoId) {
    return (
      <div className="h-full flex flex-col bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <div className="mb-4 text-red-400">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Video không khả dụng</h3>
            <p className="text-gray-400 mb-4">
              URL video không hợp lệ hoặc chưa được cấu hình.
            </p>
            <div className="bg-gray-800 rounded p-3 text-left text-sm text-gray-300">
              <p className="font-mono break-all">
                URL: {lesson?.content_url || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Video Container with YouTube Player */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {/* YouTube Player Div */}
        <div 
          ref={playerRef}
          className="w-full h-full"
          style={{ aspectRatio: '16/9' }}
        />

        {/* Video overlay - Title and Status */}
        <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-white text-xl font-bold mb-2">{lesson.title}</h2>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  <Play className="h-3 w-3 mr-1" />
                  Video
                </Badge>
                {lesson.completed && (
                  <Badge variant="secondary" className="bg-green-500 text-white border-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Đã hoàn thành
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 pointer-events-none">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 to-blue-600 transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-gray-900 px-8 py-4">
        <div className="max-w-6xl mx-auto">
          {/* Progress Info */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Clock className="h-4 w-4 text-gray-400" />
              <div className="text-sm text-gray-300">
                {playerReady && duration > 0 ? (
                  <span>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                ) : (
                  <span>Đang tải video...</span>
                )}
              </div>
              <div className="text-sm">
                {hasWatchedEnough ? (
                  <span className="text-green-400 font-medium">✓ Đã xem đủ 80% để hoàn thành</span>
                ) : (
                  <span className="text-gray-400">Xem tối thiểu 80% video ({Math.round(progress * 100)}%)</span>
                )}
              </div>
            </div>
            
            <Button
              onClick={handleComplete}
              disabled={lesson.completed || !hasWatchedEnough}
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 disabled:opacity-50"
            >
              {lesson.completed ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Đã hoàn thành
                </>
              ) : hasWatchedEnough ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Hoàn thành bài học
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Xem thêm {Math.round((0.8 - progress) * 100)}%
                </>
              )}
            </Button>
          </div>

          {/* Video Tips */}
          <div className="text-xs text-gray-500 flex items-center justify-between">
            <div>
              💡 <strong>Mẹo:</strong> Xem video với tốc độ 1.25x hoặc 1.5x để học nhanh hơn (Settings trong video player)
            </div>
            {isPlaying && (
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span>Đang phát</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoLesson;
