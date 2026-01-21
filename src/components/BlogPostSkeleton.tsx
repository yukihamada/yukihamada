import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';

const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

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

interface BlogPostSkeletonProps {
  progress?: number; // 0-100, if provided syncs with actual loading
}

const BlogPostSkeleton = ({ progress: externalProgress }: BlogPostSkeletonProps) => {
  const { language } = useLanguage();
  const messages = loadingMessages[language === 'ja' ? 'ja' : 'en'];
  const [messageIndex, setMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [internalProgress, setInternalProgress] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  
  // Use external progress if provided, otherwise use internal simulation
  const progress = externalProgress !== undefined ? externalProgress : internalProgress;
  
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
        setTimeout(() => {
          setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 1500);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [messageIndex, currentMessage, messages.length]);

  // Internal progress simulation (only when no external progress)
  useEffect(() => {
    if (externalProgress !== undefined) return;
    
    const progressInterval = setInterval(() => {
      setInternalProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 2 + 0.5;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [externalProgress]);

  // Hide overlay when progress reaches 100
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => setShowOverlay(false), 300);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  const displayProgress = Math.min(Math.round(progress), 100);
  
  return (
    <motion.div 
      className="min-h-screen bg-background relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Game-style Loading Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div 
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0, 
              scale: 1.5,
              filter: "blur(20px)",
            }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Animated grid background */}
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
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                  style={{ borderTopColor: 'hsl(var(--primary))' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-3 rounded-full border-2 border-primary/20"
                  style={{ borderBottomColor: 'hsl(var(--primary) / 0.7)' }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-6 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 backdrop-blur-sm"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-mono font-bold text-primary">{displayProgress}%</span>
                </motion.div>
              </div>

              {/* Progress bar */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-64 h-2 bg-muted rounded-full overflow-hidden relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full"
                    style={{ width: `${displayProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
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
              <motion.div className="flex flex-col items-center gap-3">
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
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Game-style stats */}
              <motion.div className="flex gap-6 text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="text-primary">●</span> CPU: 
                  <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }}>87%</motion.span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-green-500">●</span> RAM: 
                  <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity }}>2.4GB</motion.span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-yellow-500">●</span> NET: 
                  <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.8, repeat: Infinity }}>128ms</motion.span>
                </span>
              </motion.div>
            </div>

            {/* Floating particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-primary/50"
                style={{ left: `${10 + (i * 7)}%`, top: `${20 + (i % 4) * 20}%` }}
                animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [0.2, 0.8, 0.2], scale: [0.5, 1.5, 0.5] }}
                transition={{ duration: 3 + i * 0.3, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              />
            ))}

            {/* Scanline effect */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.02]"
              style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground)) 2px, hsl(var(--foreground)) 4px)' }}
            />

            <style>{`
              @keyframes gridMove {
                0% { transform: translate(0, 0); }
                100% { transform: translate(50px, 50px); }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Navigation skeleton */}
      <div className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-20 hidden md:block" />
            <Skeleton className="h-8 w-20 hidden md:block" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      {/* Hero section skeleton */}
      <div className="relative pt-12 pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-4 w-16" />
            <span className="text-muted-foreground">/</span>
            <Skeleton className="h-4 w-24" />
          </div>
          
          {/* Category & Date */}
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          {/* Title */}
          <div className="space-y-3 mb-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4" />
          </div>
          
          {/* Author info */}
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          
          {/* Featured image skeleton */}
          <motion.div 
            className="relative aspect-video rounded-2xl overflow-hidden bg-muted mb-10"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.5) 50%, hsl(var(--muted)) 100%)',
              backgroundSize: '200% 100%',
            }}
            animate={shimmer.animate}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 max-w-4xl pb-20">
        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 space-y-6">
            {/* Summary box skeleton */}
            <motion.div 
              className="p-6 rounded-2xl border border-border/50 bg-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </motion.div>
            
            {/* Article content skeleton */}
            {[1, 2, 3].map((section, i) => (
              <motion.div 
                key={section}
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
              >
                {/* Section heading */}
                <div className="flex items-center gap-3 mt-8">
                  <div className="w-1 h-8 bg-primary/30 rounded-full" />
                  <Skeleton className="h-8 w-2/3" />
                </div>
                
                {/* Paragraphs */}
                <div className="space-y-3 pl-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-10/12" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-9/12" />
                </div>
                
                {/* Code block or table skeleton */}
                {i === 1 && (
                  <motion.div 
                    className="my-6 rounded-xl overflow-hidden border border-border/50"
                    style={{
                      background: 'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.5) 50%, hsl(var(--muted)) 100%)',
                      backgroundSize: '200% 100%',
                    }}
                    animate={shimmer.animate}
                  >
                    <div className="px-4 py-2 border-b border-border/30">
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </motion.div>
                )}
                
                {/* Image skeleton */}
                {i === 0 && (
                  <motion.div 
                    className="my-6 aspect-[16/10] rounded-xl overflow-hidden"
                    style={{
                      background: 'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.5) 50%, hsl(var(--muted)) 100%)',
                      backgroundSize: '200% 100%',
                    }}
                    animate={shimmer.animate}
                  />
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Sidebar skeleton (TOC) - hidden on mobile */}
          <motion.div 
            className="hidden lg:block w-64 flex-shrink-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="sticky top-24 p-4 rounded-xl border border-border/50 bg-card/50">
              <Skeleton className="h-5 w-24 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <Skeleton 
                    key={item} 
                    className="h-4" 
                    style={{ width: `${60 + Math.random() * 30}%` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Loading indicator */}
      <motion.div 
        className="fixed bottom-6 right-6 flex items-center gap-3 px-4 py-2 rounded-full bg-card border border-border/50 shadow-lg z-50"
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div 
          className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
        <span className="text-sm text-muted-foreground font-medium">
          {language === 'ja' ? '記事を読み込み中...' : 'Loading article...'}
        </span>
      </motion.div>
    </motion.div>
  );
};

export default BlogPostSkeleton;
