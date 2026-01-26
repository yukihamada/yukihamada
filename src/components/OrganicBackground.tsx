import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useScroll, useTransform } from 'framer-motion';

const OrganicBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 100 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Parallax scroll effect
  const { scrollYProgress } = useScroll();
  const parallaxY1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const parallaxY2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const parallaxY3 = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX / innerWidth) * 100);
      mouseY.set((clientY / innerHeight) * 100);
      setMousePosition({ x: clientX, y: clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden -z-10" style={{ perspective: 2000 }}>
      
      {/* Distant layer (Background) - slowest parallax */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: parallaxY1, z: -200 }}
      >
        <motion.div
          className="absolute w-[1000px] h-[1000px] rounded-full bg-primary/10 blur-[150px]"
          style={{
            left: '-20%',
            top: '-10%',
          }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            scale: { duration: 15, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 60, repeat: Infinity, ease: "linear" },
          }}
        />
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full bg-accent/8 blur-[120px]"
          style={{
            right: '-15%',
            bottom: '10%',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, 100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Middle layer - medium parallax */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: parallaxY2, z: -100 }}
      >
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full bg-primary/15 blur-[100px]"
          style={{
            x: smoothMouseX,
            y: smoothMouseY,
            left: '10%',
            top: '20%',
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          }}
        />
        
        <motion.div
          className="absolute right-0 top-1/4 w-[500px] h-[500px] rounded-full bg-accent/12 blur-[80px]"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Near layer (Foreground) - fastest parallax, follows mouse more */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: parallaxY3, z: 0 }}
      >
        <motion.div
          className="absolute left-1/4 bottom-0 w-[400px] h-[400px] rounded-full bg-primary/8 blur-[60px]"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* 3D Floating orbs with depth */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 20}%`,
              width: `${8 + (i % 3) * 4}px`,
              height: `${8 + (i % 3) * 4}px`,
              background: i % 2 === 0 
                ? 'hsl(var(--primary) / 0.4)' 
                : 'hsl(var(--accent) / 0.3)',
              boxShadow: '0 0 20px hsl(var(--primary) / 0.3)',
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 20, 0],
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.7, 0.3],
              z: [0, 30, 0],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}

        {/* Premium glass orbs */}
        <motion.div
          className="absolute w-32 h-32 rounded-full glass-premium"
          style={{
            left: '70%',
            top: '60%',
            opacity: 0.3,
          }}
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          className="absolute w-20 h-20 rounded-full glass-premium"
          style={{
            left: '20%',
            top: '70%',
            opacity: 0.25,
          }}
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </motion.div>

      {/* Gradient mesh overlay with depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background opacity-60" />
      
      {/* Subtle noise texture for depth */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default OrganicBackground;
