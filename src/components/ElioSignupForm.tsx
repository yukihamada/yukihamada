import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Mail, Check, Loader2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('有効なメールアドレスを入力してください');

interface ElioSignupFormProps {
  lang?: 'ja' | 'en';
}

export const ElioSignupForm = ({ lang = 'ja' }: ElioSignupFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      toast.error(lang === 'ja' ? '有効なメールアドレスを入力してください' : 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('elio_signups')
        .insert({ email: email.trim().toLowerCase() });
      
      if (error) {
        if (error.code === '23505') {
          toast.info(lang === 'ja' ? 'このメールアドレスは既に登録されています' : 'This email is already registered');
          setIsSuccess(true);
        } else {
          throw error;
        }
      } else {
        toast.success(lang === 'ja' ? '登録ありがとうございます！' : 'Thank you for signing up!');
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(lang === 'ja' ? 'エラーが発生しました。もう一度お試しください。' : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center gap-2 py-4 px-6 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400">
        <Check className="w-5 h-5" />
        <span className="font-medium">
          {lang === 'ja' ? '登録完了！リリース時にお知らせします。' : 'Registered! We\'ll notify you on release.'}
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="email"
          placeholder={lang === 'ja' ? 'メールアドレス' : 'Email address'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-10 h-12 bg-background/50 border-primary/20 focus:border-primary"
          required
        />
      </div>
      <Button 
        type="submit" 
        disabled={isLoading}
        className="h-12 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          lang === 'ja' ? '事前登録' : 'Sign Up'
        )}
      </Button>
    </form>
  );
};

export default ElioSignupForm;
