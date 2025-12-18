import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <motion.div 
      className="flex items-center gap-1 bg-secondary/50 rounded-full p-1"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
          language === 'en' 
            ? 'bg-primary text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        EN
      </motion.button>
      <motion.button
        onClick={() => setLanguage('ja')}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
          language === 'ja' 
            ? 'bg-primary text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        日本語
      </motion.button>
    </motion.div>
  );
};

export default LanguageSwitcher;
