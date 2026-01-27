import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Gauge, X, Loader2, GripVertical, Minimize2, Music, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useTTSPlayer, getBgmTracks } from '@/contexts/TTSPlayerContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import yukiProfile from '@/assets/yuki-profile.jpg';

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
    bgMusicEnabled,
    bgMusicTrackId,
    play,
    pause,
    stop,
    restart,
    seek,
    setPlaybackRate,
    toggleBgMusic,
    setBgMusicTrack,
  } = useTTSPlayer();

  const bgmTracks = getBgmTracks();

  const dragControls = useDragControls();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [analyzerData, setAnalyzerData] = useState<number[]>(new Array(8).fill(0.1));
  const animationRef = useRef<number | null>(null);

  // Simulated visualizer animation when playing
  useEffect(() => {
    if (isPlaying) {
      const updateVisualizer = () => {
        const newData = Array.from({ length: 8 }, () => 
          0.2 + Math.random() * 0.8
        );
        setAnalyzerData(newData);
        animationRef.current = requestAnimationFrame(updateVisualizer);
      };
      animationRef.current = requestAnimationFrame(updateVisualizer);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setAnalyzerData(new Array(8).fill(0.1));
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const skipBack = () => seek(Math.max(0, currentTime - 10));
  const skipForward = () => seek(Math.min(duration, currentTime + 10));

  // Check if we're on the same blog post
  const isOnSameBlogPost = postSlug && location.pathname === `/blog/${postSlug}`;

  // Don't render if no TTS is active or if we're on the same blog post (controls show in-page)
  if ((!postSlug && !isLoading) || isOnSameBlogPost) return null;

  // Only show if playing or paused
  if (!isPlaying && !isPaused && !isLoading) return null;

  // Minimized view - podcast icon with progress ring
  if (isMinimized) {
    return (
      <motion.div
        drag
        dragListener={false}
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
          onPointerDown={(e) => dragControls.start(e)}
          className="relative cursor-grab active:cursor-grabbing"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Avatar with progress ring */}
          <div className="relative">
            <Avatar className="h-14 w-14 border-2 border-primary shadow-xl">
              <AvatarImage src={yukiProfile} alt="Yuki" />
              <AvatarFallback>Y</AvatarFallback>
            </Avatar>
            
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
                  className="text-primary/20"
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
                  className="text-primary"
                  strokeLinecap="round"
                />
              </svg>
            )}

            {/* Loading spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
            )}

            {/* Playing indicator */}
            {isPlaying && !isLoading && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-0.5 bg-primary-foreground rounded-full"
                      animate={{ height: ['2px', '6px', '2px'] }}
                      transition={{ duration: 0.4, delay: i * 0.1, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragListener={false}
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
        className="fixed bottom-32 left-2 right-2 sm:left-4 sm:right-4 md:left-auto md:right-4 md:w-96 z-40 touch-none max-w-[calc(100vw-16px)]"
        style={{ y: position.y }}
      >
        <div className="relative overflow-hidden bg-background/95 backdrop-blur-lg border border-primary/30 rounded-2xl shadow-xl">
          {/* Animated background */}
          {isPlaying && (
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          )}

          <div className="relative z-10 p-4">
            {/* Drag handle */}
            <div 
              className="absolute -top-1 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing p-1"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/50" />
            </div>

            {/* Header with album art and info */}
            <div className="flex items-center gap-3 mb-3">
              {/* Mini album art with host avatar */}
              <div className="relative shrink-0">
                <Avatar className="h-12 w-12 border border-primary/30">
                  <AvatarImage src={yukiProfile} alt="Yuki" />
                  <AvatarFallback>Y</AvatarFallback>
                </Avatar>
                {isPlaying && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {isPlaying && (
                    <div className="flex items-center gap-0.5">
                      {analyzerData.slice(0, 4).map((value, i) => (
                        <motion.div
                          key={i}
                          className="w-0.5 bg-primary rounded-full"
                          animate={{ height: `${value * 12}px` }}
                          transition={{ duration: 0.1 }}
                        />
                      ))}
                    </div>
                  )}
                  <span className="text-[10px] font-medium text-primary uppercase tracking-wide">
                    {isLoading ? (language === 'ja' ? '生成中' : 'Generating') : 
                     isPlaying ? (language === 'ja' ? '再生中' : 'Playing') : 
                     (language === 'ja' ? '一時停止' : 'Paused')}
                  </span>
                </div>
                <p className="text-sm font-medium truncate">
                  {isLoading ? (language === 'ja' ? '音声を準備中...' : 'Preparing audio...') : postTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  <Volume2 className="inline h-3 w-3 mr-1" />
                  Yuki's Blog Podcast
                </p>
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
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Progress bar */}
                <div 
                  className="flex items-center gap-2 w-full mb-3"
                  onPointerDownCapture={(e) => e.stopPropagation()}
                >
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
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <Button onClick={skipBack} variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                      <SkipBack className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </Button>

                    {isPlaying ? (
                      <Button onClick={pause} variant="default" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-full">
                        <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    ) : (
                      <Button onClick={play} variant="default" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-full">
                        <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-0.5" />
                      </Button>
                    )}

                    <Button onClick={skipForward} variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                      <SkipForward className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </Button>

                    <Button onClick={restart} variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7">
                      <RotateCcw className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </Button>
                    
                    <Button onClick={stop} variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7">
                      <Square className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {/* BGM Toggle */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant={bgMusicEnabled ? "secondary" : "ghost"} 
                          size="icon" 
                          className="h-6 w-6 sm:h-7 sm:w-7"
                        >
                          <Music className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${bgMusicEnabled ? 'text-primary' : ''}`} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2" align="end">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium">BGM</span>
                          <Switch 
                            checked={bgMusicEnabled} 
                            onCheckedChange={toggleBgMusic}
                          />
                        </div>
                        {bgMusicEnabled && (
                          <Select value={bgMusicTrackId} onValueChange={setBgMusicTrack}>
                            <SelectTrigger className="w-full h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {bgmTracks.map((track) => (
                                <SelectItem key={track.id} value={track.id} className="text-xs">
                                  {track.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </PopoverContent>
                    </Popover>

                    {/* Speed control */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-6 sm:h-7 px-1.5 sm:px-2 text-[9px] sm:text-[10px] gap-0.5">
                          <Gauge className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          <span>{playbackRate}x</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-2" align="end">
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
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TTSFloatingPlayer;
