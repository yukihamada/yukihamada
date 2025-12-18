import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Spade, Guitar, ExternalLink } from 'lucide-react';

const hobbies = [
  {
    name: '柔術',
    icon: Dumbbell,
    description: '2024年から開始。SJJJFの大会に参加中。',
    detail: '来年はマスターズのラスベガス大会への参加を予定。心身を鍛え、集中力を高める格闘技。',
    color: 'from-blue-500 to-cyan-500',
    links: [],
  },
  {
    name: 'ポーカー',
    icon: Spade,
    description: '15年以上の経験。WSOP、EPT、APTで入賞経験あり。',
    detail: '確率と心理戦。ビジネスにも通じる意思決定スキルを磨く。',
    color: 'from-red-500 to-orange-500',
    links: [
      { name: 'Global Poker Index', url: 'https://www.globalpokerindex.com/poker-players/yuki-hamata-1483674/' },
      { name: 'The Hendon Mob', url: 'https://pokerdb.thehendonmob.com/player.php?a=r&n=1137313' },
    ],
  },
  {
    name: 'ギター',
    icon: Guitar,
    description: '主にアコースティックギター。',
    detail: 'メルカリで購入したMartin D-45（2002年製）を愛用。音楽で創造性を表現。',
    color: 'from-purple-500 to-pink-500',
    links: [],
  },
];

const HobbiesSection = () => {
  const [activeHobby, setActiveHobby] = useState<number | null>(null);

  return (
    <section id="hobbies" className="section-padding bg-background relative overflow-hidden">
      <motion.div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-primary/5 to-transparent"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
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

            return (
              <motion.div
                key={hobby.name}
                className="group relative"
                onMouseEnter={() => setActiveHobby(index)}
                onMouseLeave={() => setActiveHobby(null)}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <motion.div
                  className="glass rounded-3xl p-8 text-center cursor-pointer h-full"
                  animate={{
                    scale: isActive ? 1.05 : 1,
                    boxShadow: isActive
                      ? '0 25px 50px -12px rgba(139, 92, 246, 0.25)'
                      : '0 0 0 0 transparent',
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Icon container */}
                  <motion.div
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-gradient-to-br ${hobby.color}`}
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      rotate: isActive ? 5 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                  >
                    <Icon className="h-10 w-10 text-white" />
                  </motion.div>

                  <motion.h3 
                    className="text-2xl font-bold text-foreground mb-3"
                    animate={{ scale: isActive ? 1.05 : 1 }}
                  >
                    {hobby.name}
                  </motion.h3>

                  <AnimatePresence mode="wait">
                    <motion.p
                      key={isActive ? 'detail' : 'description'}
                      className="text-muted-foreground leading-relaxed text-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isActive ? hobby.detail : hobby.description}
                    </motion.p>
                  </AnimatePresence>

                  {/* Links */}
                  <AnimatePresence>
                    {hobby.links.length > 0 && isActive && (
                      <motion.div 
                        className="mt-4 flex flex-wrap gap-2 justify-center"
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
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            whileHover={{ scale: 1.05 }}
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
                    className={`mt-6 h-1 rounded-full bg-gradient-to-r ${hobby.color} mx-auto`}
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
