import { useParams, Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBlogPostBySlug, blogPosts } from '@/data/blogPosts';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LikeButton from '@/components/LikeButton';
import BlogViewStats from '@/components/BlogViewStats';
import BlogOGP from '@/components/BlogOGP';
import ShareButtons from '@/components/ShareButtons';
import DOMPurify from 'dompurify';
// Blog post images
import jiuflowHero from '@/assets/jiuflow-hero.png';
import jiuflowLesson from '@/assets/jiuflow-lesson.png';

const blogImages: Record<string, string> = {
  'jiuflow-hero': jiuflowHero,
  'jiuflow-lesson': jiuflowLesson,
  'cost-collapse-timeline': '/images/blog-cost-collapse-timeline.jpg',
  'bjj-medal': '/images/blog-bjj-medal.jpg',
  'bjj-match': '/images/blog-bjj-match.jpg',
  'bjj-group1': '/images/blog-bjj-group1.jpg',
  'bjj-victory': '/images/blog-bjj-victory.jpg',
  'sinic-diagram': '/images/sinic-theory-diagram.svg',
};

// Track name to index mapping for music player
const trackMapping: Record<string, number> = {
  'shio-to-pixel': 6, // Index of 塩とピクセル in the tracks array
  'free-to-change': 0,
  'hello-2150': 1,
  'everybody-bjj': 2,
  'i-love-you': 3,
  'attention': 4,
  'koi-jujutsu': 5,
  'musubinaosu': 7,
};

