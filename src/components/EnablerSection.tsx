import { motion } from 'framer-motion';
import { Globe, Users, Zap, Home, Banknote, Award, ArrowRight } from 'lucide-react';
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

  const services = [
    {
      icon: Home,
      title: 'enabler.fun',
      subtitle: '高級バケーションレンタル',
      description: '心が動かされるロケーションに、感性を刺激する空間を創ります。',
      features: ['熱海・鎌倉など国内人気エリア', '完全プライベート空間', 'Airbnb連携'],
      href: 'https://enabler.fun',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Banknote,
      title: 'banto.work',
      subtitle: '建設業向け請求書・即払いアプリ',
      description: '現場が終わった瞬間、明日には金が入る。職人のための即払いアプリ。',
      features: ['最短60分〜翌日入金', '手数料3%〜', '音声入力対応'],
      href: 'https://banto.work',
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: Award,
      title: 'jiuflow.art',
      subtitle: 'ブラジリアン柔術オンライン学習',
      description: '「安全で、長く、そして強い」一生モノの柔術を、あなたに。',
      features: ['世界チャンピオン監修', '上面からの4K撮影', '体系的なカリキュラム'],
      href: 'https://jiuflow.art',
      color: 'from-violet-500 to-purple-600',
    },
  ];

  return (
    <section id="enabler" className="section-padding bg-background relative overflow-hidden">
      {/* Hero Section */}
      <div className="container mx-auto px-6 mb-24">
        <AnimatedSection>
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="gradient-text">ノイズを消せ。</span>
              <br />
              <span className="text-foreground">最短距離で、熱狂せよ。</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8"
            >
              生きるための「雑務」は、テクノロジーに任せればいい。
              <br />
              あなたが人生の主役に戻るための、3つのインフラストラクチャー。
            </motion.p>
          </motion.div>
        </AnimatedSection>
      </div>

      {/* Philosophy Section */}
      <div className="container mx-auto px-6 mb-24">
        <AnimatedSection>
          <motion.div 
            className="glass rounded-3xl p-8 md:p-12 max-w-4xl mx-auto text-center"
            whileHover={{ scale: 1.01 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              人生は短い。だから、遠回りはさせない。
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              お金の不安、都市の閉塞感、自己流の停滞。
              <br />
              あなたのポテンシャルを蝕む「摩擦（ノイズ）」を、
              私たちが極限までゼロにする。
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                className="text-center"
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Earn Fast</h3>
                <p className="text-sm text-muted-foreground">
                  働いた対価は、即座に手元へ。
                  <br />
                  職人の明日を守る、建設フィンテック。
                </p>
              </motion.div>
              
              <motion.div 
                className="text-center"
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Home className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Reset Deep</h3>
                <p className="text-sm text-muted-foreground">
                  枯れた感性を、一瞬で潤す。
                  <br />
                  心を解放する、極上のバケーションレンタル。
                </p>
              </motion.div>
              
              <motion.div 
                className="text-center"
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-violet-500" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Grow Strong</h3>
                <p className="text-sm text-muted-foreground">
                  一生モノの強さを、最速でインストールする。
                  <br />
                  世界基準の知恵を届ける、柔術エデュテック。
                </p>
              </motion.div>
            </div>
          </motion.div>
        </AnimatedSection>
      </div>

      {/* Services Section */}
      <div className="container mx-auto px-6 mb-24">
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              3つの事業領域
            </h2>
            <p className="text-muted-foreground">
              ライフスタイル・フィンテック・エデュテックの各領域で、
              人々の生活を豊かにするサービスを提供しています。
            </p>
          </div>
        </AnimatedSection>

        <motion.div 
          className="grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {services.map((service, index) => (
            <motion.a
              key={service.title}
              href={service.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group glass rounded-2xl p-6 transition-all hover:border-primary/50 block"
              variants={cardVariants}
              whileHover={{ 
                y: -10, 
                scale: 1.02,
                boxShadow: "0 20px 40px -15px hsl(var(--primary) / 0.2)"
              }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                <service.icon className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-1">{service.title}</h3>
              <p className="text-sm text-primary mb-3">{service.subtitle}</p>
              <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
              
              <ul className="space-y-2 mb-4">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all">
                サービスを見る
                <ArrowRight className="h-4 w-4" />
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>

      {/* Vision Section */}
      <div className="container mx-auto px-6 mb-24">
        <AnimatedSection>
          <motion.div 
            className="glass rounded-3xl p-8 md:p-12 text-center"
            whileHover={{ scale: 1.01 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              もっと自由に、もっと素直に。
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              イネブラは、あなたの人生を「本質」だけで満たすための
              <br />
              舞台装置（<span className="text-primary font-semibold">Enabler</span>）です。
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <MagneticButton>
                <Button
                  size="lg"
                  className="gradient-bg text-primary-foreground hover:opacity-90 glow-primary"
                  asChild
                >
                  <a href="https://enablerhq.com" target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-2 h-5 w-5" />
                    enablerhq.com
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
                  <a href="https://www.patreon.com/paradisecreator/" target="_blank" rel="noopener noreferrer">
                    <Users className="mr-2 h-5 w-5" />
                    Patreonで参加
                  </a>
                </Button>
              </MagneticButton>
            </div>
          </motion.div>
        </AnimatedSection>
      </div>

      {/* Other Projects */}
      <div className="container mx-auto px-6">
        <AnimatedSection delay={0.2}>
          <div className="max-w-3xl mx-auto">
            <motion.div 
              className="glass rounded-3xl p-8"
              whileHover={{ scale: 1.01 }}
            >
              <h3 className="text-xl font-semibold mb-6 text-foreground">
                その他のプロジェクト
              </h3>
              <motion.div 
                className="grid md:grid-cols-2 gap-4"
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
                ].map((item) => (
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
                      boxShadow: "0 20px 40px -15px hsl(var(--primary) / 0.2)"
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
    </section>
  );
};

export default EnablerSection;
