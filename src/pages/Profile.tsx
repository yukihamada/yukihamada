import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { User, Save, Loader2, ArrowLeft, LogOut } from 'lucide-react';

const Profile = () => {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { user, profile, isAuthenticated, isLoading: authLoading, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const texts = {
    en: {
      title: 'Profile Settings',
      displayName: 'Display Name',
      bio: 'Bio',
      avatarUrl: 'Avatar URL',
      save: 'Save Changes',
      saving: 'Saving...',
      logout: 'Logout',
      back: 'Back',
      success: 'Profile updated successfully!',
      error: 'Failed to update profile',
      loginRequired: 'Please login to view your profile',
    },
    ja: {
      title: 'プロフィール設定',
      displayName: '表示名',
      bio: '自己紹介',
      avatarUrl: 'アバターURL',
      save: '変更を保存',
      saving: '保存中...',
      logout: 'ログアウト',
      back: '戻る',
      success: 'プロフィールを更新しました！',
      error: 'プロフィールの更新に失敗しました',
      loginRequired: 'プロフィールを見るにはログインしてください',
    },
  };

  const t = texts[language];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: t.error, variant: 'destructive' });
    } else {
      toast({ title: t.success });
      refreshProfile();
    }
    setIsSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.back}
            </Button>

            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName">{t.displayName}</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Yuki"
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">{t.avatarUrl}</Label>
                  <Input
                    id="avatarUrl"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">{t.bio}</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={language === 'ja' ? '自己紹介を書いてください...' : 'Tell us about yourself...'}
                    className="bg-muted/50 min-h-[120px] resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t.saving}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {t.save}
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleLogout} className="text-destructive hover:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t.logout}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
