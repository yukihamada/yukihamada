import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, ExternalLink, Play, Music2, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MagneticButton from '@/components/MagneticButton';
import profileImage from '@/assets/yuki-profile.jpg';

// Roles with intentional typos that will be corrected
const rolesWithTypos = [
  { text: 'ポーカープレイヤー', typos: [{ at: 5, wrong: 'イ', correct: 'イヤ' }] },
  { text: '柔術家', typos: [] },
  { text: '愛犬家', typos: [{ at: 2, wrong: '権', correct: '犬' }] },
  { text: 'ギタリスト', typos: [{ at: 3, wrong: 'リルト', correct: 'リスト' }] },
  { text: 'アーティスト', typos: [] },
  { text: '起業家', typos: [] },
  { text: 'エンジェル投資家', typos: [{ at: 6, wrong: '当', correct: '投' }] },
];

interface HeroSectionProps {
  onMusicPlay?: () => void;
}

const HeroSection = ({ onMusicPlay }: HeroSectionProps) => {
  const [currentRole, setCurrentRole] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTypingMistake, setIsTypingMistake] = useState(false);
  const [isMusicHovered, setIsMusicHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  // Typewriter effect with typos
  useEffect(() => {
    const roleData = rolesWithTypos[currentRole];
    const targetText = roleData.text;
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < targetText.length) {
          const nextCharIndex = displayText.length;
          
          // Check if we should make a typo
          const typo = roleData.typos.find(t => t.at === nextCharIndex);
          
          if (typo && !isTypingMistake && Math.random() > 0.3) {
            // Make a typo
            setDisplayText(displayText + typo.wrong);
            setIsTypingMistake(true);
          } else if (isTypingMistake) {
            // Correct the typo - delete last character
            setDisplayText(displayText.slice(0, -1));
            setIsTypingMistake(false);
          } else {
            // Normal typing
            setDisplayText(targetText.slice(0, displayText.length + 1));
          }
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentRole((prev) => (prev + 1) % rolesWithTypos.length);
        }
      }
    }, isDeleting ? 40 : isTypingMistake ? 150 : 120);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentRole, isTypingMistake]);

  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Music Play Button - Floating */}
      <motion.button
        onClick={onMusicPlay}
        onMouseEnter={() => setIsMusicHovered(true)}
        onMouseLeave={() => setIsMusicHovered(false)}
        className="fixed top-24 right-6 z-40 group"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <motion.div 
          className="relative"
          animate={{ 
            scale: isMusicHovered ? 1.1 : 1,
          }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {/* Pulsing rings */}
          <motion.div 
            className="absolute inset-0 rounded-full bg-primary/20"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div 
            className="absolute inset-0 rounded-full bg-primary/30"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.6, 0, 0.6]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
          
          {/* Main button */}
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30 border border-white/20 overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/10 to-white/20"
              animate={{ y: ['100%', '-100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              animate={{ rotate: isMusicHovered ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {isMusicHovered ? (
                <Headphones className="h-6 w-6 text-primary-foreground" />
              ) : (
                <Music2 className="h-6 w-6 text-primary-foreground" />
              )}
            </motion.div>
          </div>
          
          {/* Label */}
          <motion.div
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
            initial={{ opacity: 0, x: 10 }}
            animate={{ 
              opacity: isMusicHovered ? 1 : 0,
              x: isMusicHovered ? 0 : 10
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-background/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-lg">
              <span className="text-sm font-medium text-foreground flex items-center gap-2">
                <Play className="h-3 w-3 fill-current" />
                音楽を聴く
              </span>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Floating music notes */}
        <motion.div
          className="absolute -top-2 -left-2 text-primary/60"
          animate={{ 
            y: [-5, -15, -5],
            x: [-2, 2, -2],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ♪
        </motion.div>
        <motion.div
          className="absolute -bottom-1 -right-3 text-primary/40"
          animate={{ 
            y: [5, -5, 5],
            x: [2, -2, 2],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        >
          ♫
        </motion.div>
      </motion.button>

      <motion.div 
        className="relative z-20 container mx-auto px-6 text-center"
        style={{ y, opacity, scale }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Profile Image */}
          <motion.div variants={itemVariants} className="mb-8">
            <MagneticButton>
              <motion.div 
                className="relative inline-block"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-primary/30 shadow-2xl mx-auto"
                  animate={{
                    boxShadow: [
                      "0 0 30px hsl(var(--primary) / 0.3)",
                      "0 0 60px hsl(var(--primary) / 0.5)",
                      "0 0 30px hsl(var(--primary) / 0.3)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <img 
                    src={profileImage} 
                    alt="濱田優貴" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.div 
                  className="absolute -inset-2 rounded-full border border-primary/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute -inset-4 rounded-full border border-accent/10"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </MagneticButton>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
          >
            <motion.span 
              className="text-foreground inline-block"
              whileHover={{ scale: 1.05, color: "hsl(var(--primary))" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              濱田
            </motion.span>{' '}
            <motion.span 
              className="gradient-text inline-block"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              優貴
            </motion.span>
          </motion.h1>

          <motion.div 
            variants={itemVariants}
            className="h-16 md:h-20 flex items-center justify-center mb-8"
          >
            <span className="text-2xl md:text-4xl text-muted-foreground font-medium">
              {displayText}
              <motion.span 
                className="inline-block w-1 h-8 md:h-10 bg-primary ml-1 rounded-full"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            </span>
          </motion.div>

          <motion.p 
            variants={itemVariants}
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            株式会社イネブラ 代表取締役CEO
            <br className="hidden md:block" />
            元メルカリCPO・CINO・取締役
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <MagneticButton>
              <Button
                size="lg"
                className="gradient-bg text-primary-foreground hover:opacity-90 transition-all glow-primary px-8 py-6 text-lg group"
                onClick={() => document.getElementById('enabler')?.scrollIntoView({ behavior: 'smooth' })}
              >
                イネブラを見る
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ExternalLink className="h-5 w-5" />
                </motion.span>
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/50 text-foreground hover:bg-primary/10 px-8 py-6 text-lg"
                asChild
              >
                <a href="https://www.patreon.com/paradisecreator/" target="_blank" rel="noopener noreferrer">
                  Patreonに参加
                </a>
              </Button>
            </MagneticButton>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-muted-foreground hover:text-foreground transition-colors"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        whileHover={{ scale: 1.2 }}
      >
        <ChevronDown className="h-8 w-8" />
      </motion.button>
    </section>
  );
};

export default HeroSection;
