import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Square, Gauge, Music, Loader2, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTTSPlayer, getBgmTracks } from '@/contexts/TTSPlayerContext';
import { useLocation } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import yukiProfile from '@/assets/yuki-profile.jpg';

interface PodcastPlayerProps {
  content: string;
  title: string;
  postSlug: string;
  coverImage?: string;
}

const PodcastPlayer = ({ content, title, postSlug, coverImage }: PodcastPlayerProps) => {
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
    bgMusicEnabled,
    bgMusicTrackId,
    startTTS,
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

  const [analyzerData, setAnalyzerData] = useState<number[]>(new Array(16).fill(0));
  const animationRef = useRef<number | null>(null);

  // Check if this post is the active one
  const isThisPostActive = activeSlug === postSlug;
  const isThisPostPlaying = isThisPostActive && (isPlaying || isPaused);
  const isOnThisPage = location.pathname === `/blog/${postSlug}`;

  // Simulated visualizer animation when playing
  useEffect(() => {
    if (isPlaying && isThisPostActive) {
      const updateVisualizer = () => {
        const newData = Array.from({ length: 16 }, () => 
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
      setAnalyzerData(new Array(16).fill(0.1));
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isThisPostActive]);

  const handlePlay = async () => {
    await startTTS(content, title, postSlug, language);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const skipBack = () => {
    seek(Math.max(0, currentTime - 10));
  };

  const skipForward = () => {
    seek(Math.min(duration, currentTime + 10));
  };

  // If playing on this page, show full podcast player
  if (isThisPostPlaying && isOnThisPage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-background to-accent/10 border border-primary/30 p-4 md:p-6">
          {/* Animated background glow */}
          {isPlaying && (
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 50% 80%, hsl(var(--primary) / 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%)',
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
          )}

          <div className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Album art / Cover image */}
            <div className="relative shrink-0 mx-auto md:mx-0">
              <motion.div
                className="w-28 h-28 md:w-32 md:h-32 rounded-xl overflow-hidden shadow-2xl"
                animate={isPlaying ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <img 
                  src={coverImage || '/images/default-ogp.jpg'} 
                  alt={title}
                  className="w-full h-full object-cover"
                />
                {/* Visualizer overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-8 flex items-end justify-center gap-0.5 px-2 bg-gradient-to-t from-black/60 to-transparent">
                  {analyzerData.map((value, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-primary rounded-full"
                      animate={{ height: `${value * 24}px` }}
                      transition={{ duration: 0.1 }}
                    />
                  ))}
                </div>
              </motion.div>
              
              {/* Host avatar overlay */}
              <motion.div
                className="absolute -bottom-2 -right-2"
                animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Avatar className="h-10 w-10 border-2 border-background shadow-lg">
                  <AvatarImage src={yukiProfile} alt="Yuki" />
                  <AvatarFallback>Y</AvatarFallback>
                </Avatar>
              </motion.div>
            </div>

            {/* Player content */}
            <div className="flex-1 flex flex-col justify-center min-w-0">
              {/* NOW PLAYING badge */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  {isPlaying && (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          className="w-0.5 bg-primary rounded-full"
                          animate={{ 
                            height: ['4px', '12px', '4px'],
                          }}
                          transition={{ 
                            duration: 0.5,
                            delay: i * 0.1,
                            repeat: Infinity,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-primary uppercase tracking-wide">
                  {isPlaying 
                    ? (language === 'ja' ? '再生中' : 'Now Playing')
                    : (language === 'ja' ? '一時停止' : 'Paused')
                  }
                </span>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-base md:text-lg line-clamp-2 mb-1">
                {title}
              </h3>
              
              {/* Podcast branding */}
              <p className="text-sm text-muted-foreground mb-4">
                <Volume2 className="inline h-3.5 w-3.5 mr-1" />
                {language === 'ja' ? "Yuki's Blog Podcast" : "Yuki's Blog Podcast"}
              </p>

              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-4">
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Skip back */}
                  <Button onClick={skipBack} variant="ghost" size="icon" className="h-9 w-9">
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  {/* Play/Pause */}
                  {isPlaying ? (
                    <Button onClick={pause} variant="default" size="icon" className="h-12 w-12 rounded-full shadow-lg">
                      <Pause className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button onClick={play} variant="default" size="icon" className="h-12 w-12 rounded-full shadow-lg">
                      <Play className="h-5 w-5 ml-0.5" />
                    </Button>
                  )}

                  {/* Skip forward */}
                  <Button onClick={skipForward} variant="ghost" size="icon" className="h-9 w-9">
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  {/* Restart */}
                  <Button onClick={restart} variant="ghost" size="icon" className="h-8 w-8">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  
                  {/* Stop */}
                  <Button onClick={stop} variant="ghost" size="icon" className="h-8 w-8">
                    <Square className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {/* BGM Toggle */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant={bgMusicEnabled ? "secondary" : "ghost"} 
                        size="icon" 
                        className="h-8 w-8"
                        title={language === 'ja' ? 'BGM' : 'Background Music'}
                      >
                        <Music className={`h-4 w-4 ${bgMusicEnabled ? 'text-primary' : ''}`} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-3" align="end">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">
                          {language === 'ja' ? 'BGM' : 'Background Music'}
                        </span>
                        <Switch 
                          checked={bgMusicEnabled} 
                          onCheckedChange={toggleBgMusic}
                        />
                      </div>
                      
                      {bgMusicEnabled && (
                        <div className="space-y-2">
                          <span className="text-xs text-muted-foreground">
                            {language === 'ja' ? 'トラック選択' : 'Select Track'}
                          </span>
                          <Select value={bgMusicTrackId} onValueChange={setBgMusicTrack}>
                            <SelectTrigger className="w-full h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {bgmTracks.map((track) => (
                                <SelectItem key={track.id} value={track.id}>
                                  {track.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-3">
                        {language === 'ja' 
                          ? 'ナレーション中に環境音楽を流します' 
                          : 'Play ambient music during narration'
                        }
                      </p>
                    </PopoverContent>
                  </Popover>

                  {/* Speed control */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 px-2 text-xs gap-1">
                        <Gauge className="h-3 w-3" />
                        <span>{playbackRate}x</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-3" align="end">
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
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Initial state - Start button with podcast styling
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <button
        onClick={handlePlay}
        disabled={isLoading && isThisPostActive}
        className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-accent/5 border border-primary/30 hover:border-primary/50 transition-all duration-300 p-4 md:p-5 text-left"
      >
        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative z-10 flex items-center gap-4">
          {/* Podcast cover placeholder */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-primary/10 shadow-lg group-hover:shadow-xl transition-shadow">
              <img 
                src={coverImage || '/images/default-ogp.jpg'} 
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Host avatar */}
            <div className="absolute -bottom-1 -right-1">
              <Avatar className="h-7 w-7 border-2 border-background">
                <AvatarImage src={yukiProfile} alt="Yuki" />
                <AvatarFallback className="text-xs">Y</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isLoading && isThisPostActive ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate">
                  {isLoading && isThisPostActive
                    ? (language === 'ja' ? '音声生成中...' : 'Generating...')
                    : (language === 'ja' ? 'ポッドキャストで聴く' : 'Listen as Podcast')
                  }
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ja' ? "Yuki's Blog Podcast • AI音声" : "Yuki's Blog Podcast • AI Voice"}
                </p>
              </div>
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Play className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
};

export default PodcastPlayer;
