import { useParams, Link } from 'react-router-dom';
import { useEffect, useRef, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Calendar, Tag, RefreshCw, Twitter, Clock, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBlogPost, useBlogPosts } from '@/hooks/useBlogPosts';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LikeButton from '@/components/LikeButton';
import BlogViewStats from '@/components/BlogViewStats';
import SEO from '@/components/SEO';
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
import CuteLoader from '@/components/CuteLoader';
import { useAuth } from '@/hooks/useAuth';
import jiuflowHero from '@/assets/jiuflow-hero.png';
import jiuflowLesson from '@/assets/jiuflow-lesson.png';
import yukiProfile from '@/assets/yuki-profile.jpg';
import ElioSignupForm from '@/components/ElioSignupForm';
import { AnimatePresence } from 'framer-motion';

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
  'newt-chat-logo': '/images/newt-chat-logo.png',
};

const trackMapping: Record<string, { titleJa: string; titleEn: string; artwork: string }> = {
  'free-to-change': { titleJa: 'Free to Change', titleEn: 'Free to Change', artwork: 'album-free-to-change.jpg' },
  'hello-2150': { titleJa: 'Hello 2150', titleEn: 'Hello 2150', artwork: 'album-hello-2150.jpg' },
  'everybody-say-bjj': { titleJa: 'Everybody say 柔術', titleEn: 'Everybody say BJJ', artwork: 'album-everybody-bjj.jpg' },
  'everybody-bjj': { titleJa: 'Everybody say 柔術', titleEn: 'Everybody say BJJ', artwork: 'album-everybody-bjj.jpg' },
  'i-love-you': { titleJa: 'I Love You', titleEn: 'I Love You', artwork: 'album-i-love-you.jpg' },
  'attention': { titleJa: 'I need your attention', titleEn: 'I need your attention', artwork: 'album-attention.jpg' },
  'koi-jujutsu': { titleJa: 'それ恋じゃなくて柔術', titleEn: "That's not love, it's Jiu-Jitsu", artwork: 'album-koi-jujutsu.jpg' },
  'shio-to-pixel': { titleJa: '塩とピクセル', titleEn: 'Salt and Pixels', artwork: 'album-shio-pixel.jpg' },
  'musubinaosu': { titleJa: '結び直す朝', titleEn: 'Morning to Reconnect', artwork: 'album-musubinaosu.jpg' },
  'attention-please': { titleJa: 'アテンションください', titleEn: 'Attention Please', artwork: 'album-attention-please.jpg' },
};

