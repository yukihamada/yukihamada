import { useParams, Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBlogPost, useBlogPosts } from '@/hooks/useBlogPosts';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LikeButton from '@/components/LikeButton';
import BlogViewStats from '@/components/BlogViewStats';
import BlogOGP from '@/components/BlogOGP';
import ShareButtons from '@/components/ShareButtons';
import { BlogComments } from '@/components/BlogComments';
import BlogSuggestedQuestions from '@/components/BlogSuggestedQuestions';
import BlogSummary from '@/components/BlogSummary';
import DOMPurify from 'dompurify';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChat } from '@/contexts/ChatContext';
import jiuflowHero from '@/assets/jiuflow-hero.png';
import jiuflowLesson from '@/assets/jiuflow-lesson.png';
import yukiProfile from '@/assets/yuki-profile.jpg';

const blogImages: Record<string, string> = {
  'jiuflow-hero': jiuflowHero,
  'jiuflow-lesson': jiuflowLesson,
  'cost-collapse-timeline': '/images/blog-cost-collapse-timeline.jpg',
  'bjj-medal': '/images/blog-bjj-medal.jpg',
  'bjj-match': '/images/blog-bjj-match.jpg',
  'bjj-group1': '/images/blog-bjj-group1.jpg',
  'bjj-victory': '/images/blog-bjj-victory.jpg',
  'sinic-diagram': '/images/sinic-theory-diagram.svg',
  'ai-jobs-transition': '/images/blog-ai-jobs-transition.jpg',
  'ai-jobs-bjj': '/images/blog-ai-jobs-bjj.jpg',
  'ai-jobs-crossroads': '/images/blog-ai-jobs-crossroads.jpg',
};

const trackMapping: Record<string, number> = {
  'shio-to-pixel': 6,
  'free-to-change': 0,
  'hello-2150': 1,
  'everybody-bjj': 2,
  'i-love-you': 3,
  'attention': 4,
  'koi-jujutsu': 5,
  'musubinaosu': 7,
};

