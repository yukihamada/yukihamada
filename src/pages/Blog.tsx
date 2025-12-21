import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calendar, Tag, Eye, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { Skeleton } from '@/components/ui/skeleton';
import OptimizedImage from '@/components/OptimizedImage';

const Blog = () => {
  const { language } = useLanguage();
  const { posts: blogPosts, isLoading } = useBlogPosts();
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    blogPosts.forEach(post => {
      cats.add(post[language].category);
    });
    return Array.from(cats).sort();
  }, [blogPosts, language]);

  // Filter posts by category
  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return blogPosts;
    return blogPosts.filter(post => post[language].category === selectedCategory);
  }, [blogPosts, selectedCategory, language]);

  useEffect(() => {
    const fetchViewCounts = async () => {
      const counts: Record<string, number> = {};
      for (const post of blogPosts) {
        const { data } = await supabase
          .rpc('get_blog_view_count', { p_post_slug: post.slug });
        counts[post.slug] = data || 0;
      }
      setViewCounts(counts);
    };
    if (blogPosts.length > 0) {
      fetchViewCounts();
    }
  }, [blogPosts]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link to="/#blog">
              <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {language === 'ja' ? 'ホームに戻る' : 'Back to Home'}
              </Button>
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {language === 'ja' ? 'すべての記事' : 'All Articles'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {isLoading 
                ? (language === 'ja' ? '読み込み中...' : 'Loading...') 
                : (language === 'ja' 
                  ? `${filteredPosts.length}件の記事${selectedCategory ? ` (${selectedCategory})` : ''}` 
                  : `${filteredPosts.length} articles${selectedCategory ? ` in ${selectedCategory}` : ''}`)}
            </p>
          </motion.div>

          {/* Category Filter */}
          {!isLoading && categories.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {language === 'ja' ? 'カテゴリーで絞り込み' : 'Filter by category'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="rounded-full"
                >
                  {language === 'ja' ? 'すべて' : 'All'}
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-full"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-video" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {language === 'ja' ? 'このカテゴリーには記事がありません' : 'No articles in this category'}
              </p>
            </div>
          ) : (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={selectedCategory || 'all'} // Re-animate when filter changes
          >
            {filteredPosts.map((post) => {
              const content = post[language];
              return (
                <Link key={post.slug} to={`/blog/${post.slug}`}>
                  <motion.article
                    className="group glass rounded-2xl overflow-hidden h-full flex flex-col"
                    variants={cardVariants}
                    whileHover={{ 
                      scale: 1.02, 
                      y: -5,
                      boxShadow: "0 20px 40px -15px hsl(var(--primary) / 0.2)"
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {post.image && (
                      <div className="aspect-video overflow-hidden">
                        <OptimizedImage
                          src={post.image}
                          alt={content.title}
                          width={400}
                          height={225}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {post.featured && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                            Featured
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-primary text-xs font-medium">
                          <Tag className="h-3 w-3" />
                          {content.category}
                        </span>
                      </div>
                      
                      <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-3">
                        {content.title}
                      </h2>
                      
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
                        {content.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {content.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {viewCounts[post.slug] || 0}
                          </span>
                        </div>
                        <motion.span 
                          className="text-primary flex items-center gap-1 text-sm"
                          whileHover={{ x: 5 }}
                        >
                          {language === 'ja' ? '読む' : 'Read'}
                          <ArrowRight className="h-3 w-3" />
                        </motion.span>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              );
            })}
          </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
