import { useParams, Link } from 'react-router-dom';
import { useEffect, useRef, useMemo, useState } from 'react';
import { ArrowLeft, Calendar, Tag, RefreshCw, Twitter, Clock, Lock } from 'lucide-react';
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
import OptimizedImage from '@/components/OptimizedImage';
import DOMPurify from 'dompurify';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChat } from '@/contexts/ChatContext';
import { calculateReadingTime, formatReadingTime } from '@/lib/readingTime';
import ShareCounts from '@/components/ShareCounts';
import TableOfContents from '@/components/TableOfContents';
import { useAuth } from '@/hooks/useAuth';
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
  'newt-chat-dm1': '/images/blog-newt-chat-dm1.png',
  'newt-chat-dm2': '/images/blog-newt-chat-dm2.png',
  'newt-chat-yuki': '/images/blog-newt-chat-yuki.png',
  'newt-chat-newt': '/images/blog-newt-chat-newt.png',
};

const trackMapping: Record<string, { index: number; titleJa: string; titleEn: string }> = {
  'free-to-change': { index: 0, titleJa: 'Free to Change', titleEn: 'Free to Change' },
  'hello-2150': { index: 1, titleJa: 'Hello 2150', titleEn: 'Hello 2150' },
  'everybody-say-bjj': { index: 2, titleJa: 'Everybody say 柔術', titleEn: 'Everybody say BJJ' },
  'everybody-bjj': { index: 2, titleJa: 'Everybody say 柔術', titleEn: 'Everybody say BJJ' },
  'i-love-you': { index: 3, titleJa: 'I Love You', titleEn: 'I Love You' },
  'attention': { index: 4, titleJa: 'I need your attention', titleEn: 'I need your attention' },
  'koi-jujutsu': { index: 5, titleJa: 'それ恋じゃなくて柔術', titleEn: "That's not love, it's Jiu-Jitsu" },
  'shio-to-pixel': { index: 6, titleJa: '塩とピクセル', titleEn: 'Salt and Pixels' },
  'musubinaosu': { index: 7, titleJa: '結び直す朝', titleEn: 'Morning to Reconnect' },
};

const playTrack = (trackIndex: number) => {
  window.dispatchEvent(new CustomEvent('playSpecificTrack', { detail: { trackIndex } }));
};

