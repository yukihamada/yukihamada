import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, MessageCircle, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChat } from '@/contexts/ChatContext';

interface BlogPostCTAProps {
  relatedPosts?: Array<{
    slug: string;
    title: string;
    category: string;
  }>;
}

const BlogPostCTA = ({ relatedPosts = [] }: BlogPostCTAProps) => {
  const { language } = useLanguage();
  const { toggleChat } = useChat();

  return (
    <motion.div
      className="mt-16 pt-12 border-t border-border/50"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Newsletter CTA */}
      <div className="glass-premium rounded-2xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-foreground mb-2">
              {language === 'ja' ? 'ニュースレターに登録' : 'Subscribe to Newsletter'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {language === 'ja' 
                ? '新しい記事やAI・テクノロジーに関する情報をお届けします' 
                : 'Get notified about new posts and AI/tech insights'}
            </p>
          </div>
          
          <Button asChild className="gap-2 shrink-0">
            <Link to="/newsletter">
              {language === 'ja' ? '登録する' : 'Subscribe'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Ask AI */}
        <motion.button
          onClick={toggleChat}
          className="glass-premium rounded-xl p-5 text-left hover:bg-muted/50 transition-colors group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                {language === 'ja' ? 'AIに質問する' : 'Ask AI'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'ja' ? 'この記事について質問してみましょう' : 'Ask questions about this article'}
              </p>
            </div>
          </div>
        </motion.button>

        {/* More Articles */}
        <Link to="/#blog">
          <motion.div
            className="glass-premium rounded-xl p-5 text-left hover:bg-muted/50 transition-colors group h-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Newspaper className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  {language === 'ja' ? '他の記事を読む' : 'Read More Articles'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'ja' ? 'AI、柔術、ビジネスについてもっと探す' : 'Explore more on AI, BJJ, and business'}
                </p>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {language === 'ja' ? '関連記事' : 'Related Posts'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedPosts.slice(0, 2).map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="glass-premium rounded-xl p-4 hover:bg-muted/50 transition-colors group"
              >
                <span className="text-xs text-primary font-medium uppercase tracking-wide">
                  {post.category}
                </span>
                <h4 className="font-medium text-foreground mt-1 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BlogPostCTA;
