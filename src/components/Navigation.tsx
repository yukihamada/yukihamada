import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  const navLinks = [
    { name: t.nav.enabler, href: '#enabler', icon: '◆' },
    { name: t.nav.career, href: '#career', icon: '◈' },
    { name: t.nav.investments, href: '#investments', icon: '◇' },
    { name: t.nav.blog, href: '#blog', icon: '▣' },
    { name: t.nav.hobbies, href: '#hobbies', icon: '✦' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'py-2'
          : 'py-4'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
    >
      <div className="container mx-auto px-6">
        <motion.div 
          className={`flex items-center justify-between transition-all duration-500 ${
            isScrolled 
              ? 'bg-background/60 backdrop-blur-2xl border border-border/50 rounded-2xl px-6 py-3 shadow-lg shadow-primary/5' 
              : 'bg-transparent px-0 py-2'
          }`}
          layout
        >
          {/* Logo - Animated */}
          <motion.a 
            href="#" 
            className="flex items-center gap-3 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div 
              className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center overflow-hidden"
              whileHover={{ rotate: 5 }}
            >
              <span className="text-primary-foreground font-bold text-lg z-10">Y</span>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"
                animate={{ y: ['100%', '-100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight">
                <span className="text-foreground">Yuki</span>
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent ml-1">Hamada</span>
              </span>
              <span className="text-[9px] text-muted-foreground/70 tracking-[0.2em] font-medium">
                濱田優貴
              </span>
            </div>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <div className="flex items-center bg-secondary/30 backdrop-blur-sm rounded-full p-1 border border-border/30">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium transition-colors rounded-full"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {hoveredIndex === index && (
                    <motion.div
                      className="absolute inset-0 bg-primary/10 rounded-full"
                      layoutId="navHover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 flex items-center gap-1.5 ${
                    hoveredIndex === index ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    <span className="text-[10px] opacity-60">{link.icon}</span>
                    {link.name}
                  </span>
                </motion.a>
              ))}
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <LanguageSwitcher />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="sm"
                  className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 rounded-full px-5"
                  asChild
                >
                  <a href="https://www.patreon.com/paradisecreator/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Patreon</span>
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <LanguageSwitcher />
            <motion.button
              className="relative p-2.5 rounded-xl bg-secondary/50 text-foreground border border-border/30"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Mobile Menu - Full Screen Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden fixed inset-0 top-0 bg-background/98 backdrop-blur-xl z-[-1]"
            initial={{ opacity: 0, clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at calc(100% - 40px) 40px)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
            transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div className="container mx-auto px-6 pt-24 pb-8 h-full flex flex-col">
              <div className="flex-1 flex flex-col justify-center space-y-2">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    className="group flex items-center gap-4 py-4 border-b border-border/20"
                    onClick={() => setIsMobileMenuOpen(false)}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 + 0.2 }}
                  >
                    <span className="text-2xl text-primary/50 group-hover:text-primary transition-colors">
                      {link.icon}
                    </span>
                    <span className="text-2xl font-medium text-foreground group-hover:text-primary transition-colors">
                      {link.name}
                    </span>
                    <motion.span 
                      className="ml-auto text-muted-foreground/30 text-sm"
                      initial={{ x: 10, opacity: 0 }}
                      whileHover={{ x: 0, opacity: 1 }}
                    >
                      →
                    </motion.span>
                  </motion.a>
                ))}
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-8"
              >
                <Button
                  className="w-full h-14 text-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl"
                  asChild
                >
                  <a href="https://www.patreon.com/paradisecreator/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                    <Sparkles className="h-5 w-5" />
                    Support on Patreon
                  </a>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;
