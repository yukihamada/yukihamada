import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();

  const texts = {
    en: {
      title: 'Login / Sign Up',
      subtitle: 'Enter your email to receive a magic link',
      email: 'Email',
      sendLink: 'Send Magic Link',
      back: 'Back to Home',
      emailSentTitle: 'Check your email!',
      emailSentDesc: 'We sent a magic link to',
      clickLink: 'Click the link in the email to sign in.',
      tryAgain: 'Try another email',
      error: 'Error',
      invalidEmail: 'Please enter a valid email',
      success: 'Magic link sent!',
      successDesc: 'Check your inbox for the login link',
    },
    ja: {
      title: 'ログイン / 新規登録',
      subtitle: 'メールアドレスを入力してマジックリンクを受け取る',
      email: 'メールアドレス',
      sendLink: 'マジックリンクを送信',
      back: 'ホームに戻る',
      emailSentTitle: 'メールを確認してください！',
      emailSentDesc: 'マジックリンクを送信しました：',
      clickLink: 'メール内のリンクをクリックしてログインしてください。',
      tryAgain: '別のメールアドレスを試す',
      error: 'エラー',
      invalidEmail: '有効なメールアドレスを入力してください',
      success: 'マジックリンクを送信しました！',
      successDesc: '受信トレイでログインリンクを確認してください',
    },
  };

  const t = texts[language];

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({ title: t.error, description: t.invalidEmail, variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) throw error;
      
      setEmailSent(true);
      toast({ 
        title: t.success, 
        description: t.successDesc 
      });
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : 'Authentication failed',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-8 h-8 text-primary" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t.emailSentTitle}
            </h1>
            <p className="text-muted-foreground mb-2">
              {t.emailSentDesc}
            </p>
            <p className="text-foreground font-medium mb-4">
              {email}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {t.clickLink}
            </p>
            
            <Button
              variant="outline"
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
              className="w-full"
            >
              {t.tryAgain}
            </Button>
            
            <div className="mt-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="w-full text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.back}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t.email}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-muted/50"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  {t.sendLink}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="w-full text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.back}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
