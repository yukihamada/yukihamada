import { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, Pause, Loader2, Square, RotateCcw, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface BlogReadAloudProps {
  content: string;
  title: string;
  postSlug: string;
}

const BlogReadAloud = ({ content, title, postSlug }: BlogReadAloudProps) => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.2);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentLanguageRef = useRef<string>(language);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Clean up audio when language changes
  useEffect(() => {
    if (currentLanguageRef.current !== language && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentTime(0);
      setDuration(0);
    }
    currentLanguageRef.current = language;
  }, [language]);

  // Update playback rate when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Progress tracking
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 100);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Clean content for TTS
  const cleanContent = useCallback((text: string): string => {
    return text
      .replace(/^##+ .+$/gm, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/\|.+\|/g, '')
      .replace(/^[-*] /gm, '')
      .replace(/^\d+\. /gm, '')
      .replace(/^> /gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }, []);

  const generateAudio = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const textToRead = `${title}。${cleanContent(content)}`;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/blog-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: textToRead, language, postSlug }),
        }
      );

      if (!response.ok) throw new Error('Failed to generate audio');

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const audio = new Audio(data.audioUrl);
      audio.playbackRate = playbackRate;
      audioRef.current = audio;
      
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentTime(0);
      };

      audio.onerror = () => {
        toast.error(language === 'ja' ? '再生エラーが発生しました' : 'Playback error occurred');
        setIsPlaying(false);
        setIsPaused(false);
      };

      await audio.play();
      setIsPlaying(true);
      setIsPaused(false);
      
      if (data.cached) {
        toast.success(language === 'ja' ? 'キャッシュから読み込みました' : 'Loaded from cache');
      }
    } catch (err) {
      console.error('Error generating audio:', err);
      toast.error(language === 'ja' ? '音声生成に失敗しました' : 'Failed to generate audio');
    } finally {
      setIsLoading(false);
    }
  }, [title, content, language, postSlug, cleanContent, playbackRate]);

  const handlePlay = useCallback(async () => {
    if (audioRef.current && !audioRef.current.ended) {
      await audioRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
    } else {
      await generateAudio();
    }
  }, [generateAudio]);

  const handlePause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  }, []);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentTime(0);
    }
  }, []);

  const handleRestart = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentTime(0);
    }
  }, []);

  // Handle seek
  const handleSeek = useCallback((value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  }, []);

  return (
    <div className="flex flex-col gap-2 flex-1">
      {!isPlaying && !isPaused && (
        <Button
          onClick={handlePlay}
          variant="outline"
          className="flex-1 flex items-center justify-center gap-2 py-6 border-primary/30 hover:border-primary hover:bg-primary/5"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Volume2 className="h-5 w-5 text-primary" />
          )}
          <div className="flex flex-col items-start gap-0.5">
            <span className="font-medium">
              {isLoading 
                ? (language === 'ja' ? '音声生成中...' : 'Generating...') 
                : (language === 'ja' ? 'Yukiの声で読み上げる' : 'Read by Yuki')}
            </span>
            {!isLoading && (
              <span className="text-xs text-muted-foreground">
                {language === 'ja' ? 'AI音声で記事を朗読' : 'AI voice narration'}
              </span>
            )}
          </div>
        </Button>
      )}

      {(isPlaying || isPaused) && (
        <div className="flex-1 flex flex-col gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/30">
          {/* Progress bar with time */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs font-mono text-muted-foreground min-w-[40px]">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              onValueChange={handleSeek}
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
                <Button onClick={handlePause} variant="ghost" size="icon" className="h-8 w-8">
                  <Pause className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button onClick={handlePlay} variant="ghost" size="icon" className="h-8 w-8">
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
            
            <Button onClick={handleRestart} variant="ghost" size="icon" className="h-8 w-8">
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button onClick={handleStop} variant="ghost" size="icon" className="h-8 w-8">
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
      )}
    </div>
  );
};

export default BlogReadAloud;
