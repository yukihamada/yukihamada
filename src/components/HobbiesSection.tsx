import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Dumbbell, Spade, Guitar, ExternalLink, Heart } from 'lucide-react';

const hobbies = [
  {
    name: '柔術',
    icon: Dumbbell,
    description: 'IBJJFワールドマスター ライトフェザー マスター3 青帯銅メダル獲得',
    detail: '2024年から開始。SJJJFの大会に参加中。来年はマスターズのラスベガス大会への参加を予定。心身を鍛え、集中力を高める格闘技。',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    links: [],
    stats: [{ label: '帯', value: '青帯' }, { label: '実績', value: '世界大会銅メダル' }],
  },
  {
    name: 'ポーカー',
    icon: Spade,
    description: 'WSOP、EPT、APTで入賞。日本賞金ランキング2023年度100位',
    detail: '15年以上の経験。確率と心理戦。ビジネスにも通じる意思決定スキルを磨く。2023年度日本賞金獲得ランキング100位ランクイン。',
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-500/10',
    links: [
      { name: 'Global Poker Index', url: 'https://www.globalpokerindex.com/poker-players/yuki-hamata-1483674/' },
      { name: 'The Hendon Mob', url: 'https://pokerdb.thehendonmob.com/player.php?a=r&n=1137313' },
    ],
    stats: [{ label: '経験年数', value: '15年+' }, { label: '2023ランキング', value: '日本100位' }],
  },
  {
    name: 'ギター',
    icon: Guitar,
    description: '主にアコースティックギター。',
    detail: 'メルカリで購入したMartin D-45（2002年製）を愛用。音楽で創造性を表現。',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    links: [],
    stats: [{ label: '愛用ギター', value: 'Martin D-45' }, { label: '年式', value: '2002年' }],
  },
];

const HobbiesSection = () => {
  const [activeHobby, setActiveHobby] = useState<number | null>(null);
  const [clickedHobby, setClickedHobby] = useState<number | null>(null);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });

  return (
    <section id="hobbies" className="section-padding bg-background relative overflow-hidden">
      {/* Animated background */}
      <motion.div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-primary/5 to-transparent"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      
      {/* Floating hearts */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/20"
          style={{
            left: `${10 + i * 20}%`,
            bottom: '20%',
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.5, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{ 
            duration: 4 + i, 
            repeat: Infinity,
            delay: i * 0.8 
          }}
        >
          <Heart className="h-6 w-6 fill-current" />
        </motion.div>
      ))}
      
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
            Personal Life
          </motion.p>
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            趣味<span className="gradient-text">& ライフスタイル</span>
          </motion.h2>
          <motion.p 
            className="text-muted-foreground mt-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            仕事以外の時間も大切に。心身のバランスを保つための活動。
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {hobbies.map((hobby, index) => {
            const Icon = hobby.icon;
            const isActive = activeHobby === index;
            const isClicked = clickedHobby === index;

            return (
              <motion.div
                key={hobby.name}
                className="group relative perspective-1000"
                onMouseEnter={() => setActiveHobby(index)}
                onMouseLeave={() => setActiveHobby(null)}
                onClick={() => setClickedHobby(isClicked ? null : index)}
                initial={{ opacity: 0, y: 40, rotateX: 20 }}
                animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                transition={{ delay: index * 0.15, duration: 0.6 }}
              >
                <motion.div
                  className={`glass rounded-3xl p-8 text-center cursor-pointer h-full relative overflow-hidden ${hobby.bgColor}`}
                  animate={{
                    scale: isActive ? 1.05 : 1,
                    rotateY: isActive ? 5 : 0,
                    z: isActive ? 50 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{
                    boxShadow: isActive
                      ? '0 30px 60px -15px rgba(139, 92, 246, 0.35)'
                      : '0 4px 20px -5px rgba(0, 0, 0, 0.1)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Animated background gradient */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${hobby.color} opacity-0`}
                    animate={{ opacity: isActive ? 0.1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: isActive ? '100%' : '-100%' }}
                    transition={{ duration: 0.8 }}
                  />

                  {/* Icon container */}
                  <motion.div
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-gradient-to-br ${hobby.color} relative`}
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      rotate: isActive ? [0, -5, 5, 0] : 0,
                      y: isActive ? -10 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className="h-10 w-10 text-white relative z-10" />
                    
                    {/* Glow effect */}
                    <motion.div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${hobby.color} blur-xl`}
                      animate={{ 
                        opacity: isActive ? 0.6 : 0,
                        scale: isActive ? 1.5 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>

                  <motion.h3 
                    className="text-2xl font-bold text-foreground mb-3 relative z-10"
                    animate={{ 
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -5 : 0,
                    }}
                  >
                    {hobby.name}
                  </motion.h3>

                  <AnimatePresence mode="wait">
                    <motion.p
                      key={isActive ? 'detail' : 'description'}
                      className="text-muted-foreground leading-relaxed text-sm relative z-10"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isActive ? hobby.detail : hobby.description}
                    </motion.p>
                  </AnimatePresence>

                  {/* Stats */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        className="mt-4 flex justify-center gap-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        {hobby.stats.map((stat, i) => (
                          <div key={stat.label} className="text-center">
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                            <p className="text-sm font-bold text-primary">{stat.value}</p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Links */}
                  <AnimatePresence>
                    {hobby.links.length > 0 && isActive && (
                      <motion.div 
                        className="mt-4 flex flex-wrap gap-2 justify-center relative z-10"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {hobby.links.map((link) => (
                          <motion.a
                            key={link.name}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline bg-primary/10 px-3 py-1 rounded-full"
                            whileHover={{ scale: 1.05, backgroundColor: "hsl(var(--primary) / 0.2)" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {link.name}
                            <ExternalLink className="h-3 w-3" />
                          </motion.a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Hover indicator */}
                  <motion.div
                    className={`mt-6 h-1 rounded-full bg-gradient-to-r ${hobby.color} mx-auto relative z-10`}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{
                      width: isActive ? "100%" : 0,
                      opacity: isActive ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
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

export default HobbiesSection;
