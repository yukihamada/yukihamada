import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBlogPostBySlug, blogPosts } from '@/data/blogPosts';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LikeButton from '@/components/LikeButton';
import BlogViewStats from '@/components/BlogViewStats';

// Blog post images
import jiuflowHero from '@/assets/jiuflow-hero.png';
import jiuflowLesson from '@/assets/jiuflow-lesson.png';

const blogImages: Record<string, string> = {
  'jiuflow-hero': jiuflowHero,
  'jiuflow-lesson': jiuflowLesson,
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

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
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">シェア:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
                aria-label="Xでシェア"
              >
                <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
                aria-label="Facebookでシェア"
              >
                <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
                aria-label="LINEでシェア"
              >
                <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
              </a>
            </div>
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
                className="blog-content prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: post.content
                    // Headings with nice styling
                    .replace(/^## (.+)$/gm, '<h2 class="text-2xl md:text-3xl font-bold mt-12 mb-6 text-foreground border-l-4 border-primary pl-4">$1</h2>')
                    .replace(/^### (.+)$/gm, '<h3 class="text-xl md:text-2xl font-semibold mt-8 mb-4 text-foreground">$1</h3>')
                    // Convert markdown tables to HTML tables
                    .replace(/\n\| (.+) \|\n\|[-| ]+\|\n((?:\| .+ \|\n?)+)/g, (match, header, body) => {
                      const headers = header.split(' | ').map((h: string) => 
                        `<th class="px-3 py-3 md:px-5 md:py-4 text-left text-xs md:text-sm font-semibold text-foreground bg-primary/10 first:rounded-tl-xl last:rounded-tr-xl">${h.trim()}</th>`
                      ).join('');
                      const rows = body.trim().split('\n').map((row: string) => {
                        const cells = row.replace(/^\| /, '').replace(/ \|$/, '').split(' | ').map((cell: string, idx: number) => 
                          `<td class="px-3 py-3 md:px-5 md:py-4 text-sm ${idx === 0 ? 'font-medium text-foreground' : 'text-muted-foreground'} border-b border-border/30">${cell.trim()}</td>`
                        ).join('');
                        return `<tr class="hover:bg-primary/5 transition-colors">${cells}</tr>`;
                      }).join('');
                      return `<div class="overflow-x-auto my-8 -mx-2 md:mx-0"><table class="w-full min-w-[320px] border-collapse rounded-xl overflow-hidden shadow-md border border-border/20 bg-card/50"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
                    })
                    // Numbered lists with bold items
                    .replace(/^(\d+)\. \*\*(.+?)\*\*: (.+)$/gm, '<div class="flex gap-3 mb-4 p-4 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors"><span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm">$1</span><div><strong class="text-foreground font-semibold">$2</strong><span class="text-muted-foreground">: $3</span></div></div>')
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
                    // Image syntax
                    .replace(/\[image:([a-zA-Z0-9_-]+)\]/g, (_, imageKey) => {
                      const imageSrc = blogImages[imageKey];
                      return imageSrc 
                        ? `<div class="my-10"><img src="${imageSrc}" alt="${imageKey}" class="w-full rounded-2xl shadow-xl ring-1 ring-border/20" /></div>`
                        : '';
                    })
                    // Paragraphs
                    .replace(/\n\n/g, '</p><p class="mb-6 text-muted-foreground leading-relaxed text-lg">')
                }}
              />
            </div>

            {/* Like Button */}
            <div className="flex justify-center mt-8">
              <LikeButton postSlug={post.slug} />
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
