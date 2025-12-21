import { useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const LivingGridBackground = () => {
  const [isVisible, setIsVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring animation for spotlight
  const springConfig = { damping: 25, stiffness: 150 };
  const spotlightX = useSpring(mouseX, springConfig);
  const spotlightY = useSpring(mouseY, springConfig);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }, [mouseX, mouseY]);

  useEffect(() => {
    setIsVisible(true);
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Base grid pattern */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: 'hsl(0 0% 4%)',
          backgroundImage: `
            linear-gradient(hsl(var(--grid-color)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--grid-color)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          backgroundAttachment: 'fixed',
        }}
      />
      
      {/* Spotlight effect following mouse */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          x: spotlightX,
          y: spotlightY,
          translateX: '-50%',
          translateY: '-50%',
          background: 'radial-gradient(circle, hsl(262 83% 58% / 0.08) 0%, hsl(280 70% 50% / 0.04) 30%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      
      {/* Secondary ambient glow */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          x: spotlightX,
          y: spotlightY,
          translateX: '-50%',
          translateY: '-50%',
          background: 'radial-gradient(circle, hsl(262 83% 58% / 0.12) 0%, transparent 60%)',
          filter: 'blur(20px)',
        }}
      />
      
      {/* Blinking cursor effect - positioned randomly */}
      <motion.div
        className="absolute w-2 h-6 bg-primary/60"
        initial={{ opacity: 0 }}
        animate={isVisible ? { 
          opacity: [0, 1, 1, 0],
        } : {}}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatDelay: 0.3,
        }}
        style={{
          left: '15%',
          top: '25%',
          boxShadow: '0 0 10px hsl(262 83% 58% / 0.5)',
        }}
      />
      
      <motion.div
        className="absolute w-2 h-6 bg-accent/40"
        initial={{ opacity: 0 }}
        animate={isVisible ? { 
          opacity: [0, 1, 1, 0],
        } : {}}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 0.8,
          delay: 0.5,
        }}
        style={{
          right: '20%',
          bottom: '30%',
          boxShadow: '0 0 10px hsl(280 70% 50% / 0.4)',
        }}
      />
      
      {/* Corner glow accents */}
      <div 
        className="absolute top-0 left-0 w-[500px] h-[500px] opacity-30"
        style={{
          background: 'radial-gradient(circle at top left, hsl(262 83% 58% / 0.15), transparent 60%)',
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-20"
        style={{
          background: 'radial-gradient(circle at bottom right, hsl(280 70% 50% / 0.15), transparent 60%)',
        }}
      />
    </div>
  );
};

export default LivingGridBackground;