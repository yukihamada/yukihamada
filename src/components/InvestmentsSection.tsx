import { motion } from 'framer-motion';
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
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  return (
    <section id="investments" className="section-padding bg-background relative overflow-hidden">
      <motion.div 
        className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div 
        className="absolute top-1/2 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 6, repeat: Infinity, delay: 3 }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="h-4 w-4" />
            </motion.span>
            Angel Investments
          </motion.div>
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            投資<span className="gradient-text">ポートフォリオ</span>
          </motion.h2>
          <motion.p 
            className="text-muted-foreground mt-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            革新的なスタートアップへの投資を通じて、次世代のイノベーションを支援
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {investments.map((investment, index) => (
            <motion.a
              key={investment.name}
              href={investment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group glass rounded-2xl p-6 cursor-pointer block"
              variants={cardVariants}
              whileHover={{ 
                scale: 1.03, 
                y: -10,
                boxShadow: "0 30px 60px -15px hsl(262 83% 58% / 0.2)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-start justify-between mb-4">
                <motion.span 
                  className="text-4xl"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                >
                  {investment.logo}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="text-muted-foreground"
                >
                  <ExternalLink className="h-5 w-5" />
                </motion.span>
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
              
              <motion.div 
                className="mt-4 pt-4 border-t border-border"
                initial={{ opacity: 0.6 }}
                whileHover={{ opacity: 1 }}
              >
                <span className="text-xs text-muted-foreground">
                  エンジェル投資
                </span>
              </motion.div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default InvestmentsSection;
