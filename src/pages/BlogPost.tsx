import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBlogPostBySlug, blogPosts } from '@/data/blogPosts';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

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
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                <Tag className="h-3 w-3" />
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground text-sm">
                <Calendar className="h-4 w-4" />
                {post.date}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          </motion.header>

          {/* Content */}
          <motion.div
            className="prose prose-lg dark:prose-invert max-w-none"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass rounded-3xl p-8 md:p-12">
              <div 
                className="blog-content text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: post.content
                    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h2>')
                    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-3 text-foreground">$1</h3>')
                    .replace(/^\d\. \*\*(.+?)\*\*: (.+)$/gm, '<li class="mb-2"><strong class="text-foreground">$1</strong>: $2</li>')
                    .replace(/^- (.+)$/gm, '<li class="mb-2 text-muted-foreground">$1</li>')
                    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                    .replace(/\n\n/g, '</p><p class="mb-4 text-muted-foreground">')
                }}
              />
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
