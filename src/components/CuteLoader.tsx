import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const loadingMessages = {
  ja: [
    "システム起動中... 🚀",
    "データをダウンロード中... 📡",
    "世界を構築中... 🌍",
    "AIを覚醒中... 🤖",
    "レベルをロード中... 🎮",
    "次元を接続中... ✨",
    "マトリックスに接続中... 💫",
  ],
  en: [
    "Booting system... 🚀",
    "Downloading data... 📡",
    "Building world... 🌍",
    "Awakening AI... 🤖",
    "Loading level... 🎮",
    "Connecting dimensions... ✨",
    "Entering the matrix... 💫",
  ]
};

// Export animation variants for exit animation
export const loaderVariants = {
  initial: { opacity: 1, scale: 1 },
  exit: {
    opacity: 0,
    scale: 1.5,
    filter: "blur(20px)",
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    }
  }
};

const CuteLoader = () => {
  const { language } = useLanguage();
  const messages = loadingMessages[language === 'ja' ? 'ja' : 'en'];
  const [messageIndex, setMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [progress, setProgress] = useState(0);
  
  const currentMessage = messages[messageIndex];

  // Typing animation effect
  useEffect(() => {
    setDisplayedText('');
    let charIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (charIndex < currentMessage.length) {
        setDisplayedText(currentMessage.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        // Wait a bit then move to next message
        setTimeout(() => {
          setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 1500);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [messageIndex, currentMessage, messages.length]);

  // Progress animation
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + Math.random() * 3 + 1;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, []);

  const displayProgress = Math.min(Math.round(progress), 100);

  return (
    <motion.div 
      className="min-h-screen bg-background flex flex-col items-center justify-center gap-8 relative overflow-hidden fixed inset-0 z-50"
      variants={loaderVariants}
      initial="initial"
      exit="exit"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite',
          }}
        />
      </div>

      {/* Glowing orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full blur-3xl"
        style={{ background: 'hsl(var(--primary) / 0.2)' }}
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -50, 100, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full blur-3xl"
        style={{ background: 'hsl(var(--accent) / 0.15)' }}
        animate={{
          x: [0, -80, 60, 0],
          y: [0, 80, -40, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main loader container */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Hexagon loader */}
        <div className="relative w-32 h-32">
          {/* Outer spinning ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            style={{ borderTopColor: 'hsl(var(--primary))' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Middle spinning ring (opposite direction) */}
          <motion.div
            className="absolute inset-3 rounded-full border-2 border-primary/20"
            style={{ borderBottomColor: 'hsl(var(--primary) / 0.7)' }}
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner pulsing core */}
          <motion.div
            className="absolute inset-6 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 backdrop-blur-sm"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Center percentage */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="text-lg font-mono font-bold text-primary">
              {displayProgress}%
            </span>
          </motion.div>
        </div>

        {/* Progress bar with percentage */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-64 h-2 bg-muted rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full"
              style={{ width: `${displayProgress}%` }}
              transition={{ duration: 0.1 }}
            />
            {/* Glowing effect on progress bar */}
            <motion.div
              className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: [-32, 256] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {language === 'ja' ? '読み込み中' : 'Loading'} {displayProgress}%
          </span>
        </div>

        {/* Loading message with typing animation */}
        <motion.div 
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="h-8 flex items-center">
            <p className="text-lg font-mono font-medium text-foreground tracking-wider">
              {displayedText}
              <motion.span
                className="inline-block w-0.5 h-5 bg-primary ml-1"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            </p>
          </div>
          
          {/* Typing indicator dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Game-style stats */}
        <motion.div 
          className="flex gap-6 text-xs font-mono text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="flex items-center gap-1">
            <span className="text-primary">●</span> CPU: 
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              87%
            </motion.span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-green-500">●</span> RAM: 
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              2.4GB
            </motion.span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-yellow-500">●</span> NET: 
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              128ms
            </motion.span>
          </span>
        </motion.div>
      </div>

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/50"
          style={{
            left: `${10 + (i * 7)}%`,
            top: `${20 + (i % 4) * 20}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 3 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Scanline effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground)) 2px, hsl(var(--foreground)) 4px)',
        }}
      />

      {/* CSS for grid animation */}
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </motion.div>
  );
};

export default CuteLoader;
