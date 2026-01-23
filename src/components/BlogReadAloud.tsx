import { Volume2, Pause, Loader2, RotateCcw, Square, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTTSPlayer } from '@/contexts/TTSPlayerContext';
import { useLocation } from 'react-router-dom';

interface BlogReadAloudProps {
  content: string;
  title: string;
  postSlug: string;
}

const BlogReadAloud = ({ content, title, postSlug }: BlogReadAloudProps) => {
  const { language } = useLanguage();
  const location = useLocation();
  const { 
    isLoading, 
    isPlaying, 
    isPaused, 
    currentTime,
    duration,
    playbackRate,
    postSlug: activeSlug, 
    startTTS,
    play,
    pause,
    stop,
    restart,
    seek,
    setPlaybackRate,
  } = useTTSPlayer();

  // Check if this post is the active one
  const isThisPostActive = activeSlug === postSlug;
  const isThisPostPlaying = isThisPostActive && (isPlaying || isPaused);

  // Check if we're currently on this blog post's page
  const isOnThisPage = location.pathname === `/blog/${postSlug}`;

  const handlePlay = async () => {
    await startTTS(content, title, postSlug, language);
  };

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // If this post is playing AND we're on the same page, show full controls here
  if (isThisPostPlaying && isOnThisPage) {
    return (
      <div className="w-full flex flex-col gap-2 px-4 py-4 rounded-xl bg-primary/10 border border-primary/30">
        {/* Progress bar with time */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs font-mono text-muted-foreground min-w-[40px]">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            onValueChange={([value]) => seek(value)}
            max={duration || 100}
            step={0.1}
            className="flex-1"
          />
          <span className="text-xs font-mono text-muted-foreground min-w-[40px] text-right">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-1">
          {isPlaying ? (
            <>
              <div className="flex items-center gap-0.5 mr-1">
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
              <Button onClick={pause} variant="ghost" size="icon" className="h-8 w-8">
                <Pause className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button onClick={play} variant="ghost" size="icon" className="h-8 w-8">
              <Volume2 className="h-4 w-4" />
            </Button>
          )}
          
          <Button onClick={restart} variant="ghost" size="icon" className="h-8 w-8">
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button onClick={stop} variant="ghost" size="icon" className="h-8 w-8">
            <Square className="h-4 w-4" />
          </Button>

          {/* Speed control */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1">
                <Gauge className="h-3 w-3" />
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
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <Button
        onClick={handlePlay}
        variant="outline"
        className="w-full flex items-center justify-center gap-3 py-8 border-primary/40 hover:border-primary hover:bg-primary/5 bg-gradient-to-r from-primary/5 to-accent/5"
        disabled={isLoading && isThisPostActive}
      >
        {isLoading && isThisPostActive ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <div className="relative">
            <Volume2 className="h-6 w-6 text-primary" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>
        )}
        <div className="flex flex-col items-start gap-0.5">
          <span className="font-semibold text-base">
            {isLoading && isThisPostActive
              ? (language === 'ja' ? '音声生成中...' : 'Generating...') 
              : (language === 'ja' ? 'Yukiの声で読み上げる' : 'Read by Yuki')}
          </span>
          {!(isLoading && isThisPostActive) && (
            <span className="text-xs text-muted-foreground">
              {language === 'ja' ? 'AI音声で記事を朗読' : 'AI voice narration'}
            </span>
          )}
        </div>
      </Button>
    </div>
  );
};

export default BlogReadAloud;
