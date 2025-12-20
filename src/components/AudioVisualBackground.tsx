import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { motion, AnimatePresence } from 'framer-motion';

const AudioVisualBackground = () => {
  const { isPlaying, analyzerData, currentColor } = useMusicPlayer();

  if (!isPlaying) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/90" />

        {/* Left side wave bars */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-center gap-1 opacity-30">
          {analyzerData.slice(0, 16).map((value, index) => (
            <motion.div
              key={`left-${index}`}
              className="h-1 rounded-r-full"
              style={{
                background: `linear-gradient(to right, ${currentColor}, ${currentColor}99, transparent)`,
              }}
              animate={{
                width: `${Math.max(20, value * 200)}px`,
              }}
              transition={{ duration: 0.1, ease: 'easeOut' }}
            />
          ))}
        </div>

        {/* Right side wave bars */}
        <div className="absolute right-0 top-0 h-full flex flex-col justify-center gap-1 opacity-30">
          {analyzerData.slice(0, 16).map((value, index) => (
            <motion.div
              key={`right-${index}`}
              className="h-1 rounded-l-full ml-auto"
              style={{
                background: `linear-gradient(to left, ${currentColor}, ${currentColor}99, transparent)`,
              }}
              animate={{
                width: `${Math.max(20, value * 200)}px`,
              }}
              transition={{ duration: 0.1, ease: 'easeOut' }}
            />
          ))}
        </div>

        {/* Bottom wave visualizer */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-[2px] px-4">
          {analyzerData.map((value, index) => (
            <motion.div
              key={`bottom-${index}`}
              className="flex-1 max-w-3 rounded-t-full"
              style={{
                background: `linear-gradient(to top, ${currentColor}80, ${currentColor}4d, transparent)`,
              }}
              animate={{
                height: `${Math.max(4, value * 150)}px`,
              }}
              transition={{ duration: 0.08, ease: 'easeOut' }}
            />
          ))}
        </div>

        {/* Floating orbs that pulse with the music */}
        {[...Array(5)].map((_, index) => {
          const avgValue = analyzerData.length > 0 
            ? analyzerData.slice(index * 10, (index + 1) * 10).reduce((a, b) => a + b, 0) / 10 
            : 0.2;
          
          return (
            <motion.div
              key={`orb-${index}`}
              className="absolute rounded-full blur-3xl"
              style={{
                left: `${15 + index * 18}%`,
                top: `${20 + (index % 3) * 25}%`,
                background: `radial-gradient(circle, ${currentColor}${Math.round((0.1 + avgValue * 0.3) * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
              }}
              animate={{
                width: `${100 + avgValue * 200}px`,
                height: `${100 + avgValue * 200}px`,
                opacity: 0.3 + avgValue * 0.4,
              }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            />
          );
        })}

        {/* Center pulsing ring */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ borderColor: `${currentColor}33`, borderWidth: '2px' }}
          animate={{
            width: [200, 300, 200],
            height: [200, 300, 200],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ borderColor: `${currentColor}1a`, borderWidth: '1px' }}
          animate={{
            width: [300, 450, 300],
            height: [300, 450, 300],
            opacity: [0.05, 0.2, 0.05],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.3,
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default AudioVisualBackground;