const playTrackById = (trackId: string) => {
  window.dispatchEvent(new CustomEvent('playTrackById', { detail: { trackId } }));
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
    // YouTube links with thumbnail - convert [youtube:ID] or full URLs to clickable link cards
    .replace(/\[youtube:([a-zA-Z0-9_-]+)\]/g, (_, videoId) => {
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      return `<a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" class="block my-10 group">
        <div class="relative aspect-video rounded-2xl overflow-hidden shadow-xl ring-1 ring-border/20 hover:ring-primary/50 transition-all duration-300">
          <img src="${thumbnailUrl}" alt="YouTube video thumbnail" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'" />
          <div class="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg class="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <div class="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/70 text-white text-sm font-medium flex items-center gap-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            ${lang === 'ja' ? 'YouTubeで見る' : 'Watch on YouTube'}
          </div>
        </div>
      </a>`;
    })
    // Support full YouTube URLs: https://www.youtube.com/watch?v=VIDEO_ID
    .replace(/https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)(?:[^\s<]*)?/g, (_, videoId) => {
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      return `<a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" class="block my-10 group">
        <div class="relative aspect-video rounded-2xl overflow-hidden shadow-xl ring-1 ring-border/20 hover:ring-primary/50 transition-all duration-300">
          <img src="${thumbnailUrl}" alt="YouTube video thumbnail" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'" />
          <div class="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg class="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <div class="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/70 text-white text-sm font-medium flex items-center gap-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            ${lang === 'ja' ? 'YouTubeで見る' : 'Watch on YouTube'}
          </div>
        </div>
      </a>`;
    })
    // Support short YouTube URLs: https://youtu.be/VIDEO_ID
    .replace(/https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+)(?:[^\s<]*)?/g, (_, videoId) => {
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      return `<a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" class="block my-10 group">
        <div class="relative aspect-video rounded-2xl overflow-hidden shadow-xl ring-1 ring-border/20 hover:ring-primary/50 transition-all duration-300">
          <img src="${thumbnailUrl}" alt="YouTube video thumbnail" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'" />
          <div class="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg class="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <div class="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/70 text-white text-sm font-medium flex items-center gap-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            ${lang === 'ja' ? 'YouTubeで見る' : 'Watch on YouTube'}
          </div>
        </div>
      </a>`;
    })
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
      const trackTitle = lang === 'ja' ? track?.titleJa : track?.titleEn;
      const artworkFile = track?.artwork || `album-${trackId}.jpg`;
      const artworkPath = `/images/${artworkFile}`;
      return `<div class="my-8 flex justify-center"><button data-play-track-id="${trackId}" class="group relative inline-flex items-center gap-5 px-6 py-4 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 hover:from-primary/30 hover:via-primary/20 hover:to-primary/30 border border-primary/30 hover:border-primary/50 transition-all duration-500 shadow-lg hover:shadow-primary/20 hover:scale-[1.02] cursor-pointer"><span class="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span><img src="${artworkPath}" alt="${trackTitle}" class="w-16 h-16 rounded-xl object-cover shadow-lg ring-1 ring-white/10 group-hover:ring-primary/30 transition-all" /><div class="text-left"><span class="block text-xs text-muted-foreground mb-0.5">${lang === 'ja' ? '🎵 曲を再生' : '🎵 Play Track'}</span><span class="block text-lg font-semibold text-foreground group-hover:text-primary transition-colors">${trackTitle || 'Unknown Track'}</span></div><div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors ml-2"><svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div></button></div>`;
    });

  return DOMPurify.sanitize(processed, {
    ADD_TAGS: ['figure', 'figcaption', 'iframe'],
    ADD_ATTR: ['data-play-track-id', 'style', 'allow', 'allowfullscreen', 'frameborder', 'loading', 'decoding'],
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

  const [signupFormContainer, setSignupFormContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    
    const playButtons = contentRef.current.querySelectorAll('[data-play-track-id]');
    const handlers: Array<{ button: Element; handler: () => void }> = [];
    
    playButtons.forEach((button) => {
      const trackId = button.getAttribute('data-play-track-id') || '';
      const handleClick = () => playTrackById(trackId);
      button.addEventListener('click', handleClick);
      handlers.push({ button, handler: handleClick });
    });

    // Find elio signup form placeholder
    const signupPlaceholder = contentRef.current.querySelector('[data-component="elio-signup-form"]');
    if (signupPlaceholder) {
      setSignupFormContainer(signupPlaceholder as HTMLElement);
    }

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
      <AnimatePresence mode="wait">
        <CuteLoader key="loader" />
      </AnimatePresence>
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
      <SEO 
        title={content.title}
        description={content.excerpt}
        image={post.image}
        url={`https://yukihamada.jp/blog/${post.slug}`}
        type="article"
        publishedTime={content.date}
        category={content.category}
      />
      <Navigation />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl lg:mr-80">
            {/* Main content */}
            <article className="w-full">
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

                {/* Table of Contents - Mobile (inline) */}
                <div className="lg:hidden">
                  <TableOfContents content={content.content} />
                </div>
              </header>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="glass rounded-3xl p-4 md:p-8 lg:p-12">
                  <div 
                    ref={contentRef}
                    className="blog-content prose prose-lg dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: processedContent }}
                  />
                  {/* Render ElioSignupForm via portal */}
                  {signupFormContainer && createPortal(
                    <ElioSignupForm lang={language} />,
                    signupFormContainer
                  )}
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
            </div>

            {/* Sticky Sidebar TOC - Desktop only */}
            <aside className="hidden lg:block fixed right-8 xl:right-16 top-28 w-72">
              <TableOfContents content={content.content} sticky />
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
