import { useState, useCallback } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import BlogReadAloud from './BlogReadAloud';

interface BlogSummaryProps {
  postSlug: string;
  title: string;
  category: string;
  content: string;
}

const BlogSummary = ({ postSlug, title, category, content }: BlogSummaryProps) => {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [summary, setSummary] = useState<{ ja: string; en: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async (forceRegenerate = false) => {
    if (summary && !forceRegenerate) {
      setIsExpanded(!isExpanded);
      return;
    }

    if (forceRegenerate) {
      setIsRegenerating(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/blog-ai`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            action: 'summarize',
            postSlug,
            title,
            category,
            content: content.substring(0, 3000),
            forceRegenerate,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to fetch summary');

      const data = await response.json();
      setSummary({ ja: data.summary_ja, en: data.summary_en });
      setIsExpanded(true);
      
      if (forceRegenerate) {
        toast.success(language === 'ja' ? '要約を再生成しました' : 'Summary regenerated');
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
      setError(language === 'ja' ? '要約の取得に失敗しました' : 'Failed to fetch summary');
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  }, [summary, isExpanded, postSlug, title, category, content, language]);

  return (
    <div className="w-full my-8">
      <div className="flex flex-col gap-4">
        {/* Read Aloud - Primary (Large) */}
        <BlogReadAloud content={content} title={title} postSlug={postSlug} />
        
        {/* AI Summary - Secondary (Smaller) */}
        <Button
          onClick={() => fetchSummary(false)}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 py-4 border-border/50 hover:border-primary/50 hover:bg-primary/5 text-sm"
          disabled={isLoading || isRegenerating}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 text-primary" />
          )}
          <span className="font-medium">
            {isLoading
              ? (language === 'ja' ? 'AIが要約中...' : 'AI is summarizing...')
              : summary
                ? (language === 'ja' ? 'AI要約を表示/非表示' : 'Toggle AI Summary')
                : (language === 'ja' ? 'AIで記事を要約する' : 'Summarize with AI')}
          </span>
          {summary && (
            isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isExpanded && summary && (
        <div className="mt-4 p-6 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {language === 'ja' ? 'AI要約' : 'AI Summary'}
              </span>
            </div>
            <Button
              onClick={() => fetchSummary(true)}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-1 text-xs">
                {language === 'ja' ? '再生成' : 'Regenerate'}
              </span>
            </Button>
          </div>
          <p className="text-foreground leading-relaxed">
            {language === 'ja' ? summary.ja : summary.en}
          </p>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  );
};

export default BlogSummary;
