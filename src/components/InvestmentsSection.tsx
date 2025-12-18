import { TrendingUp, ExternalLink } from 'lucide-react';

const investments = [
  {
    name: 'LayerX',
    category: 'FinTech / SaaS',
    description: '経理DXを推進するSaaS企業',
    logo: '📊',
  },
  {
    name: 'SmartHR',
    category: 'HR Tech',
    description: '人事労務クラウド',
    logo: '👥',
  },
  {
    name: 'ANDPAD',
    category: 'ConTech',
    description: '建設プロジェクト管理',
    logo: '🏗️',
  },
  {
    name: 'カミナシ',
    category: 'SaaS',
    description: '現場DXプラットフォーム',
    logo: '⚡',
  },
  {
    name: 'BECAUSE',
    category: 'Food Tech',
    description: '持続可能な食品ブランド',
    logo: '🌱',
  },
  {
    name: 'その他',
    category: 'Various',
    description: '多数のスタートアップに投資',
    logo: '🚀',
  },
];

const InvestmentsSection = () => {
  return (
    <section id="investments" className="section-padding bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <TrendingUp className="h-4 w-4" />
            Angel Investments
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            投資<span className="gradient-text">ポートフォリオ</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            革新的なスタートアップへの投資を通じて、次世代のイノベーションを支援しています
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {investments.map((investment, index) => (
            <div
              key={investment.name}
              className="group glass rounded-2xl p-6 card-hover cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{investment.logo}</span>
                <ExternalLink className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-1">
                {investment.name}
              </h3>
              <p className="text-sm text-primary font-medium mb-2">
                {investment.category}
              </p>
              <p className="text-muted-foreground text-sm">
                {investment.description}
              </p>
              
              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  エンジェル投資
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InvestmentsSection;
