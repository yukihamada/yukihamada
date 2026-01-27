import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface NewsletterSignupFormProps {
  variant?: 'full' | 'compact';
  showInterests?: boolean;
}

const interestOptions = [
  { id: 'blog', labelJa: 'ブログ更新通知', labelEn: 'Blog Updates' },
  { id: 'investments', labelJa: '投資・プロジェクト情報', labelEn: 'Investments & Projects' },
  { id: 'tech', labelJa: 'AI・テック最新情報', labelEn: 'AI & Tech News' },
  { id: 'events', labelJa: 'イベント情報', labelEn: 'Events' },
];

const NewsletterSignupForm = ({ 
  variant = 'full', 
  showInterests = true 
}: NewsletterSignupFormProps) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  const handleInterestChange = (interestId: string, checked: boolean) => {
    if (checked) {
      setInterests([...interests, interestId]);
    } else {
      setInterests(interests.filter(id => id !== interestId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: language === 'ja' ? 'エラー' : 'Error',
        description: language === 'ja' ? 'メールアドレスを入力してください' : 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert({
          email: email.trim().toLowerCase(),
          name: name.trim() || null,
          interests: interests.length > 0 ? interests : null,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: language === 'ja' ? '登録済み' : 'Already Subscribed',
            description: language === 'ja' 
              ? 'このメールアドレスは既に登録されています' 
              : 'This email is already subscribed',
          });
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        toast({
          title: language === 'ja' ? '登録完了！' : 'Subscribed!',
          description: language === 'ja' 
            ? 'ニュースレターへの登録が完了しました' 
            : 'You have successfully subscribed to the newsletter',
        });
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      toast({
        title: language === 'ja' ? 'エラー' : 'Error',
        description: language === 'ja' 
          ? '登録に失敗しました。もう一度お試しください' 
          : 'Failed to subscribe. Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        className="text-center py-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div 
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <Check className="w-8 h-8 text-primary" />
        </motion.div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          {language === 'ja' ? '登録ありがとうございます！' : 'Thank you for subscribing!'}
        </h3>
        <p className="text-muted-foreground">
          {language === 'ja' 
            ? '最新情報をお届けします' 
            : 'You will receive the latest updates'}
        </p>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder={language === 'ja' ? 'メールアドレス' : 'Email address'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading} className="gradient-bg">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-foreground">
            {language === 'ja' ? 'メールアドレス' : 'Email'} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={language === 'ja' ? 'your@email.com' : 'your@email.com'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
            disabled={isLoading}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="name" className="text-foreground">
            {language === 'ja' ? 'お名前（任意）' : 'Name (optional)'}
          </Label>
          <Input
            id="name"
            type="text"
            placeholder={language === 'ja' ? '山田 太郎' : 'John Doe'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
            disabled={isLoading}
          />
        </div>
      </div>

      {showInterests && (
        <div className="space-y-3">
          <Label className="text-foreground">
            {language === 'ja' ? '興味のあるカテゴリ（任意）' : 'Interests (optional)'}
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {interestOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={interests.includes(option.id)}
                  onCheckedChange={(checked) => handleInterestChange(option.id, checked as boolean)}
                  disabled={isLoading}
                />
                <Label 
                  htmlFor={option.id} 
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {language === 'ja' ? option.labelJa : option.labelEn}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full gradient-bg text-primary-foreground glow-primary"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {language === 'ja' ? '登録中...' : 'Subscribing...'}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            {language === 'ja' ? 'ニュースレターに登録' : 'Subscribe to Newsletter'}
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        {language === 'ja' 
          ? '登録することで、メール配信に同意したものとみなされます。いつでも配信停止できます。' 
          : 'By subscribing, you agree to receive email updates. You can unsubscribe at any time.'}
      </p>
    </form>
  );
};

export default NewsletterSignupForm;
