import { ArrowRight, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const blogPosts = [
  {
    title: 'イネブラ構想 - 世界中にクリエイターの拠点を',
    excerpt: '3000カ所のコワーキングスペースを世界中に作り、最終的には宇宙まで。この壮大なビジョンの背景と計画について。',
    date: '2024年12月',
    category: 'イネブラ',
    featured: true,
  },
  {
    title: 'NOT A HOTELでの学び',
    excerpt: '新しい住まいの形を追求するNOT A HOTELでのエンジニアリング経験と、そこから得た気づき。',
    date: '2024年10月',
    category: 'キャリア',
    featured: false,
  },
  {
    title: 'スタートアップ投資の視点',
    excerpt: 'エンジェル投資家として見ている市場トレンドと、投資判断で重視するポイント。',
    date: '2024年8月',
    category: '投資',
    featured: false,
  },
  {
    title: 'リモートワーク時代のコミュニティ形成',
    excerpt: 'デジタルノマドが増える中、物理的なコミュニティの重要性が高まっている理由。',
    date: '2024年6月',
    category: 'コミュニティ',
    featured: false,
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
          <Button variant="ghost" className="mt-4 md:mt-0 text-primary hover:text-primary/80">
            すべての記事を見る
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Featured Post */}
          {featuredPost && (
            <div className="group glass rounded-3xl p-8 card-hover lg:row-span-2">
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
                <Button variant="ghost" size="sm" className="text-primary">
                  続きを読む
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Other Posts */}
          <div className="space-y-4">
            {otherPosts.map((post) => (
              <div
                key={post.title}
                className="group glass rounded-2xl p-6 card-hover cursor-pointer"
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