const playTrack = (trackIndex: number) => {
  window.dispatchEvent(new CustomEvent('playSpecificTrack', { detail: { trackIndex } }));
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { post, isLoading } = useBlogPost(slug);
  const { posts: allPosts } = useBlogPosts();
  const contentRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const { setPageContext, setCurrentBlogTitle } = useChat();

  useEffect(() => {
    setPageContext('blog-post');
    if (post) {
      setCurrentBlogTitle(post[language].title);
    }
    return () => {
      setPageContext('home');
      setCurrentBlogTitle(undefined);
    };
  }, [post, language, setPageContext, setCurrentBlogTitle]);

  useEffect(() => {
    if (!contentRef.current) return;
    
    const playButtons = contentRef.current.querySelectorAll('[data-play-track]');
    playButtons.forEach((button) => {
      const trackIndex = parseInt(button.getAttribute('data-play-track') || '0', 10);
      const handleClick = () => playTrack(trackIndex);
      button.addEventListener('click', handleClick);
      (button as any)._playHandler = handleClick;
    });

    return () => {
      playButtons.forEach((button) => {
        const handler = (button as any)._playHandler;
        if (handler) {
          button.removeEventListener('click', handler);
        }
      });
    };
  }, [post, language]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {language === 'ja' ? '記事が見つかりません' : 'Article Not Found'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {language === 'ja' 
              ? 'お探しのブログ記事は存在しないか、削除された可能性があります。' 
              : 'The blog post you are looking for does not exist or may have been deleted.'}
          </p>
          <Button asChild>
            <Link to="/#blog">{language === 'ja' ? 'ブログ一覧に戻る' : 'Back to Blog'}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const content = post[language];

  const relatedPosts = allPosts
    .filter(p => p[language].category === content.category && p.slug !== post.slug)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <BlogOGP post={post} />
      <Navigation />
      
      <main className="pt-24 pb-20">
        <article className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="ghost" asChild className="mb-8 text-muted-foreground hover:text-foreground">
              <Link to="/#blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'ja' ? 'ブログに戻る' : 'Back to Blog'}
              </Link>
            </Button>
          </motion.div>

          <motion.header
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Author section */}
            <div className="flex items-center gap-4 mb-6 p-4 glass rounded-2xl">
              <img 
                src={yukiProfile} 
                alt="Yuki Nagao" 
                className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/30"
              />
              <div>
                <p className="font-semibold text-foreground">Yuki Nagao</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ja' ? 'AIイネーブラー・柔術家・シンガーソングライター' : 'AI Enabler・BJJ Practitioner・Singer-Songwriter'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                <Tag className="h-3 w-3" />
                {content.category}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground text-sm">
                <Calendar className="h-4 w-4" />
                {content.date}
              </span>
            </div>

            <div className="mb-6">
              <BlogViewStats postSlug={post.slug} />
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
              {content.title}
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed mb-6">
              {content.excerpt}
            </p>

            <ShareButtons title={content.title} url={window.location.href} />

            <BlogSummary 
              postSlug={post.slug}
              title={content.title}
              category={content.category}
              content={content.content}
            />
          </motion.header>

          <motion.div
            className="prose prose-lg dark:prose-invert max-w-none"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass rounded-3xl p-4 md:p-8 lg:p-12">
              <div 
                ref={contentRef}
                className="blog-content prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(
                    content.content
                      .replace(/^## (.+)$/gm, '<h2 class="text-2xl md:text-3xl font-bold mt-12 mb-6 text-foreground border-l-4 border-primary pl-4">$1</h2>')
                      .replace(/^### (.+)$/gm, '<h3 class="text-xl md:text-2xl font-semibold mt-8 mb-4 text-foreground">$1</h3>')
                      .replace(/\|(.+)\|/g, (match) => {
                        const cells = match.split('|').filter(c => c.trim());
                        if (cells.every(c => c.trim().match(/^[-:]+$/))) {
                          return '';
                        }
                        const cellsHtml = cells.map(c => `<td class="px-4 py-3 border border-border/30">${c.trim()}</td>`).join('');
                        return `<tr class="even:bg-muted/30">${cellsHtml}</tr>`;
                      })
                      .replace(/(<tr.*?<\/tr>\s*)+/g, (match) => {
                        return `<div class="overflow-x-auto my-8"><table class="w-full border-collapse rounded-xl overflow-hidden shadow-lg ring-1 ring-border/20"><tbody>${match}</tbody></table></div>`;
                      })
                      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/50 pl-6 py-4 my-8 bg-primary/5 rounded-r-xl italic text-muted-foreground text-lg">$1</blockquote>')
                      .replace(/^---$/gm, '<hr class="my-12 border-t border-border/30" />')
                      .replace(/^(\d+)\. (.+)$/gm, '<li class="flex items-start gap-3 mb-3"><span class="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center mt-0.5">$1</span><span class="text-muted-foreground leading-relaxed">$2</span></li>')
                      .replace(/^- (.+)$/gm, '<li class="flex items-start gap-3 mb-3"><span class="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2.5"></span><span class="text-muted-foreground leading-relaxed">$1</span></li>')
                      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80 underline underline-offset-4 decoration-primary/50 hover:decoration-primary transition-all font-medium">$1</a>')
                      .replace(/^(⚠️|👉|🎉) (.+)$/gm, (_, emoji, text) => {
                        const bgColor = emoji === '⚠️' ? 'bg-amber-500/10 border-amber-500/30' : emoji === '🎉' ? 'bg-green-500/10 border-green-500/30' : 'bg-primary/10 border-primary/30';
                        return `<div class="flex items-start gap-3 p-4 my-4 rounded-xl ${bgColor} border"><span class="text-2xl">${emoji}</span><span class="text-foreground leading-relaxed">${text}</span></div>`;
                      })
                      .replace(/\[youtube:([a-zA-Z0-9_-]+)\]/g, '<div class="my-10 aspect-video rounded-2xl overflow-hidden shadow-xl ring-1 ring-border/20"><iframe class="w-full h-full" src="https://www.youtube.com/embed/$1" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>')
                      .replace(/\[image:([a-zA-Z0-9_-]+)\]/g, (_, imageKey) => {
                        const imageSrc = blogImages[imageKey];
                        return imageSrc 
                          ? `<div class="my-8 flex justify-center"><img src="${imageSrc}" alt="${imageKey}" loading="lazy" decoding="async" class="w-full md:w-1/2 lg:w-2/5 rounded-xl shadow-lg ring-1 ring-border/20" /></div>`
                          : '';
                      })
                      .replace(/\[play:([a-zA-Z0-9_-]+)\]/g, (_, trackId) => {
                        const trackIndex = trackMapping[trackId] ?? 0;
                        const buttonText = language === 'ja' ? '🎵 塩とピクセル を再生' : '🎵 Play Salt and Pixels';
                        return `<div class="my-10 flex justify-center"><button data-play-track="${trackIndex}" class="group flex items-center gap-4 px-8 py-5 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"><span class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></span><span>${buttonText}</span></button></div>`;
                      })
                      .replace(/\n\n/g, '</p><p class="mb-6 text-muted-foreground leading-relaxed text-lg">'),
                    { ADD_ATTR: ['target', 'rel', 'allowfullscreen', 'allow', 'frameborder', 'data-play-track'], ADD_TAGS: ['iframe'] }
                  )
                }}
              />
            </div>

            <div className="flex flex-col items-center gap-6 mt-8">
              <LikeButton postSlug={post.slug} />
              <ShareButtons title={content.title} url={window.location.href} />
              
              <BlogSuggestedQuestions 
                blogTitle={content.title} 
                blogCategory={content.category}
                postSlug={post.slug}
                content={content.content}
              />

              <BlogComments blogSlug={post.slug} />
            </div>
          </motion.div>

          {relatedPosts.length > 0 && (
            <motion.section
              className="mt-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-8">
                {language === 'ja' ? '関連記事' : 'Related Posts'}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost) => {
                  const relatedContent = relatedPost[language];
                  return (
                    <Link
                      key={relatedPost.slug}
                      to={`/blog/${relatedPost.slug}`}
                      className="group glass rounded-2xl p-6 hover:scale-[1.02] transition-transform"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-primary text-xs font-medium">{relatedContent.category}</span>
                        <span className="text-muted-foreground text-xs">{relatedContent.date}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {relatedContent.title}
                      </h3>
                    </Link>
                  );
                })}
              </div>
            </motion.section>
          )}

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button variant="outline" asChild>
              <Link to="/#blog">
                {language === 'ja' ? 'すべての記事を見る' : 'View All Posts'}
              </Link>
            </Button>
          </motion.div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
