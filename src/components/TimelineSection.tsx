import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Building2, Rocket, Home, Briefcase, ShoppingBag, Plane, Gift, Users } from 'lucide-react';

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

  return (
    <section id="career" className="section-padding bg-card relative overflow-hidden">
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
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
              >
                {/* Content */}
                <div
                  className={`ml-20 md:ml-0 md:w-1/2 ${
                    isLeft ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'
                  }`}
                >
                  <motion.div
                    className={`inline-block glass rounded-2xl p-6 ${
                      item.highlight ? 'border-primary/50' : ''
                    }`}
                    whileHover={{ 
                      scale: 1.02, 
                      y: -5,
                      boxShadow: item.highlight 
                        ? "0 25px 50px -12px hsl(262 83% 58% / 0.25)"
                        : "0 25px 50px -12px hsl(0 0% 0% / 0.15)"
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.span 
                      className="text-sm text-primary font-medium"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {item.year}
                    </motion.span>
                    <h3 className="text-xl font-bold text-foreground mt-1">{item.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{item.role}</p>
                    <p className="text-muted-foreground mt-3 leading-relaxed text-sm">
                      {item.description}
                    </p>
                  </motion.div>
                </div>

                {/* Icon */}
                <motion.div
                  className={`absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center ${
                    item.highlight
                      ? 'gradient-bg'
                      : 'bg-card border-2 border-primary'
                  }`}
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: index * 0.1 + 0.3,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ 
                    scale: 1.2,
                    boxShadow: "0 0 30px hsl(262 83% 58% / 0.5)"
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
