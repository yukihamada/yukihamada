import { motion } from 'framer-motion';
import { Globe, Users, Rocket, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedSection from '@/components/AnimatedSection';
import MagneticButton from '@/components/MagneticButton';

const EnablerSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
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
    <section id="enabler" className="section-padding bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div 
        className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent"
        initial={{ opacity: 0, x: 100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <AnimatedSection>
            <motion.div 
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <motion.div 
                variants={itemVariants}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                whileHover={{ scale: 1.05, backgroundColor: "hsl(262 83% 58% / 0.2)" }}
              >
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Rocket className="h-4 w-4" />
                </motion.span>
                現在のメインプロジェクト
              </motion.div>
              
              <motion.h2 variants={itemVariants} className="text-4xl md:text-6xl font-bold">
                <motion.span 
                  className="gradient-text inline-block"
                  whileHover={{ scale: 1.02 }}
                >
                  株式会社イネブラ
                </motion.span>
                <br />
                <span className="text-foreground text-2xl md:text-3xl">代表取締役CEO</span>
              </motion.h2>
              
              <motion.p variants={itemVariants} className="text-xl text-muted-foreground leading-relaxed">
                人生を「本質」だけで満たすための<span className="text-primary font-semibold">Enabler</span>として、
                ライフスタイル・フィンテック・エデュテックの3つの事業を展開。
              </motion.p>

              <motion.div variants={itemVariants} className="space-y-4 text-muted-foreground">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <motion.span
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <MapPin className="h-5 w-5 text-primary" />
                  </motion.span>
                  ビジョン
                </h3>
                <p>
                  世界中に<span className="text-primary font-semibold">3000カ所</span>、
                  そして<span className="text-primary font-semibold">宇宙にまで</span>拡がる宿泊施設と楽しめる拠点を創造すること。
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-3 text-muted-foreground">
                <h3 className="text-lg font-semibold text-foreground">ミッション</h3>
                <ul className="space-y-2 text-sm">
                  {[
                    'コミュニティを軸とした、新しい形の宿泊体験の提供',
                    'テクノロジーと人間性の融合による、未来志向の生活空間の創造',
                    '地球上の多様な文化と自然を結びつける、グローバルネットワークの構築',
                    '宇宙旅行や宇宙居住の実現に向けた、先駆的な取り組みの推進',
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-start gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <motion.span 
                        className="text-primary mt-1"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                      >
                        •
                      </motion.span>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                <MagneticButton>
                  <Button
                    size="lg"
                    className="gradient-bg text-primary-foreground hover:opacity-90 glow-primary"
                    asChild
                  >
                    <a href="https://www.patreon.com/paradisecreator/" target="_blank" rel="noopener noreferrer">
                      <Users className="mr-2 h-5 w-5" />
                      Patreonで参加
                    </a>
                  </Button>
                </MagneticButton>
                <MagneticButton>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary/50 hover:bg-primary/10"
                    asChild
                  >
                    <a href="https://enablerhq.com" target="_blank" rel="noopener noreferrer">
                      <Globe className="mr-2 h-5 w-5" />
                      enablerhq.com
                    </a>
                  </Button>
                </MagneticButton>
              </motion.div>
            </motion.div>
          </AnimatedSection>

          {/* Projects Grid */}
          <AnimatedSection delay={0.2}>
            <div className="relative">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div 
                className="relative glass rounded-3xl p-8"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-xl font-semibold mb-6 text-foreground">
                  その他のプロジェクト
                </h3>
                <motion.div 
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {[
                    { href: "https://retty.me/area/PRE13/ARE14/SUB1402/100001732246/", title: "焼肉古今", role: "オーナー", desc: "2024年2月オープン。西麻布の高級焼肉店。全席完全個室。" },
                    { href: "https://notahotel.com/", title: "NOT A HOTEL", role: "共同創業者・元取締役・現株主" },
                    { href: "https://newt.net/", title: "令和トラベル（NEWT）", role: "社外取締役・株主" },
                    { href: "https://giftmall.co.jp/", title: "ギフトモール", role: "元社外取締役" },
                  ].map((item, index) => (
                    <motion.a
                      key={item.title}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-xl border border-border hover:border-primary/50 transition-all"
                      variants={cardVariants}
                      whileHover={{ 
                        scale: 1.02, 
                        y: -5,
                        boxShadow: "0 20px 40px -15px hsl(262 83% 58% / 0.2)"
                      }}
                    >
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.role}</p>
                      {item.desc && (
                        <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                      )}
                    </motion.a>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default EnablerSection;
