import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { blogPosts } from '@/data/blogPosts';
import { useLanguage } from '@/contexts/LanguageContext';

const BlogSection = () => {
  const { language } = useLanguage();
  const featuredPost = blogPosts.find((post) => post.featured);
  const otherPosts = blogPosts.filter((post) => !post.featured);

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
    <section id="blog" className="section-padding bg-card relative overflow-hidden">
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <motion.p 
              className="text-primary text-sm font-medium tracking-widest uppercase mb-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              Blog & Thoughts
            </motion.p>
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              {language === 'ja' ? 'ブログ' : 'Blog'}<span className="gradient-text">{language === 'ja' ? '& 発信' : '& Thoughts'}</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ x: 5 }}
          >
            <Button variant="ghost" className="mt-4 md:mt-0 text-primary hover:text-primary/80" asChild>
              <Link to="/blog">
                {language === 'ja' ? 'すべての記事を見る' : 'View All Posts'}
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div 
          className="grid lg:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {featuredPost && (
            <Link to={`/blog/${featuredPost.slug}`}>
              <motion.div
                className="group glass rounded-3xl p-8 lg:row-span-2 block h-full"
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.02, 
                  y: -5,
                  boxShadow: "0 30px 60px -15px hsl(262 83% 58% / 0.2)"
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <motion.span 
                    className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium"
                    animate={{ 
                      boxShadow: [
                        "0 0 0 0 hsl(262 83% 58% / 0.4)",
                        "0 0 0 10px hsl(262 83% 58% / 0)",
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Featured
                  </motion.span>
                  <span className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Tag className="h-3 w-3" />
                    {featuredPost[language].category}
                  </span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {featuredPost[language].title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {featuredPost[language].excerpt}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-border">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {featuredPost[language].date}
                  </span>
                  <motion.span 
                    className="text-primary flex items-center gap-1"
                    whileHover={{ x: 5 }}
                  >
                    {language === 'ja' ? '続きを読む' : 'Read More'}
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </div>
              </motion.div>
            </Link>
          )}

          {/* Other Posts */}
          <div className="space-y-4">
            {otherPosts.map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`}>
                <motion.div
                  className="group glass rounded-2xl p-6 cursor-pointer block"
                  variants={cardVariants}
                  whileHover={{ 
                    scale: 1.02, 
                    x: 10,
                    boxShadow: "0 20px 40px -15px hsl(262 83% 58% / 0.15)"
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center gap-1 text-primary text-xs font-medium">
                      <Tag className="h-3 w-3" />
                      {post[language].category}
                    </span>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span className="text-muted-foreground text-xs">{post[language].date}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    {post[language].title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {post[language].excerpt}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BlogSection;
