import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChat } from '@/contexts/ChatContext';
import { toast } from 'sonner';

interface BlogSuggestedQuestionsProps {
  blogTitle: string;
  blogCategory: string;
  postSlug: string;
  content: string;
}

const BlogSuggestedQuestions = ({ blogTitle, blogCategory, postSlug, content }: BlogSuggestedQuestionsProps) => {
  const { language } = useLanguage();
  const { openChat, setPendingMessage } = useChat();
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const getStaticQuestions = useCallback(() => {
    return language === 'ja' ? [
      `この記事の内容をもっと詳しく教えて`,
      `${blogTitle}について質問があります`,
      `関連するおすすめの記事はありますか？`,
      `この内容を実践するにはどうすればいい？`,
    ] : [
      `Can you explain more about this article?`,
      `I have a question about "${blogTitle}"`,
      `Are there any related articles you recommend?`,
      `How can I apply this in practice?`,
    ];
  }, [blogTitle, language]);

  const fetchQuestions = useCallback(async (forceRegenerate = false) => {
    if (forceRegenerate) {
      setIsRegenerating(true);
    } else {
      setIsLoading(true);
    }

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
            action: 'questions',
            postSlug,
            title: blogTitle,
            category: blogCategory,
            content: content.substring(0, 3000),
            forceRegenerate,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      const fetchedQuestions = language === 'ja' ? data.questions_ja : data.questions_en;
      setQuestions(Array.isArray(fetchedQuestions) ? fetchedQuestions : []);

      if (forceRegenerate) {
        toast.success(language === 'ja' ? '質問を再生成しました' : 'Questions regenerated');
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setQuestions(getStaticQuestions());
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  }, [postSlug, blogTitle, blogCategory, content, language, getStaticQuestions]);

  useEffect(() => {
    fetchQuestions(false);
  }, [fetchQuestions]);

  const handleQuestionClick = (question: string) => {
    setPendingMessage(question);
    openChat();
  };

  const displayQuestions = questions.length > 0 ? questions : getStaticQuestions();

  return (
    <motion.div
      className="w-full mt-12 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 border border-primary/20"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            {language === 'ja' ? 'AIに質問する' : 'Ask AI'}
          </div>
          <Button
            onClick={() => fetchQuestions(true)}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            disabled={isRegenerating || isLoading}
          >
            {isRegenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
          {language === 'ja' 
            ? 'この記事について質問がありますか？' 
            : 'Have questions about this article?'}
        </h3>
        <p className="text-muted-foreground text-sm">
          {language === 'ja' 
            ? '以下の質問をクリックするか、自由に質問してください' 
            : 'Click a question below or ask anything'}
        </p>
      </div>

      <div className="grid gap-3 mb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              {language === 'ja' ? '質問を生成中...' : 'Generating questions...'}
            </span>
          </div>
        ) : (
          displayQuestions.map((question, index) => (
            <motion.button
              key={index}
              onClick={() => handleQuestionClick(question)}
              className="w-full text-left p-4 rounded-xl bg-background/50 hover:bg-background border border-border/50 hover:border-primary/30 transition-all group"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
                <span className="text-foreground group-hover:text-primary transition-colors">
                  {question}
                </span>
              </div>
            </motion.button>
          ))
        )}
      </div>

      <div className="text-center">
        <Button 
          onClick={openChat}
          size="lg"
          className="gradient-bg text-primary-foreground hover:opacity-90"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          {language === 'ja' ? '自由に質問する' : 'Ask Anything'}
        </Button>
      </div>
    </motion.div>
  );
};

export default BlogSuggestedQuestions;
