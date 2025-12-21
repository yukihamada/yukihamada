import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Use the audio URL from storage
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
      
      if (data.cached) {
        console.log('Playing cached audio');
      } else {
        console.log('Playing freshly generated audio (now cached)');
      }
      
    } catch (err) {
      console.error('Error generating audio:', err);
      toast.error(language === 'ja' ? '音声生成に失敗しました' : 'Failed to generate audio');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = async () => {
    if (audioRef.current && !audioRef.current.ended) {
      // Resume existing audio
      await audioRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
    } else {
      // Generate/fetch audio
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

      <AnimatePresence>
        {(isPlaying || isPaused) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-primary/10 border border-primary/30"
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
                <span className="text-sm font-medium text-primary">
                  {language === 'ja' ? '再生中...' : 'Playing...'}
                </span>
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
              <>
                <span className="text-sm font-medium text-muted-foreground">
                  {language === 'ja' ? '一時停止中' : 'Paused'}
                </span>
                <Button
                  onClick={handlePlay}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </>
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
