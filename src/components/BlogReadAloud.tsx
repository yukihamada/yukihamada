import { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, Pause, Loader2, Square, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentLanguageRef = useRef<string>(language);

  // Clean up audio when language changes
  useEffect(() => {
    if (currentLanguageRef.current !== language && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setIsPaused(false);
    }
    currentLanguageRef.current = language;
  }, [language]);

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
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      audio.onerror = () => {
        toast.error(language === 'ja' ? '再生エラーが発生しました' : 'Playback error occurred');
        setIsPlaying(false);
        setIsPaused(false);
      };

      await audio.play();
      setIsPlaying(true);
      setIsPaused(false);
    } catch (err) {
      console.error('Error generating audio:', err);
      toast.error(language === 'ja' ? '音声生成に失敗しました' : 'Failed to generate audio');
    } finally {
      setIsLoading(false);
    }
  }, [title, content, language, postSlug, cleanContent]);

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
    }
  }, []);

  const handleRestart = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
    }
  }, []);

  return (
    <div className="flex items-center gap-2 flex-1">
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
          <span className="font-medium">
            {isLoading 
              ? (language === 'ja' ? '音声生成中...' : 'Generating...') 
              : (language === 'ja' ? '記事を読み上げる' : 'Read Aloud')}
          </span>
        </Button>
      )}

      {(isPlaying || isPaused) && (
        <div className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-primary/10 border border-primary/30">
          {isPlaying ? (
            <>
              <div className="flex items-center gap-0.5">
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
              <span className="text-sm font-medium text-primary">
                {language === 'ja' ? '再生中...' : 'Playing...'}
              </span>
              <Button onClick={handlePause} variant="ghost" size="icon" className="h-8 w-8">
                <Pause className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm font-medium text-muted-foreground">
                {language === 'ja' ? '一時停止中' : 'Paused'}
              </span>
              <Button onClick={handlePlay} variant="ghost" size="icon" className="h-8 w-8">
                <Volume2 className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <Button onClick={handleRestart} variant="ghost" size="icon" className="h-8 w-8">
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button onClick={handleStop} variant="ghost" size="icon" className="h-8 w-8">
            <Square className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlogReadAloud;
