import { motion } from 'framer-motion';
import { Mail, Bell, Lightbulb, TrendingUp, Calendar } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import NewsletterSignupForm from '@/components/NewsletterSignupForm';
import { useLanguage } from '@/contexts/LanguageContext';

const features = [
  {
    icon: Bell,
    titleJa: 'ブログ更新通知',
    titleEn: 'Blog Updates',
    descJa: '新しいブログ記事が公開されたらお知らせします',
    descEn: 'Get notified when new blog posts are published',
  },
  {
    icon: TrendingUp,
    titleJa: '投資・プロジェクト情報',
    titleEn: 'Investment & Projects',
    descJa: 'スタートアップ投資やプロジェクトの最新情報',
    descEn: 'Latest updates on startup investments and projects',
  },
  {
    icon: Lightbulb,
    titleJa: 'AI・テック最新情報',
    titleEn: 'AI & Tech News',
    descJa: 'AI、ブロックチェーン、テクノロジーのインサイト',
    descEn: 'Insights on AI, blockchain, and technology',
  },
  {
    icon: Calendar,
    titleJa: 'イベント情報',
    titleEn: 'Events',
    descJa: '講演やイベントのお知らせ',
    descEn: 'Announcements about talks and events',
  },
];

const Newsletter = () => {
  const { language } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{language === 'ja' ? 'ニュースレター | Yuki Hamada' : 'Newsletter | Yuki Hamada'}</title>
        <meta 
          name="description" 
          content={language === 'ja' 
            ? 'Yuki Hamadaのニュースレターに登録して、AI、テック、投資に関する最新情報を受け取りましょう' 
            : 'Subscribe to Yuki Hamada\'s newsletter for the latest updates on AI, tech, and investments'} 
        />
      </Helmet>

      <Navigation />
      
      <main className="min-h-screen pt-24">
        {/* Hero Section */}
        <section className="section-padding">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Mail className="w-4 h-4" />
                  Newsletter
                </motion.div>
                
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                  {language === 'ja' ? (
                    <>
                      最新情報を
                      <span className="gradient-text">お届け</span>
                    </>
                  ) : (
                    <>
                      Stay <span className="gradient-text">Updated</span>
                    </>
                  )}
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  {language === 'ja' 
                    ? 'AI、テクノロジー、スタートアップ投資に関する最新情報やインサイトをお届けします。月に数回、厳選したコンテンツをメールでお届けします。' 
                    : 'Get the latest insights on AI, technology, and startup investments. Receive curated content delivered to your inbox a few times a month.'}
                </p>
              </motion.div>

              {/* Signup Form Card */}
              <motion.div 
                className="glass-premium rounded-3xl p-8 md:p-12 max-w-xl mx-auto"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <NewsletterSignupForm variant="full" showInterests={true} />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <motion.h2 
              className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {language === 'ja' ? '配信内容' : 'What You\'ll Receive'}
            </motion.h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.titleEn}
                    className="glass-premium rounded-2xl p-6 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {language === 'ja' ? feature.titleJa : feature.titleEn}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ja' ? feature.descJa : feature.descEn}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Privacy Note */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <motion.div 
              className="max-w-2xl mx-auto text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {language === 'ja' ? 'プライバシーについて' : 'Privacy Promise'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'ja' 
                  ? 'メールアドレスは第三者に共有されることはありません。いつでも簡単に配信停止できます。スパムは一切送りません。' 
                  : 'Your email will never be shared with third parties. You can easily unsubscribe at any time. No spam, ever.'}
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Newsletter;
