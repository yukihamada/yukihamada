import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();

  const texts = {
    en: {
      login: 'Login',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      displayName: 'Display Name',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      loginButton: 'Sign In',
      signupButton: 'Create Account',
      back: 'Back to Home',
      loginSuccess: 'Welcome back!',
      signupSuccess: 'Account created successfully!',
      error: 'Error',
      invalidEmail: 'Please enter a valid email',
      shortPassword: 'Password must be at least 6 characters',
      userExists: 'An account with this email already exists',
    },
    ja: {
      login: 'ログイン',
      signup: '新規登録',
      email: 'メールアドレス',
      password: 'パスワード',
      displayName: '表示名',
      noAccount: 'アカウントをお持ちでない方',
      hasAccount: 'すでにアカウントをお持ちの方',
      loginButton: 'ログイン',
      signupButton: 'アカウント作成',
      back: 'ホームに戻る',
      loginSuccess: 'おかえりなさい！',
      signupSuccess: 'アカウントが作成されました！',
      error: 'エラー',
      invalidEmail: '有効なメールアドレスを入力してください',
      shortPassword: 'パスワードは6文字以上で入力してください',
      userExists: 'このメールアドレスは既に使用されています',
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

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({ title: t.error, description: t.invalidEmail, variant: 'destructive' });
      return false;
    }
    if (password.length < 6) {
      toast({ title: t.error, description: t.shortPassword, variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: t.loginSuccess });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: displayName || email.split('@')[0] },
          },
        });
        if (error) {
          if (error.message.includes('already registered')) {
            toast({ title: t.error, description: t.userExists, variant: 'destructive' });
            return;
          }
          throw error;
        }
        toast({ title: t.signupSuccess });
      }
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
              {isLogin ? t.login : t.signup}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t.displayName}
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-muted/50"
                  placeholder="Yuki"
                />
              </div>
            )}

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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                {t.password}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-muted/50"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isLogin ? (
                t.loginButton
              ) : (
                t.signupButton
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? t.noAccount : t.hasAccount}{' '}
              <span className="text-primary font-medium">
                {isLogin ? t.signup : t.login}
              </span>
            </button>
          </div>

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
