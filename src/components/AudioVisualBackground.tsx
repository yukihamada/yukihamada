import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

// Generate random particles
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 2,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2,
  }));
};

const AudioVisualBackground = () => {
  const { isPlaying, analyzerData, currentColor } = useMusicPlayer();
  
  const particles = useMemo(() => generateParticles(50), []);
  const floatingOrbs = useMemo(() => generateParticles(8), []);

  if (!isPlaying) return null;

  const avgEnergy = analyzerData.length > 0 
    ? analyzerData.reduce((a, b) => a + b, 0) / analyzerData.length 
    : 0.2;

  const bassEnergy = analyzerData.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
  const midEnergy = analyzerData.slice(8, 24).reduce((a, b) => a + b, 0) / 16;
  const highEnergy = analyzerData.slice(24, 48).reduce((a, b) => a + b, 0) / 24;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Dynamic gradient background */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: `radial-gradient(ellipse at 50% 50%, ${currentColor}15 0%, transparent 50%), 
                        radial-gradient(ellipse at 20% 80%, ${currentColor}10 0%, transparent 40%),
                        radial-gradient(ellipse at 80% 20%, ${currentColor}10 0%, transparent 40%)`,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Floating particles */}
        {particles.map((particle) => (
          <motion.div
            key={`particle-${particle.id}`}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              width: particle.size,
              height: particle.size,
              background: `${currentColor}`,
              boxShadow: `0 0 ${particle.size * 2}px ${currentColor}`,
            }}
            animate={{
              y: [
                `${particle.y}vh`,
                `${particle.y - 30 - avgEnergy * 20}vh`,
                `${particle.y}vh`,
              ],
              opacity: [0.2, 0.8 * (0.5 + avgEnergy), 0.2],
              scale: [1, 1.5 + avgEnergy, 1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Left side wave bars - Enhanced */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-center gap-1">
          {analyzerData.slice(0, 20).map((value, index) => (
            <motion.div
              key={`left-${index}`}
              className="h-1.5 rounded-r-full"
              style={{
                background: `linear-gradient(to right, ${currentColor}, ${currentColor}80, transparent)`,
                boxShadow: `0 0 ${value * 20}px ${currentColor}80`,
              }}
              animate={{
                width: `${Math.max(30, value * 300)}px`,
                opacity: 0.4 + value * 0.6,
              }}
              transition={{ duration: 0.08, ease: 'easeOut' }}
            />
          ))}
        </div>

        {/* Right side wave bars - Enhanced */}
        <div className="absolute right-0 top-0 h-full flex flex-col justify-center gap-1">
          {analyzerData.slice(0, 20).map((value, index) => (
            <motion.div
              key={`right-${index}`}
              className="h-1.5 rounded-l-full ml-auto"
              style={{
                background: `linear-gradient(to left, ${currentColor}, ${currentColor}80, transparent)`,
                boxShadow: `0 0 ${value * 20}px ${currentColor}80`,
              }}
              animate={{
                width: `${Math.max(30, value * 300)}px`,
                opacity: 0.4 + value * 0.6,
              }}
              transition={{ duration: 0.08, ease: 'easeOut' }}
            />
          ))}
        </div>

        {/* Bottom wave visualizer - Enhanced */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-[2px] px-4">
          {analyzerData.map((value, index) => (
            <motion.div
              key={`bottom-${index}`}
              className="flex-1 max-w-4 rounded-t-full"
              style={{
                background: `linear-gradient(to top, ${currentColor}, ${currentColor}80, ${currentColor}40, transparent)`,
                boxShadow: `0 0 ${value * 15}px ${currentColor}60`,
              }}
              animate={{
                height: `${Math.max(8, value * 200)}px`,
              }}
              transition={{ duration: 0.06, ease: 'easeOut' }}
            />
          ))}
        </div>

        {/* Top wave visualizer */}
        <div className="absolute top-0 left-0 right-0 flex items-start justify-center gap-[2px] px-4">
          {analyzerData.slice().reverse().map((value, index) => (
            <motion.div
              key={`top-${index}`}
              className="flex-1 max-w-4 rounded-b-full"
              style={{
                background: `linear-gradient(to bottom, ${currentColor}, ${currentColor}60, transparent)`,
              }}
              animate={{
                height: `${Math.max(4, value * 100)}px`,
                opacity: 0.3 + value * 0.5,
              }}
              transition={{ duration: 0.06, ease: 'easeOut' }}
            />
          ))}
        </div>

        {/* Floating orbs that pulse with the music */}
        {floatingOrbs.map((orb, index) => {
          const orbEnergy = index < 3 ? bassEnergy : index < 6 ? midEnergy : highEnergy;
          
          return (
            <motion.div
              key={`orb-${orb.id}`}
              className="absolute rounded-full blur-3xl"
              style={{
                left: `${10 + orb.x * 0.8}%`,
                top: `${10 + orb.y * 0.8}%`,
                background: `radial-gradient(circle, ${currentColor}${Math.round((0.2 + orbEnergy * 0.5) * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
              }}
              animate={{
                width: `${120 + orbEnergy * 300}px`,
                height: `${120 + orbEnergy * 300}px`,
                opacity: 0.3 + orbEnergy * 0.5,
                x: [0, Math.sin(orb.delay) * 50, 0],
                y: [0, Math.cos(orb.delay) * 30, 0],
              }}
              transition={{ 
                duration: 0.15, 
                ease: 'easeOut',
                x: { duration: orb.duration, repeat: Infinity, ease: 'easeInOut' },
                y: { duration: orb.duration * 1.2, repeat: Infinity, ease: 'easeInOut' },
              }}
            />
          );
        })}

        {/* Center pulsing rings - Enhanced */}
        {[0, 1, 2].map((ringIndex) => (
          <motion.div
            key={`ring-${ringIndex}`}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ 
              borderColor: currentColor,
              borderWidth: '2px',
            }}
            animate={{
              width: [200 + ringIndex * 80, 350 + ringIndex * 100 + bassEnergy * 100, 200 + ringIndex * 80],
              height: [200 + ringIndex * 80, 350 + ringIndex * 100 + bassEnergy * 100, 200 + ringIndex * 80],
              opacity: [0.1, 0.3 + bassEnergy * 0.3, 0.1],
              borderWidth: ['2px', `${2 + bassEnergy * 3}px`, '2px'],
            }}
            transition={{
              duration: 1.5 + ringIndex * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: ringIndex * 0.2,
            }}
          />
        ))}

        {/* Starburst effect on bass hits */}
        {bassEnergy > 0.5 && (
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0.5, 0], scale: [0.5, 2] }}
            transition={{ duration: 0.3 }}
            style={{
              width: 400,
              height: 400,
              background: `radial-gradient(circle, ${currentColor}40 0%, transparent 60%)`,
              borderRadius: '50%',
            }}
          />
        )}

        {/* Corner accents */}
        <motion.div
          className="absolute top-0 left-0 w-48 h-48"
          style={{
            background: `radial-gradient(circle at 0% 0%, ${currentColor}20 0%, transparent 70%)`,
          }}
          animate={{
            opacity: 0.3 + midEnergy * 0.7,
            scale: 1 + midEnergy * 0.3,
          }}
          transition={{ duration: 0.1 }}
        />
        <motion.div
          className="absolute top-0 right-0 w-48 h-48"
          style={{
            background: `radial-gradient(circle at 100% 0%, ${currentColor}20 0%, transparent 70%)`,
          }}
          animate={{
            opacity: 0.3 + highEnergy * 0.7,
            scale: 1 + highEnergy * 0.3,
          }}
          transition={{ duration: 0.1 }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-48 h-48"
          style={{
            background: `radial-gradient(circle at 0% 100%, ${currentColor}20 0%, transparent 70%)`,
          }}
          animate={{
            opacity: 0.3 + bassEnergy * 0.7,
            scale: 1 + bassEnergy * 0.3,
          }}
          transition={{ duration: 0.1 }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-48 h-48"
          style={{
            background: `radial-gradient(circle at 100% 100%, ${currentColor}20 0%, transparent 70%)`,
          }}
          animate={{
            opacity: 0.3 + midEnergy * 0.7,
            scale: 1 + midEnergy * 0.3,
          }}
          transition={{ duration: 0.1 }}
        />

        {/* Radial gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/95" />
      </motion.div>
    </AnimatePresence>
  );
};

export default AudioVisualBackground;
