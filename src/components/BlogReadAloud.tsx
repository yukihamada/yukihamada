import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Pause, Loader2, Square, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BlogReadAloudProps {
  content: string;
  title: string;
  postSlug: string;
}

// Cache audio URLs by postSlug and language
const audioCache = new Map<string, string>();

const BlogReadAloud = ({ content, title, postSlug }: BlogReadAloudProps) => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentLanguageRef = useRef<string>(language);

  // Cache key includes both slug and language
  const getCacheKey = (lang: string) => `${postSlug}_${lang}`;

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

  // Clean content for TTS (remove markdown, html, etc.)
  const cleanContent = (text: string): string => {
    return text
      .replace(/^##+ .+$/gm, '') // Remove headings
      .replace(/\[.*?\]\(.*?\)/g, '') // Remove markdown links
      .replace(/\[.*?\]/g, '') // Remove bracket content
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/\|.+\|/g, '') // Remove table content
      .replace(/^[-*] /gm, '') // Remove list markers
      .replace(/^\d+\. /gm, '') // Remove numbered list markers
      .replace(/^> /gm, '') // Remove blockquote markers
      .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
      .trim();
  };

  const generateAudio = async () => {
    const cacheKey = getCacheKey(language);
    
    // Check cache first
    if (audioCache.has(cacheKey)) {
      const cachedUrl = audioCache.get(cacheKey)!;
      const audio = new Audio(cachedUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      audio.onerror = () => {
        // Cache may be stale, remove it and try again
        audioCache.delete(cacheKey);
        toast.error(language === 'ja' ? '再生エラーが発生しました。再試行してください。' : 'Playback error. Please try again.');
        setIsPlaying(false);
        setIsPaused(false);
      };

      await audio.play();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

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
          body: JSON.stringify({
            text: textToRead,
            language,
            postSlug,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Store in cache
      audioCache.set(cacheKey, audioUrl);
      
      const audio = new Audio(audioUrl);
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
  };

  const handlePlay = async () => {
    const cacheKey = getCacheKey(language);
    
    if (audioRef.current && audioCache.has(cacheKey)) {
      // Resume existing audio
      await audioRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
    } else {
      // Generate new audio (will use cache if available)
      await generateAudio();
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isPlaying && !isPaused && (
        <Button
          onClick={handlePlay}
          variant="outline"
          className="flex items-center gap-2 py-6 px-6 border-primary/30 hover:border-primary hover:bg-primary/5"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Volume2 className="h-4 w-4 text-primary" />
          )}
          <span className="text-sm font-medium">
            {isLoading 
              ? (language === 'ja' ? '音声生成中...' : 'Generating...') 
              : (language === 'ja' ? '記事を読み上げる' : 'Read Aloud')}
          </span>
        </Button>
      )}

      <AnimatePresence>
        {(isPlaying || isPaused) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-primary/10 border border-primary/30"
          >
            {isPlaying ? (
              <>
                <motion.div 
                  className="flex items-center gap-0.5"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-primary rounded-full"
                      animate={{ height: [8, 16, 8] }}
                      transition={{ 
                        duration: 0.5, 
                        repeat: Infinity, 
                        delay: i * 0.1 
                      }}
                    />
                  ))}
                </motion.div>
                <Button
                  onClick={handlePause}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Pause className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                onClick={handlePlay}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              onClick={handleRestart}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleStop}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <Square className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogReadAloud;
