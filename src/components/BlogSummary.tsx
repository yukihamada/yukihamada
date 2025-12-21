import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    if (summary) {
      setIsExpanded(!isExpanded);
      return;
    }

    setIsLoading(true);
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
            content: content.substring(0, 3000), // Limit content length
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }

      const data = await response.json();
      setSummary({
        ja: data.summary_ja,
        en: data.summary_en,
      });
      setIsExpanded(true);
    } catch (err) {
      console.error('Error fetching summary:', err);
      setError(language === 'ja' ? '要約の取得に失敗しました' : 'Failed to fetch summary');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mb-8">
      <Button
        onClick={fetchSummary}
        variant="outline"
        className="w-full flex items-center justify-center gap-2 py-6 border-primary/30 hover:border-primary hover:bg-primary/5"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Sparkles className="h-5 w-5 text-primary" />
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

      <AnimatePresence>
        {isExpanded && summary && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-6 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {language === 'ja' ? 'AI要約' : 'AI Summary'}
                </span>
              </div>
              <p className="text-foreground leading-relaxed">
                {language === 'ja' ? summary.ja : summary.en}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-2 text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  );
};

export default BlogSummary;
