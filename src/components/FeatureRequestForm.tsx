import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface FeatureRequestFormProps {
  blogSlug?: string;
}

const FeatureRequestForm = ({ blogSlug }: FeatureRequestFormProps) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { language } = useLanguage();

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      const visitorId = localStorage.getItem('visitor_id') || crypto.randomUUID();
      localStorage.setItem('visitor_id', visitorId);

      const { error } = await supabase.from('feature_requests' as any).insert({
        content: content.trim(),
        source: 'blog',
        blog_slug: blogSlug || null,
        visitor_id: visitorId,
      } as any);

      if (error) throw error;
      setIsSubmitted(true);
      setContent('');
      toast.success(language === 'ja' ? '送信しました！ありがとう 🙏' : 'Submitted! Thank you 🙏');
    } catch (err) {
      console.error('Feature request error:', err);
      toast.error(language === 'ja' ? '送信に失敗しました' : 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="my-8 p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center">
        <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" />
        <p className="text-lg font-semibold text-foreground">
          {language === 'ja' ? 'ありがとうございます！' : 'Thank you!'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {language === 'ja' ? 'リクエストを受け取りました。AIが検討します。' : 'Your request has been received. AI will review it.'}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3"
          onClick={() => setIsSubmitted(false)}
        >
          {language === 'ja' ? 'もう一つ送る' : 'Submit another'}
        </Button>
      </div>
    );
  }

  return (
    <div className="my-8 p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-background to-primary/5 border border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <span className="text-sm font-bold text-primary uppercase tracking-wide">
          {language === 'ja' ? '機能リクエスト' : 'Feature Request'}
        </span>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={language === 'ja' ? 'こんな機能があったらいいな…' : 'I wish this had...'}
        className="min-h-[80px] bg-background/50 border-border/50 resize-none mb-3"
        maxLength={1000}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{content.length}/1000</span>
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          size="sm"
          className="gap-2"
        >
          <Send className="w-4 h-4" />
          {language === 'ja' ? '送信' : 'Submit'}
        </Button>
      </div>
    </div>
  );
};

export default FeatureRequestForm;
