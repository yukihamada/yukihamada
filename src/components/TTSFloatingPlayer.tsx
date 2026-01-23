import { Volume2, Pause, Square, RotateCcw, Gauge, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTTSPlayer } from '@/contexts/TTSPlayerContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const TTSFloatingPlayer = () => {
  const { language } = useLanguage();
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

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't render if no TTS is active
  if (!postSlug && !isLoading) return null;

  return (
    <AnimatePresence>
      {(isPlaying || isPaused || isLoading) && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40"
        >
          <div className="bg-background/95 backdrop-blur-lg border border-primary/30 rounded-2xl shadow-xl p-4">
            {/* Header with title and close */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <Volume2 className="h-5 w-5 text-primary" />
                  {isPlaying && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {isLoading 
                      ? (language === 'ja' ? '音声生成中...' : 'Generating audio...')
                      : postTitle
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ja' ? 'AI読み上げ' : 'AI Narration'}
                  </p>
                </div>
              </div>
              <Button 
                onClick={stop} 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Progress bar with time */}
                <div className="flex items-center gap-2 w-full mb-3">
                  <span className="text-xs font-mono text-muted-foreground min-w-[36px]">
                    {formatTime(currentTime)}
                  </span>
                  <Slider
                    value={[currentTime]}
                    onValueChange={([value]) => seek(value)}
                    max={duration || 100}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-xs font-mono text-muted-foreground min-w-[36px] text-right">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-2">
                  {isPlaying ? (
                    <>
                      <div className="flex items-center gap-0.5 mr-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="w-1 bg-primary rounded-full animate-pulse"
                            style={{ 
                              height: `${8 + Math.sin(i) * 8}px`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                      <Button onClick={pause} variant="secondary" size="icon" className="h-10 w-10 rounded-full">
                        <Pause className="h-5 w-5" />
                      </Button>
                    </>
                  ) : (
                    <Button onClick={play} variant="default" size="icon" className="h-10 w-10 rounded-full">
                      <Volume2 className="h-5 w-5" />
                    </Button>
                  )}
                  
                  <Button onClick={restart} variant="ghost" size="icon" className="h-9 w-9">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  
                  <Button onClick={stop} variant="ghost" size="icon" className="h-9 w-9">
                    <Square className="h-4 w-4" />
                  </Button>

                  {/* Speed control */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1">
                        <Gauge className="h-3.5 w-3.5" />
                        <span>{playbackRate}x</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-3" align="center">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {language === 'ja' ? '再生速度' : 'Speed'}
                          </span>
                          <span className="text-sm font-medium">{playbackRate}x</span>
                        </div>
                        <Slider
                          value={[playbackRate]}
                          onValueChange={([value]) => setPlaybackRate(value)}
                          min={0.5}
                          max={2.0}
                          step={0.25}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0.5x</span>
                          <span>1x</span>
                          <span>2x</span>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TTSFloatingPlayer;
