import { useState } from 'react';
import { Volume2, Pause, Square, RotateCcw, Gauge, X, Loader2, GripVertical, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTTSPlayer } from '@/contexts/TTSPlayerContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const TTSFloatingPlayer = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const {
    isLoading,
    isPlaying,
    isPaused,
    currentTime,
    duration,
    playbackRate,
    postTitle,
    postSlug,
    play,
    pause,
    stop,
    restart,
    seek,
    setPlaybackRate,
  } = useTTSPlayer();

  const dragControls = useDragControls();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if we're on the same blog post
  const isOnSameBlogPost = postSlug && location.pathname === `/blog/${postSlug}`;

  // Don't render if no TTS is active or if we're on the same blog post (controls show in-page)
  if ((!postSlug && !isLoading) || isOnSameBlogPost) return null;

  // Only show if playing or paused
  if (!isPlaying && !isPaused && !isLoading) return null;

  // Minimized view - just an icon
  if (isMinimized) {
    return (
      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          setPosition({ x: position.x + info.offset.x, y: position.y + info.offset.y });
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1, x: position.x }}
        exit={{ scale: 0 }}
        className="fixed bottom-32 right-4 z-40 touch-none"
        style={{ y: position.y }}
      >
        <motion.button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 rounded-full bg-primary shadow-xl flex items-center justify-center relative"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{ boxShadow: '0 10px 25px -5px hsl(var(--primary) / 0.4)' }}
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 text-primary-foreground animate-spin" />
          ) : (
            <>
              <Volume2 className="h-6 w-6 text-primary-foreground" />
              {isPlaying && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary-foreground/50"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </>
          )}
          {/* Progress ring */}
          {!isLoading && duration > 0 && (
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r="26"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-primary-foreground/20"
              />
              <circle
                cx="28"
                cy="28"
                r="26"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 * (1 - currentTime / duration)}
                className="text-primary-foreground"
                strokeLinecap="round"
              />
            </svg>
          )}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          setPosition({ x: position.x + info.offset.x, y: position.y + info.offset.y });
        }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1, x: position.x }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-32 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40 touch-none"
        style={{ y: position.y }}
      >
        <div className="bg-background/95 backdrop-blur-lg border border-primary/30 rounded-2xl shadow-xl p-3">
          {/* Drag handle */}
          <div 
            className="absolute -top-2 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing p-1"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
          </div>

          {/* Header with title and controls */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="relative shrink-0">
                <Volume2 className="h-4 w-4 text-primary" />
                {isPlaying && (
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">
                  {isLoading 
                    ? (language === 'ja' ? '音声生成中...' : 'Generating...')
                    : postTitle
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button 
                onClick={() => setIsMinimized(true)} 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                title={language === 'ja' ? '最小化' : 'Minimize'}
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </Button>
              <Button 
                onClick={stop} 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Progress bar with time */}
              <div className="flex items-center gap-2 w-full mb-2">
                <span className="text-[10px] font-mono text-muted-foreground min-w-[32px]">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[currentTime]}
                  onValueChange={([value]) => seek(value)}
                  max={duration || 100}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-[10px] font-mono text-muted-foreground min-w-[32px] text-right">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-1.5">
                {isPlaying ? (
                  <>
                    <div className="flex items-center gap-0.5 mr-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-0.5 bg-primary rounded-full animate-pulse"
                          style={{ 
                            height: `${6 + Math.sin(i) * 6}px`,
                            animationDelay: `${i * 0.1}s`
                          }}
                        />
                      ))}
                    </div>
                    <Button onClick={pause} variant="secondary" size="icon" className="h-8 w-8 rounded-full">
                      <Pause className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button onClick={play} variant="default" size="icon" className="h-8 w-8 rounded-full">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
                
                <Button onClick={restart} variant="ghost" size="icon" className="h-7 w-7">
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
                
                <Button onClick={stop} variant="ghost" size="icon" className="h-7 w-7">
                  <Square className="h-3.5 w-3.5" />
                </Button>

                {/* Speed control */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] gap-1">
                      <Gauge className="h-3 w-3" />
                      <span>{playbackRate}x</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 p-2" align="center">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          {language === 'ja' ? '速度' : 'Speed'}
                        </span>
                        <span className="text-xs font-medium">{playbackRate}x</span>
                      </div>
                      <Slider
                        value={[playbackRate]}
                        onValueChange={([value]) => setPlaybackRate(value)}
                        min={0.5}
                        max={2.0}
                        step={0.25}
                        className="w-full"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TTSFloatingPlayer;
