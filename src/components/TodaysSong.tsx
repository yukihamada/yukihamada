import { motion } from 'framer-motion';
import { Play, Music, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import albumFreeToChange from '@/assets/album-free-to-change.jpg';

const TodaysSong = () => {
  const { language } = useLanguage();

  const playFreeToChange = () => {
    window.dispatchEvent(new CustomEvent('playSpecificTrack', { detail: { trackIndex: 0 } }));
  };

  return (
    <motion.div
      className="fixed bottom-24 left-6 z-40"
      initial={{ opacity: 0, x: -50, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: 2, duration: 0.5, type: 'spring' }}
    >
      <motion.div
        className="relative group cursor-pointer"
        onClick={playFreeToChange}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/30 to-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative flex items-center gap-3 p-3 pr-5 rounded-2xl bg-background/80 backdrop-blur-xl border border-border/50 shadow-xl">
          {/* Album art */}
          <div className="relative">
            <motion.img
              src={albumFreeToChange}
              alt="Free to Change"
              className="w-14 h-14 rounded-xl object-cover shadow-lg"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
          </div>
          
          {/* Text */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1 mb-0.5">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-medium text-primary uppercase tracking-wider">
                {language === 'ja' ? "今日の曲" : "Today's Song"}
              </span>
            </div>
            <span className="text-sm font-bold text-foreground">Free to Change</span>
            <span className="text-xs text-muted-foreground">
              {language === 'ja' ? 'みんな変わろうぜ、自由にね 🎵' : "Let's all change, freely 🎵"}
            </span>
          </div>
        </div>
        
        {/* Pulse animation */}
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </motion.div>
  );
};

export default TodaysSong;
