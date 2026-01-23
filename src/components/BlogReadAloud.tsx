import { Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTTSPlayer } from '@/contexts/TTSPlayerContext';

interface BlogReadAloudProps {
  content: string;
  title: string;
  postSlug: string;
}

const BlogReadAloud = ({ content, title, postSlug }: BlogReadAloudProps) => {
  const { language } = useLanguage();
  const { isLoading, isPlaying, isPaused, postSlug: activeSlug, startTTS } = useTTSPlayer();

  // Check if this post is the active one
  const isThisPostActive = activeSlug === postSlug;
  const isThisPostPlaying = isThisPostActive && (isPlaying || isPaused);

  const handlePlay = async () => {
    await startTTS(content, title, postSlug, language);
  };

  // If this post is already playing, show minimal state
  if (isThisPostPlaying) {
    return (
      <div className="w-full flex items-center justify-center gap-3 py-6 px-4 rounded-xl bg-primary/10 border border-primary/30">
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
          {isPlaying 
            ? (language === 'ja' ? '再生中...' : 'Playing...') 
            : (language === 'ja' ? '一時停止中' : 'Paused')}
        </span>
        <span className="text-xs text-muted-foreground">
          {language === 'ja' ? '下のプレーヤーで操作' : 'Use player below'}
        </span>
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
