import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ExternalLink, Sparkles } from 'lucide-react';

interface Investment {
  name: string;
  category: string;
  description: string;
  emoji: string;
  logo?: string;
  url: string;
  gradient: string;
}

const investments: Investment[] = [
  {
    name: 'NOT A HOTEL',
    category: '不動産・ホスピタリティ',
    description: '会員制のホテル兼不動産モデルを提供',
    emoji: '🏨',
    logo: '/images/investments/notahotel-logo.png',
    url: 'https://notahotel.com/',
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  {
    name: '令和トラベル',
    category: 'トラベルテック',
    description: 'AIを活用したデジタルトラベルエージェンシー「NEWT」を運営',
    emoji: '✈️',
    logo: '/images/investments/newt-logo.png',
    url: 'https://newt.net/',
    gradient: 'from-sky-500/20 to-blue-500/20',
  },
  {
    name: 'エルソウルラボ',
    category: 'Web3・ブロックチェーン',
    description: 'SolanaチェーンのバリデーターやWeb3アプリ開発のOSS提供',
    emoji: '⛓️',
    logo: '/images/investments/elsoul-logo.png',
    url: 'https://labo.elsoul.nl/ja/',
    gradient: 'from-purple-500/20 to-violet-500/20',
  },
  {
    name: 'フィナンシェ',
    category: 'ブロックチェーン・クラウドファンディング',
    description: 'トークン発行型クラウドファンディングプラットフォーム',
    emoji: '🪙',
    logo: '/images/investments/financie-logo.png',
    url: 'https://www.corp.financie.jp/',
    gradient: 'from-yellow-500/20 to-amber-500/20',
  },
  {
    name: 'VUILD',
    category: 'デジタルファブリケーション',
    description: '誰でも家や家具を設計・製作できるプラットフォーム「Nesting」',
    emoji: '🏠',
    logo: '/images/investments/vuild-logo.png',
    url: 'https://vuild.co.jp/',
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
];

// Logo component with fallback to emoji
const InvestmentLogo = ({ investment, isHovered }: { investment: Investment; isHovered: boolean }) => {
  const [imageError, setImageError] = useState(false);

  if (!investment.logo || imageError) {
    return (
      <motion.span 
        className="text-4xl"
        animate={{ 
          scale: isHovered ? 1.3 : 1,
          rotate: isHovered ? [0, -10, 10, 0] : 0,
          y: isHovered ? -5 : 0,
        }}
        transition={{ duration: 0.4 }}
      >
        {investment.emoji}
      </motion.span>
    );
  }

  return (
    <motion.div
      className="w-12 h-12 relative"
      animate={{ 
        scale: isHovered ? 1.2 : 1,
        y: isHovered ? -5 : 0,
      }}
      transition={{ duration: 0.4 }}
    >
      <img
        src={investment.logo}
        alt={`${investment.name} logo`}
        className="w-full h-full object-contain dark:brightness-0 dark:invert"
        onError={() => setImageError(true)}
      />
    </motion.div>
  );
};

const InvestmentsSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

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
      {/* Animated background orbs */}
      <motion.div 
        className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 50, 0],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute top-1/2 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2"
        animate={{
          scale: [1.3, 1, 1.3],
          opacity: [0.3, 0.6, 0.3],
          x: [0, -50, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, delay: 4 }}
      />
      
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/30"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{ 
            duration: 3 + i * 0.5, 
            repeat: Infinity,
            delay: i * 0.3 
          }}
        />
      ))}
      
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
            whileHover={{ scale: 1.05, backgroundColor: "hsl(var(--primary) / 0.2)" }}
          >
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <TrendingUp className="h-4 w-4" />
            </motion.span>
            Angel Investments
            <Sparkles className="h-3 w-3" />
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
          {investments.map((investment, index) => {
            const isHovered = hoveredIndex === index;
            
            return (
              <motion.a
                key={investment.name}
                href={investment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative glass-premium rounded-2xl p-6 cursor-pointer block overflow-hidden"
                variants={cardVariants}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                whileHover={{ 
                  scale: 1.06, 
                  y: -18,
                  rotateY: 5,
                  rotateX: -3,
                }}
                whileTap={{ scale: 0.98 }}
                style={{
                  transformStyle: 'preserve-3d',
                  boxShadow: isHovered 
                    ? "0 35px 70px -15px hsl(var(--primary) / 0.35), inset 0 1px 0 hsl(0 0% 100% / 0.15)"
                    : "0 4px 20px -5px hsl(0 0% 0% / 0.1)"
                }}
              >
                {/* Gradient background on hover */}
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-br ${investment.gradient}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: isHovered ? '100%' : '-100%' }}
                  transition={{ duration: 0.6 }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <InvestmentLogo investment={investment} isHovered={isHovered} />
                    <motion.div
                      animate={{ 
                        opacity: isHovered ? 1 : 0,
                        x: isHovered ? 0 : 10,
                        rotate: isHovered ? 45 : 0
                      }}
                      className="text-primary"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </motion.div>
                  </div>
                  
                  <motion.h3 
                    className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors"
                    animate={{ x: isHovered ? 5 : 0 }}
                  >
                    {investment.name}
                  </motion.h3>
                  <p className="text-sm text-primary font-medium mb-2">
                    {investment.category}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {investment.description}
                  </p>
                  
                  <motion.div 
                    className="mt-4 pt-4 border-t border-border flex items-center justify-between"
                    animate={{ opacity: isHovered ? 1 : 0.6 }}
                  >
                    <span className="text-xs text-muted-foreground">
                      エンジェル投資
                    </span>
                    <motion.div
                      className="h-1 bg-gradient-to-r from-primary to-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: isHovered ? 40 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </div>
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default InvestmentsSection;
