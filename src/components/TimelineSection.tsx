import { useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Building2, Rocket, Home, Briefcase, ShoppingBag, Plane, Gift, Users, ChevronRight } from 'lucide-react';

const timelineItems = [
  {
    year: '2024〜',
    title: '株式会社イネブラ',
    role: '代表取締役CEO',
    description: '人生を「本質」だけで満たすEnablerとして、ライフスタイル・フィンテック・エデュテックの3つの事業を展開。',
    icon: Rocket,
    highlight: true,
    link: 'https://enablerhq.com',
  },
  {
    year: '2024〜',
    title: '令和トラベル',
    role: '社外取締役・株主',
    description: 'AIを活用したデジタルトラベルエージェンシー「NEWT」を運営。',
    icon: Plane,
    highlight: false,
  },
  {
    year: '〜2024',
    title: 'ギフトモール',
    role: '元社外取締役',
    description: 'プレゼントに特化したオンラインショッピングモール。',
    icon: Gift,
    highlight: false,
  },
  {
    year: '2018〜2024',
    title: 'NOT A HOTEL',
    role: '共同創業者・元取締役・現株主',
    description: '「自宅を持たない暮らし」を実現する会員制ホテル兼不動産サービス。',
    icon: Home,
    highlight: false,
  },
  {
    year: '〜2023',
    title: 'キャスター',
    role: '元社外取締役',
    description: '日本初のフルリモートワーク企業。2023年に東証グロース市場に上場。',
    icon: Users,
    highlight: false,
  },
  {
    year: '2014〜2021',
    title: 'メルカリ',
    role: '取締役・CPO・CINO',
    description: '日本最大のフリマアプリを運営するグローバル企業。取締役としてプロダクト責任者を務め成長を牽引。',
    icon: ShoppingBag,
    highlight: false,
  },
  {
    year: '2003〜2013',
    title: 'サイブリッジ',
    role: '共同創業者',
    description: '塾講師ナビ、オールクーポンなどのウェブサービスを開発・運営。',
    icon: Briefcase,
    highlight: false,
  },
];

const TimelineSection = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <section id="career" className="section-padding bg-card relative overflow-hidden">
      {/* Parallax background elements */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"
        style={{ y: backgroundY }}
      />
      
      {/* Floating decorative elements */}
      <motion.div 
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/5 blur-2xl"
        animate={{ 
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-accent/5 blur-2xl"
        animate={{ 
          y: [0, -30, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      
      <div className="container mx-auto px-6 relative z-10" ref={containerRef}>
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.p 
            className="text-primary text-sm font-medium tracking-widest uppercase mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Career Journey
          </motion.p>
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            キャリア<span className="gradient-text">タイムライン</span>
          </motion.h2>
          <motion.p 
            className="text-muted-foreground mt-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            千葉県立大高校 → 東京理科大学（中退）→ 起業家・経営者として活動
          </motion.p>
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          {/* Timeline line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border" />
          <motion.div
            className="absolute left-8 md:left-1/2 top-0 w-px bg-gradient-to-b from-primary via-accent to-primary"
            initial={{ height: 0 }}
            animate={isInView ? { height: "100%" } : { height: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />

          {timelineItems.map((item, index) => {
            const Icon = item.icon;
            const isLeft = index % 2 === 0;
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                key={item.title + item.year}
                className={`relative flex items-center mb-12 last:mb-0 ${
                  isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: [0.25, 0.4, 0.25, 1]
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Content */}
                <div
                  className={`ml-20 md:ml-0 md:w-1/2 ${
                    isLeft ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'
                  }`}
                >
                  <motion.div
                    className={`relative glass-premium rounded-2xl p-6 overflow-hidden hover-3d transition-shadow ${
                      item.highlight ? 'border-primary/50' : ''
                    } ${isHovered ? 'shadow-2xl' : 'shadow-lg'} ${
                      item.highlight ? 'ring-1 ring-primary/20' : 'ring-1 ring-border/40'
                    }`}
                    animate={{
                      scale: isHovered ? 1.05 : 1,
                      y: isHovered ? -10 : 0,
                      rotateY: isHovered ? 3 : 0,
                      rotateX: isHovered ? -2 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 250, damping: 20 }}
                    style={{
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    {/* Shine effect on hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: isHovered ? '100%' : '-100%' }}
                      transition={{ duration: 0.6 }}
                    />
                    
                    <motion.span 
                      className="text-sm text-primary font-medium"
                      animate={{ 
                        scale: isHovered ? 1.05 : 1,
                      }}
                    >
                      {item.year}
                    </motion.span>
                    <h3 className="text-xl font-bold text-foreground mt-1 flex items-center gap-2">
                      {item.title}
                      {item.link && (
                        <motion.a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary"
                          whileHover={{ scale: 1.2, rotate: 45 }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </motion.a>
                      )}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">{item.role}</p>
                    <motion.p 
                      className="text-muted-foreground mt-3 leading-relaxed text-sm"
                      animate={{ opacity: isHovered ? 1 : 0.8 }}
                    >
                      {item.description}
                    </motion.p>
                  </motion.div>
                </div>

                {/* Icon */}
                <motion.div
                  className={`absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center transition-shadow ${
                    item.highlight
                      ? 'gradient-bg'
                      : 'bg-card border-2 border-primary'
                  } ${isHovered ? 'shadow-lg ring-2 ring-primary/30' : 'shadow-md ring-1 ring-border/40'}`}
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: index * 0.1 + 0.3,
                    type: "spring",
                    stiffness: 200
                  }}
                  animate={{
                    scale: isHovered ? 1.3 : 1,
                    rotate: isHovered ? 10 : 0
                  }}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      item.highlight ? 'text-primary-foreground' : 'text-primary'
                    }`}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
