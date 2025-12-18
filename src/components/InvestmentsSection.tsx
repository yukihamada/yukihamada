import { TrendingUp, ExternalLink } from 'lucide-react';

const investments = [
  {
    name: 'NOT A HOTEL',
    category: '不動産・ホスピタリティ',
    description: '会員制のホテル兼不動産モデルを提供',
    logo: '🏨',
    url: 'https://notahotel.com/',
  },
  {
    name: '令和トラベル',
    category: 'トラベルテック',
    description: 'AIを活用したデジタルトラベルエージェンシー「NEWT」を運営',
    logo: '✈️',
    url: 'https://newt.net/',
  },
  {
    name: 'エルソウルラボ',
    category: 'Web3・ブロックチェーン',
    description: 'SolanaチェーンのバリデーターやWeb3アプリ開発のOSS提供',
    logo: '⛓️',
    url: 'https://labo.elsoul.nl/ja/',
  },
  {
    name: 'フィナンシェ',
    category: 'ブロックチェーン・クラウドファンディング',
    description: 'トークン発行型クラウドファンディングプラットフォーム',
    logo: '🪙',
    url: 'https://www.corp.financie.jp/',
  },
  {
    name: 'VUILD',
    category: 'デジタルファブリケーション',
    description: '誰でも家や家具を設計・製作できるプラットフォーム「Nesting」',
    logo: '🏠',
    url: 'https://vuild.co.jp/',
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
            革新的なスタートアップへの投資を通じて、次世代のイノベーションを支援
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {investments.map((investment, index) => (
            <a
              key={investment.name}
              href={investment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group glass rounded-2xl p-6 card-hover cursor-pointer block"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{investment.logo}</span>
                <ExternalLink className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
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
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InvestmentsSection;