// Memoized content processing function
const processContent = (rawContent: string, lang: string): string => {
  let processed = rawContent
    .replace(/<h2([^>]*)>([^<]+)<\/h2>/g, (_, attrs, text) => {
      const hasId = attrs.includes('id=');
      const id = hasId ? '' : ` id="${text.trim().toLowerCase().replace(/[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '').replace(/\s+/g, '-').slice(0, 50)}"`;
      return `<h2${attrs}${id} class="text-2xl md:text-3xl font-bold mt-12 mb-6 text-foreground border-l-4 border-primary pl-4">${text}</h2>`;
    })
    .replace(/<h3([^>]*)>([^<]+)<\/h3>/g, (_, attrs, text) => {
      const hasId = attrs.includes('id=');
      const id = hasId ? '' : ` id="${text.trim().toLowerCase().replace(/[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '').replace(/\s+/g, '-').slice(0, 50)}"`;
      return `<h3${attrs}${id} class="text-xl md:text-2xl font-semibold mt-8 mb-4 text-foreground">${text}</h3>`;
    })
    .replace(/^## (.+)$/gm, (_, heading) => {
      const id = heading.replace(/\*\*/g, '').trim().toLowerCase().replace(/[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '').replace(/\s+/g, '-').slice(0, 50);
      return `<h2 id="${id}" class="text-2xl md:text-3xl font-bold mt-12 mb-6 text-foreground border-l-4 border-primary pl-4">${heading}</h2>`;
    })
    .replace(/^### (.+)$/gm, (_, heading) => {
      const id = heading.replace(/\*\*/g, '').trim().toLowerCase().replace(/[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '').replace(/\s+/g, '-').slice(0, 50);
      return `<h3 id="${id}" class="text-xl md:text-2xl font-semibold mt-8 mb-4 text-foreground">${heading}</h3>`;
    })
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      if (cells.every(c => c.trim().match(/^[-:]+$/))) return '';
      const cellsHtml = cells.map(c => `<td class="px-4 py-3 border border-border/30">${c.trim()}</td>`).join('');
      return `<tr class="even:bg-muted/30">${cellsHtml}</tr>`;
    })
    .replace(/(<tr.*?<\/tr>\s*)+/g, (match) => {
      return `<div class="overflow-x-auto my-8"><table class="w-full border-collapse rounded-xl overflow-hidden shadow-lg ring-1 ring-border/20"><tbody>${match}</tbody></table></div>`;
    })
    .replace(/<blockquote>([^<]+)<\/blockquote>/g, '<div class="blog-quote"><p>$1</p></div>')
    .replace(/^> (.+)$/gm, '<div class="blog-quote"><p>$1</p></div>')
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
    .replace(/\[image:([^\]]+)\]/g, (_, imageInfo) => {
      if (imageInfo.startsWith('/')) {
        const parts = imageInfo.split(':');
        const imagePath = parts[0];
        const caption = parts.slice(1).join(':') || '';
        return `<figure class="my-8"><img src="${imagePath}" alt="${caption}" loading="lazy" decoding="async" class="w-full rounded-xl shadow-lg ring-1 ring-border/20" />${caption ? `<figcaption class="text-center text-sm text-muted-foreground mt-3">${caption}</figcaption>` : ''}</figure>`;
      } else {
        const imageSrc = blogImages[imageInfo];
        return imageSrc ? `<div class="my-8 flex justify-center"><img src="${imageSrc}" alt="${imageInfo}" loading="lazy" decoding="async" class="w-full md:w-1/2 lg:w-2/5 rounded-xl shadow-lg ring-1 ring-border/20" /></div>` : '';
      }
    })
    .replace(/\[play:([a-zA-Z0-9_-]+)\]/g, (_, trackId) => {
      const track = trackMapping[trackId];
      const trackIndex = track?.index ?? 0;
      const trackTitle = lang === 'ja' ? track?.titleJa : track?.titleEn;
      return `<div class="my-12 flex justify-center"><button data-play-track="${trackIndex}" class="group relative inline-flex items-center gap-4 px-8 py-5 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 hover:from-primary/30 hover:via-primary/20 hover:to-primary/30 border border-primary/30 hover:border-primary/50 transition-all duration-500 shadow-lg hover:shadow-primary/20 hover:scale-[1.02] cursor-pointer"><span class="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span><div class="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors"><svg class="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div><div class="text-left"><span class="block text-xs text-muted-foreground mb-0.5">${lang === 'ja' ? '🎵 曲を再生' : '🎵 Play Track'}</span><span class="block text-lg font-semibold text-foreground group-hover:text-primary transition-colors">${trackTitle || 'Unknown Track'}</span></div></button></div>`;
    });

  return DOMPurify.sanitize(processed, {
    ADD_TAGS: ['figure', 'figcaption', 'iframe'],
    ADD_ATTR: ['data-play-track', 'style', 'allow', 'allowfullscreen', 'frameborder', 'loading', 'decoding'],
    // Allow same-origin relative URLs like /images/... in addition to https:// and data:
    ALLOWED_URI_REGEXP: /^(?:(?:https?|data):|\/)/i,
  });
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { post, isLoading, isScheduled } = useBlogPost(slug, true);
  const { isAdmin } = useBlogPosts(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const { setPageContext, setCurrentBlogTitle } = useChat();
  const { isAuthenticated } = useAuth();

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
    const handlers: Array<{ button: Element; handler: () => void }> = [];
    
    playButtons.forEach((button) => {
      const trackIndex = parseInt(button.getAttribute('data-play-track') || '0', 10);
      const handleClick = () => playTrack(trackIndex);
      button.addEventListener('click', handleClick);
      handlers.push({ button, handler: handleClick });
    });

    return () => {
      handlers.forEach(({ button, handler }) => {
        button.removeEventListener('click', handler);
      });
    };
  }, [post, language]);

  // Memoize processed content to avoid recalculation on every render
  const processedContent = useMemo(() => {
    if (!post) return '';
    let content = post[language].content;
    
    // Hide members-only content for non-authenticated users
    if (!isAuthenticated) {
      content = content.replace(
        /<div class="members-only-content"[^>]*>[\s\S]*?<\/div>/g,
        `<div class="members-only-placeholder glass rounded-2xl p-8 my-8 text-center border-2 border-dashed border-primary/30">
          <div class="flex flex-col items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-foreground">${language === 'ja' ? '🎁 会員限定コンテンツ' : '🎁 Members Only Content'}</h3>
            <p class="text-muted-foreground max-w-md">${language === 'ja' ? 'この続きは会員登録すると閲覧できます。無料で登録して、特別なコンテンツにアクセスしましょう！' : 'Register for free to unlock this exclusive content and access special features!'}</p>
            <a href="/auth" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
              ${language === 'ja' ? '無料で会員登録' : 'Register for Free'}
            </a>
          </div>
        </div>`
      );
    }
    
    return processContent(content, language);
  }, [post, language, isAuthenticated]);

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

  return (
    <div className="min-h-screen bg-background">
      <BlogOGP post={post} />
      <Navigation />
      
      <main className="pt-24 pb-20">
        <article className="container mx-auto px-6 max-w-4xl">
          <div>
            <Button variant="ghost" asChild className="mb-8 text-muted-foreground hover:text-foreground">
              <Link to="/#blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'ja' ? 'ブログに戻る' : 'Back to Blog'}
              </Link>
            </Button>
          </div>

          <header className="mb-12">
            {/* Category and Date */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {isScheduled && isAdmin && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-white text-sm font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  {language === 'ja' ? '予約投稿（管理者プレビュー）' : 'Scheduled (Admin Preview)'}
                </span>
              )}
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-sm font-medium">
                <Tag className="h-3.5 w-3.5" />
                {content.category}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <Calendar className="h-4 w-4" />
                {content.date}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <Clock className="h-4 w-4" />
                {formatReadingTime(calculateReadingTime(content.content, language), language)}
              </span>
              <BlogViewStats postSlug={post.slug} />
              <ShareCounts postSlug={post.slug} />
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
              {content.title}
            </h1>

            {/* Excerpt */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
              {content.excerpt}
            </p>

            {/* Author and Actions */}
            <div className="flex items-center justify-between gap-3 p-4 glass rounded-2xl mb-6">
              <div className="flex items-center gap-3 min-w-0">
                <OptimizedImage
                  src={yukiProfile}
                  alt="Yuki Hamada"
                  width={48}
                  height={48}
                  loading="eager"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-primary/30 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">Yuki Hamada</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {language === 'ja' ? '株式会社イネブラ' : 'Enebular Inc.'}
                  </p>
                </div>
              </div>
              <a
                href="https://x.com/yukihamada"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors text-xs font-medium flex-shrink-0 whitespace-nowrap"
              >
                <Twitter className="h-3.5 w-3.5" />
                <span>{language === 'ja' ? 'フォロー' : 'Follow'}</span>
              </a>
            </div>

            {/* Share Buttons */}
            <div className="mb-6">
              <ShareButtons title={content.title} url={window.location.href} />
            </div>

            {/* AI Summary and Read Aloud */}
            <BlogSummary 
              postSlug={post.slug}
              title={content.title}
              category={content.category}
              content={content.content}
            />

            {/* Table of Contents */}
            <TableOfContents content={content.content} />
          </header>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="glass rounded-3xl p-4 md:p-8 lg:p-12">
              <div 
                ref={contentRef}
                className="blog-content prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            </div>
          </div>

          {/* Bottom Share Buttons */}
          <div className="mt-12 pt-8 border-t border-border/30">
            <p className="text-center text-muted-foreground mb-4">
              {language === 'ja' ? 'この記事をシェアする' : 'Share this article'}
            </p>
            <ShareButtons title={content.title} url={window.location.href} />
          </div>

          {/* Like Button */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <LikeButton postSlug={post.slug} />
          </div>

          {/* AI Suggested Questions */}
          <BlogSuggestedQuestions 
            postSlug={post.slug}
            blogTitle={content.title}
            blogCategory={content.category}
            content={content.content}
          />

          {/* Comments Section */}
          <BlogComments blogSlug={post.slug} />

          {/* Back to Blog */}
          <div className="mt-12 text-center">
            <Button variant="outline" asChild>
              <Link to="/#blog">
                {language === 'ja' ? 'すべての記事を見る' : 'View All Posts'}
              </Link>
            </Button>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
