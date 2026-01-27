import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ChevronDown, ExternalLink, Play, Music2, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MagneticButton from '@/components/MagneticButton';
import profileImage from '@/assets/yuki-profile.jpg';
import bichonFriseImage from '@/assets/bichon-frise.jpg';
import { useAuth } from '@/hooks/useAuth';
// Roles with intentional typos that will be corrected (typoAt: -1 means no typo)
const rolesWithTypos = [
  { text: 'ポーカープレイヤー', typoAt: -1, wrong: '', correctChar: '', bgEmoji: '🃏', bgImage: 'https://images.unsplash.com/photo-1541278107931-e006523892df?w=800&auto=format&fit=crop&q=60' },
  { text: '柔術家', typoAt: -1, wrong: '', correctChar: '', bgEmoji: '🥋', bgImage: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&auto=format&fit=crop&q=60' },
  { text: '愛犬家', typoAt: 1, wrong: '権', correctChar: '犬', bgEmoji: '🐕', bgImage: bichonFriseImage },
  { text: 'ギタリスト', typoAt: -1, wrong: '', correctChar: '', bgEmoji: '🎸', bgImage: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=60' },
  { text: 'アーティスト', typoAt: 4, wrong: 'ク', correctChar: 'ス', bgEmoji: '🎨', bgImage: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=60' },
  { text: '起業家', typoAt: -1, wrong: '', correctChar: '', bgEmoji: '🚀', bgImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=60' },
  { text: 'エンジェル投資家', typoAt: -1, wrong: '', correctChar: '', bgEmoji: '💰', bgImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60' },
];

type TypingState = 'typing' | 'typed-wrong' | 'deleting-wrong' | 'typing-correct' | 'waiting' | 'deleting';

interface HeroSectionProps {
  onMusicPlay?: () => void;
}

const HeroSection = ({ onMusicPlay }: HeroSectionProps) => {
  const [currentRole, setCurrentRole] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [typingState, setTypingState] = useState<TypingState>('typing');
  const [isMusicHovered, setIsMusicHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  
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
    
    const getDelay = () => {
      switch (typingState) {
        case 'typed-wrong': return 400; // Pause to "realize" mistake
        case 'deleting-wrong': return 100;
        case 'deleting': return 40;
        default: return 100;
      }
    };
    
    const timeout = setTimeout(() => {
      switch (typingState) {
        case 'typing': {
          if (displayText.length < targetText.length) {
            const nextIndex = displayText.length;
            
            // Check if this position should have a typo
            if (roleData.typoAt === nextIndex && Math.random() > 0.3) {
              // Type the wrong character
              setDisplayText(displayText + roleData.wrong);
              setTypingState('typed-wrong');
            } else {
              // Type correct character
              setDisplayText(displayText + targetText[nextIndex]);
            }
          } else {
            setTypingState('waiting');
          }
          break;
        }
        
        case 'typed-wrong': {
          // Start deleting the wrong character
          setTypingState('deleting-wrong');
          break;
        }
        
        case 'deleting-wrong': {
          // Delete the wrong character
          setDisplayText(displayText.slice(0, -1));
          setTypingState('typing-correct');
          break;
        }
        
        case 'typing-correct': {
          // Type the correct character
          const nextIndex = displayText.length;
          setDisplayText(displayText + targetText[nextIndex]);
          setTypingState('typing');
          break;
        }
        
        case 'waiting': {
          setTimeout(() => setTypingState('deleting'), 1500);
          break;
        }
        
        case 'deleting': {
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1));
          } else {
            setCurrentRole((prev) => (prev + 1) % rolesWithTypos.length);
            setTypingState('typing');
          }
          break;
        }
      }
    }, getDelay());

    return () => clearTimeout(timeout);
  }, [displayText, typingState, currentRole]);

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

      <motion.div 
        className="relative z-20 container mx-auto px-6 text-center"
        style={{ y, opacity, scale }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Profile Image with 3D Spatial Effect */}
          <motion.div variants={itemVariants} className="mb-8">
            <MagneticButton>
              <motion.div 
                className="relative inline-block glass-card-3d"
                whileHover={{ 
                  scale: 1.08,
                  rotateY: 10,
                  rotateX: -5,
                  z: 50,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Ambient glow behind profile */}
                <motion.div 
                  className="absolute -inset-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                
                <motion.div 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-primary/30 mx-auto relative glass-premium shadow-xl"
                  style={{ transform: 'translateZ(30px)' }}
                >
                  <img 
                    src={profileImage} 
                    alt="濱田優貴" 
                    className="w-full h-full object-cover"
                  />
                  {/* Premium shine overlay */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  />
                </motion.div>
                
                {/* Orbital rings with depth */}
                <motion.div 
                  className="absolute -inset-2 rounded-full border border-primary/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  style={{ transform: 'translateZ(10px)' }}
                />
                <motion.div 
                  className="absolute -inset-4 rounded-full border border-accent/20"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  style={{ transform: 'translateZ(5px)' }}
                />
                <motion.div 
                  className="absolute -inset-6 rounded-full border border-primary/10"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  style={{ transform: 'translateZ(0px)' }}
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

          {/* Background visualization for current role */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRole}
              className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: displayText.length > 0 ? 0.08 : 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8 }}
            >
              <img 
                src={rolesWithTypos[currentRole].bgImage} 
                alt=""
                className="w-full h-full object-cover blur-sm"
                fetchPriority={currentRole === 0 ? "high" : "auto"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background" />
            </motion.div>
          </AnimatePresence>

          {/* Floating emoji */}
          <AnimatePresence mode="wait">
            {displayText.length > 2 && (
              <motion.div
                key={`emoji-${currentRole}`}
                className="absolute top-1/4 right-1/4 text-6xl md:text-8xl pointer-events-none opacity-20"
                initial={{ opacity: 0, scale: 0, rotate: -20 }}
                animate={{ 
                  opacity: 0.15, 
                  scale: 1, 
                  rotate: 0,
                  y: [0, -10, 0]
                }}
                exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
                transition={{ 
                  duration: 0.5,
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                {rolesWithTypos[currentRole].bgEmoji}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            variants={itemVariants}
            className="h-16 md:h-20 flex items-center justify-center mb-8 relative"
          >
            <span className="text-2xl md:text-4xl text-muted-foreground font-medium">
              {displayText}
              <span className="inline-block w-1 h-8 md:h-10 bg-primary/60 ml-1 rounded-full" />
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
            {isAuthenticated && (
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
            )}
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
