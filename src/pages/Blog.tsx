import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calendar, Tag, Eye, Filter, Clock, ChevronDown, X, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChat } from '@/contexts/ChatContext';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { Skeleton } from '@/components/ui/skeleton';
import OptimizedImage from '@/components/OptimizedImage';
import { calculateReadingTime, formatReadingTime } from '@/lib/readingTime';

const Blog = () => {
  const { language } = useLanguage();
  const { setPageContext } = useChat();
  const { posts: blogPosts, isLoading } = useBlogPosts();
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'views'>('date');

  // Set page context for chat
  useEffect(() => {
    setPageContext('blog');
  }, [setPageContext]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    blogPosts.forEach(post => {
      cats.add(post[language].category);
    });
    return Array.from(cats).sort();
  }, [blogPosts, language]);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let posts = selectedCategory 
      ? blogPosts.filter(post => post[language].category === selectedCategory)
      : [...blogPosts];
    
    if (sortBy === 'views') {
      posts.sort((a, b) => (viewCounts[b.slug] || 0) - (viewCounts[a.slug] || 0));
    }
    // 'date' sorting is already applied from useBlogPosts (newest first)
    
    return posts;
  }, [blogPosts, selectedCategory, language, sortBy, viewCounts]);

  useEffect(() => {
    let isMounted = true;

    const fetchViewCounts = async () => {
      const entries = await Promise.all(
        blogPosts.map(async (post) => {
          const { data, error } = await supabase.rpc('get_blog_view_count', { p_post_slug: post.slug });
          if (error) {
            console.error('Failed to fetch view count', post.slug, error);
          }
          return [post.slug, (data ?? 0) as number] as const;
        })
      );

      if (!isMounted) return;
      setViewCounts(Object.fromEntries(entries));
    };

    if (blogPosts.length > 0) {
      fetchViewCounts();
    }

    return () => {
      isMounted = false;
    };
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
      <SEO 
        title={language === 'ja' ? 'ブログ' : 'Blog'}
        description={language === 'ja' ? '濱田優貴のブログ。AI、テクノロジー、柔術、起業などについて書いています。' : 'Yuki Hamada\'s blog. Writing about AI, technology, BJJ, entrepreneurship and more.'}
        url="https://yukihamada.jp/blog"
      />
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
              <div className="flex items-center gap-3 flex-wrap">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      {selectedCategory || (language === 'ja' ? 'すべてのカテゴリー' : 'All Categories')}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-card border-border z-50">
                    <DropdownMenuItem 
                      onClick={() => setSelectedCategory(null)}
                      className={selectedCategory === null ? 'bg-primary/10 text-primary' : ''}
                    >
                      {language === 'ja' ? 'すべて' : 'All'} ({blogPosts.length})
                    </DropdownMenuItem>
                    {categories.map((category) => {
                      const count = blogPosts.filter(p => p[language].category === category).length;
                      return (
                        <DropdownMenuItem 
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={selectedCategory === category ? 'bg-primary/10 text-primary' : ''}
                        >
                          {category} ({count})
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      {sortBy === 'date' 
                        ? (language === 'ja' ? '新着順' : 'Newest') 
                        : (language === 'ja' ? '閲覧数順' : 'Most Viewed')}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-card border-border z-50">
                    <DropdownMenuItem 
                      onClick={() => setSortBy('date')}
                      className={sortBy === 'date' ? 'bg-primary/10 text-primary' : ''}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {language === 'ja' ? '新着順' : 'Newest First'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortBy('views')}
                      className={sortBy === 'views' ? 'bg-primary/10 text-primary' : ''}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {language === 'ja' ? '閲覧数順' : 'Most Viewed'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {selectedCategory && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    className="gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                    {language === 'ja' ? 'クリア' : 'Clear'}
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="blog-card-premium rounded-2xl overflow-hidden h-full flex flex-col border border-border/30">
                  <Skeleton className="aspect-video" />
                  <div className="p-6 flex flex-col flex-grow space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex items-center gap-3 pt-4 border-t border-border/30 mt-auto">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
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
            <>
              {/* Featured Hero Card */}
              {filteredPosts.length > 0 && !selectedCategory && sortBy === 'date' && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mb-8"
                >
                  <Link to={`/blog/${filteredPosts[0].slug}`}>
                    <article className="group blog-hero-card rounded-3xl overflow-hidden">
                      <div className="grid lg:grid-cols-2 gap-0">
                        <div className="aspect-video lg:aspect-auto overflow-hidden">
                          <OptimizedImage
                            src={filteredPosts[0].image || '/placeholder.svg'}
                            alt={filteredPosts[0][language].title}
                            width={800}
                            height={450}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                        <div className="p-8 lg:p-10 flex flex-col justify-center">
                          <div className="flex items-center gap-3 mb-4 flex-wrap">
                            {filteredPosts[0].featured && (
                              <span className="featured-badge">
                                ⭐ Featured
                              </span>
                            )}
                            <span className="category-badge flex items-center gap-1.5">
                              <Tag className="h-3 w-3" />
                              {filteredPosts[0][language].category}
                            </span>
                          </div>
                          
                          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground group-hover:text-primary transition-colors mb-4 leading-tight">
                            {filteredPosts[0][language].title}
                          </h2>
                          
                          <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6 line-clamp-3">
                            {filteredPosts[0][language].excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-border/30">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {filteredPosts[0][language].date}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {formatReadingTime(calculateReadingTime(filteredPosts[0][language].content, language), language)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Eye className="h-4 w-4" />
                                {viewCounts[filteredPosts[0].slug] || 0}
                              </span>
                            </div>
                            <motion.span 
                              className="text-primary font-medium flex items-center gap-2"
                              whileHover={{ x: 5 }}
                            >
                              {language === 'ja' ? '記事を読む' : 'Read Article'}
                              <ArrowRight className="h-4 w-4" />
                            </motion.span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              )}

              {/* Regular Cards Grid */}
              <motion.div
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={selectedCategory || 'all'}
              >
                {(selectedCategory || sortBy !== 'date' ? filteredPosts : filteredPosts.slice(1)).map((post) => {
                  const content = post[language];
                  return (
                    <Link key={post.slug} to={`/blog/${post.slug}`}>
                      <motion.article
                        className="group blog-card-premium rounded-2xl overflow-hidden h-full flex flex-col border border-border/30"
                        variants={cardVariants}
                        whileHover={{ 
                          scale: 1.02, 
                          y: -5
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          <OptimizedImage
                            src={post.image || '/placeholder.svg'}
                            alt={content.title}
                            width={400}
                            height={225}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="blog-image-overlay flex items-end justify-end p-4">
                            <span className="p-2 rounded-full bg-primary/90 text-primary-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-6 flex flex-col flex-grow">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            {post.featured && (
                              <span className="featured-badge text-[10px]">
                                Featured
                              </span>
                            )}
                            <span className="category-badge flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {content.category}
                            </span>
                          </div>
                          
                          <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-3 leading-snug line-clamp-2">
                            {content.title}
                          </h2>
                          
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow">
                            {content.excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-auto">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {content.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatReadingTime(calculateReadingTime(content.content, language), language)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {viewCounts[post.slug] || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    </Link>
                  );
                })}
              </motion.div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
