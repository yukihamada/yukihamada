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

  return (
    <section id="blog" className="section-padding bg-card relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
          <div>
            <p className="text-primary text-sm font-medium tracking-widest uppercase mb-4">
              Blog & Thoughts
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              ブログ<span className="gradient-text">& 発信</span>
            </h2>
          </div>
          <Button variant="ghost" className="mt-4 md:mt-0 text-primary hover:text-primary/80" asChild>
            <a href="https://www.yukihamada.jp/blog-list" target="_blank" rel="noopener noreferrer">
              すべての記事を見る
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Featured Post */}
          {featuredPost && (
            <a
              href={featuredPost.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group glass rounded-3xl p-8 card-hover lg:row-span-2 block"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                  Featured
                </span>
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
                <span className="text-primary flex items-center gap-1">
                  続きを読む
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </a>
          )}

          {/* Other Posts */}
          <div className="space-y-4">
            {otherPosts.map((post) => (
              <a
                key={post.title}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group glass rounded-2xl p-6 card-hover cursor-pointer block"
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
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
