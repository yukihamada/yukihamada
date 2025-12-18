import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const blogPosts = [
  {
    title: 'Claude Codeでyukihamada.jpを更新した話：AIによるウェブ開発の新時代',
    excerpt: 'Claude Codeという革新的なツールを使ってyukihamada.jpを更新した体験について共有。マジで便利な時代になったなぁと心から感じています。',
    date: '2025年6月12日',
    category: '技術',
    featured: true,
    url: 'https://www.yukihamada.jp/blog/2025-06-12',
  },
  {
    title: 'エコーチェンバーとフェイクニュースによる社会の分断',
    excerpt: 'ノーベル経済学賞を受賞したダロン・アセモグル教授は「民主主義が危機に瀕している」との警鐘を鳴らしました。',
    date: '2024年10月16日',
    category: '社会問題',
    featured: false,
    url: 'https://www.yukihamada.jp/blog/2024-10-16',
  },
  {
    title: '音声入力の未来：なぜ今こそ注目すべきか',
    excerpt: '今回は音声入力の可能性について考えてみたいと思います。',
    date: '2024年10月7日',
    category: 'テクノロジー',
    featured: false,
    url: 'https://www.yukihamada.jp/blog/2024-10-07',
  },
  {
    title: 'AIと人類の共存：問題解決と創造的思考の新時代',
    excerpt: '「何を問題解決するか」をAIに問いかけることが非常に重要になってきています。',
    date: '2024年9月19日',
    category: 'AI・未来社会',
    featured: false,
    url: 'https://www.yukihamada.jp/blog/2024-09-19',
  },
];

const BlogSection = () => {
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
              ブログ<span className="gradient-text">& 発信</span>
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
              <a href="https://www.yukihamada.jp/blog-list" target="_blank" rel="noopener noreferrer">
                すべての記事を見る
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </a>
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
          {/* Featured Post */}
          {featuredPost && (
            <motion.a
              href={featuredPost.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group glass rounded-3xl p-8 lg:row-span-2 block"
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
                  {featuredPost.category}
                </span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                {featuredPost.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed mb-6">
                {featuredPost.excerpt}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-border">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {featuredPost.date}
                </span>
                <motion.span 
                  className="text-primary flex items-center gap-1"
                  whileHover={{ x: 5 }}
                >
                  続きを読む
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </div>
            </motion.a>
          )}

          {/* Other Posts */}
          <div className="space-y-4">
            {otherPosts.map((post, index) => (
              <motion.a
                key={post.title}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
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
                    {post.category}
                  </span>
                  <span className="text-muted-foreground text-xs">•</span>
                  <span className="text-muted-foreground text-xs">{post.date}</span>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                  {post.title}
                </h3>
                
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {post.excerpt}
                </p>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BlogSection;