// Function to dispatch custom event to play specific track
const playTrack = (trackIndex: number) => {
  window.dispatchEvent(new CustomEvent('playSpecificTrack', { detail: { trackIndex } }));
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;
  const contentRef = useRef<HTMLDivElement>(null);

  // Add click listeners for play buttons after content renders
  useEffect(() => {
    if (!contentRef.current) return;
    
    const playButtons = contentRef.current.querySelectorAll('[data-play-track]');
    playButtons.forEach((button) => {
      const trackIndex = parseInt(button.getAttribute('data-play-track') || '0', 10);
      const handleClick = () => playTrack(trackIndex);
      button.addEventListener('click', handleClick);
      // Store handler for cleanup
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
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">記事が見つかりません</h1>
          <p className="text-muted-foreground mb-8">お探しのブログ記事は存在しないか、削除された可能性があります。</p>
          <Button asChild>
            <Link to="/#blog">ブログ一覧に戻る</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Get related posts (same category, excluding current)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.slug !== post.slug)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <BlogOGP post={post} />
      <Navigation />
      
      <main className="pt-24 pb-20">
        <article className="container mx-auto px-6 max-w-4xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="ghost" asChild className="mb-8 text-muted-foreground hover:text-foreground">
              <Link to="/#blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ブログに戻る
              </Link>
            </Button>
          </motion.div>

          {/* Header */}
          <motion.header
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                <Tag className="h-3 w-3" />
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground text-sm">
                <Calendar className="h-4 w-4" />
                {post.date}
              </span>
            </div>

            {/* View Stats */}
            <div className="mb-6">
              <BlogViewStats postSlug={post.slug} />
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed mb-6">
              {post.excerpt}
            </p>

            {/* Share Buttons */}
            <ShareButtons title={post.title} url={window.location.href} />
          </motion.header>

          {/* Content */}
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
                    post.content
                      // Headings with nice styling
                      .replace(/^## (.+)$/gm, '<h2 class="text-2xl md:text-3xl font-bold mt-12 mb-6 text-foreground border-l-4 border-primary pl-4">$1</h2>')
                      .replace(/^### (.+)$/gm, '<h3 class="text-xl md:text-2xl font-semibold mt-8 mb-4 text-foreground">$1</h3>')
                      // Convert markdown tables to HTML tables
                      .replace(/\|(.+)\|/g, (match) => {
                        const cells = match.split('|').filter(c => c.trim());
                        if (cells.every(c => c.trim().match(/^[-:]+$/))) {
                          return ''; // Skip separator row
                        }
                        const cellsHtml = cells.map(c => `<td class="px-4 py-3 border border-border/30">${c.trim()}</td>`).join('');
                        return `<tr class="even:bg-muted/30">${cellsHtml}</tr>`;
                      })
                      .replace(/(<tr.*?<\/tr>\s*)+/g, (match) => {
                        return `<div class="overflow-x-auto my-8"><table class="w-full border-collapse rounded-xl overflow-hidden shadow-lg ring-1 ring-border/20"><tbody>${match}</tbody></table></div>`;
                      })
                      // Blockquotes with emoji support
                      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/50 pl-6 py-4 my-8 bg-primary/5 rounded-r-xl italic text-muted-foreground text-lg">$1</blockquote>')
                      // Horizontal rules
                      .replace(/^---$/gm, '<hr class="my-12 border-t border-border/30" />')
                      // Numbered lists
                      .replace(/^(\d+)\. (.+)$/gm, '<li class="flex items-start gap-3 mb-3"><span class="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center mt-0.5">$1</span><span class="text-muted-foreground leading-relaxed">$2</span></li>')
                      // Bullet lists - wrap in ul and style nicely
                      .replace(/^- (.+)$/gm, '<li class="flex items-start gap-3 mb-3"><span class="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2.5"></span><span class="text-muted-foreground leading-relaxed">$1</span></li>')
                      // Bold text
                      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                      // Convert markdown links to HTML links
                      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80 underline underline-offset-4 decoration-primary/50 hover:decoration-primary transition-all font-medium">$1</a>')
                      // Emoji callouts (⚠️, 👉, 🎉)
                      .replace(/^(⚠️|👉|🎉) (.+)$/gm, (_, emoji, text) => {
                        const bgColor = emoji === '⚠️' ? 'bg-amber-500/10 border-amber-500/30' : emoji === '🎉' ? 'bg-green-500/10 border-green-500/30' : 'bg-primary/10 border-primary/30';
                        return `<div class="flex items-start gap-3 p-4 my-4 rounded-xl ${bgColor} border"><span class="text-2xl">${emoji}</span><span class="text-foreground leading-relaxed">${text}</span></div>`;
                      })
                      // YouTube embed
                      .replace(/\[youtube:([a-zA-Z0-9_-]+)\]/g, '<div class="my-10 aspect-video rounded-2xl overflow-hidden shadow-xl ring-1 ring-border/20"><iframe class="w-full h-full" src="https://www.youtube.com/embed/$1" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>')
                      // Image syntax - optimized with lazy loading and srcset
                      .replace(/\[image:([a-zA-Z0-9_-]+)\]/g, (_, imageKey) => {
                        const imageSrc = blogImages[imageKey];
                        return imageSrc 
                          ? `<div class="my-8 flex justify-center"><img src="${imageSrc}" alt="${imageKey}" loading="lazy" decoding="async" class="w-full md:w-1/2 lg:w-2/5 rounded-xl shadow-lg ring-1 ring-border/20" /></div>`
                          : '';
                      })
                      // Play button syntax [play:track-id] - using data attribute for click handling
                      .replace(/\[play:([a-zA-Z0-9_-]+)\]/g, (_, trackId) => {
                        const trackIndex = trackMapping[trackId] ?? 0;
                        return `<div class="my-10 flex justify-center"><button data-play-track="${trackIndex}" class="group flex items-center gap-4 px-8 py-5 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"><span class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></span><span>🎵 塩とピクセル を再生</span></button></div>`;
                      })
                      // Paragraphs
                      .replace(/\n\n/g, '</p><p class="mb-6 text-muted-foreground leading-relaxed text-lg">'),
                    { ADD_ATTR: ['target', 'rel', 'allowfullscreen', 'allow', 'frameborder', 'data-play-track'], ADD_TAGS: ['iframe'] }
                  )
                }}
              />
            </div>

            {/* Like Button and Share Buttons */}
            <div className="flex flex-col items-center gap-6 mt-8">
              <LikeButton postSlug={post.slug} />
              <ShareButtons title={post.title} url={window.location.href} />
            </div>
          </motion.div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <motion.section
              className="mt-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-8">関連記事</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    to={`/blog/${relatedPost.slug}`}
                    className="group glass rounded-2xl p-6 hover:scale-[1.02] transition-transform"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-primary text-xs font-medium">{relatedPost.category}</span>
                      <span className="text-muted-foreground text-xs">{relatedPost.date}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {relatedPost.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}

          {/* All Posts Link */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button variant="outline" asChild>
              <Link to="/#blog">
                すべての記事を見る
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
