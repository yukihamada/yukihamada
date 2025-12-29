import { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, User, Users, ChevronDown, Briefcase, TrendingUp, BookOpen, Heart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useUIVisibility } from '@/contexts/UIVisibilityContext';
import { useAuth } from '@/hooks/useAuth';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();
  const { isPlaying, analyzerData } = useMusicPlayer();
  const { isUIVisible } = useUIVisibility();
  const { isAuthenticated, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isOnBlogPage = location.pathname.startsWith('/blog');
  const isHomePage = location.pathname === '/';
  
  // Don't hide nav when mobile menu is open or dropdown is active
  const shouldHide = !isUIVisible && !isMobileMenuOpen && !activeDropdown;

  // Grouped navigation
  const navGroups = {
    work: {
      label: language === 'ja' ? '仕事' : 'Work',
      icon: Briefcase,
      items: [
        { name: t.nav.enabler, href: '#enabler' },
        { name: t.nav.career, href: '#career' },
      ]
    },
    interests: {
      label: language === 'ja' ? '活動' : 'Activities',
      icon: Heart,
      items: [
        { name: t.nav.investments, href: '#investments' },
        { name: t.nav.hobbies, href: '#hobbies' },
      ]
    }
  };
  
  const singleLinks = [
    { name: t.nav.blog, href: '/blog', icon: BookOpen, isRoute: true },
  ];

  // Track scroll and active section
  useEffect(() => {
    const sections = ['enabler', 'career', 'investments', 'blog', 'hobbies'];
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
      setScrollProgress(Math.min(scrollY / 200, 1));
      
      // Find active section
      if (isHomePage) {
        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 150 && rect.bottom >= 150) {
              setActiveSection(section);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mini equalizer component for header
  const MiniEqualizer = () => (
    <div className="flex items-end justify-center gap-[2px] h-4">
      {analyzerData.slice(0, 5).map((value, index) => (
        <motion.div
          key={index}
          className="w-[3px] rounded-full bg-gradient-to-t from-primary to-primary/60"
          animate={{
            height: `${Math.max(4, value * 16)}px`,
          }}
          transition={{ duration: 0.05 }}
        />
      ))}
    </div>
  );

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ 
        y: shouldHide ? -100 : 0, 
        opacity: shouldHide ? 0 : 1 
      }}
      transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
      style={{
        paddingTop: `${16 - scrollProgress * 8}px`,
        paddingBottom: `${16 - scrollProgress * 8}px`,
        opacity: shouldHide ? 0 : Math.max(0.7, 1 - scrollProgress * 0.3),
      }}
    >
      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary via-primary/80 to-primary/60"
        style={{ width: `${scrollProgress * 100}%` }}
      />
      
      <div className="container mx-auto px-6">
        <motion.div 
          className="flex items-center justify-between transition-all duration-300"
          style={{
            backgroundColor: `hsl(var(--background) / ${0.6 * scrollProgress})`,
            backdropFilter: `blur(${scrollProgress * 24}px)`,
            borderRadius: `${scrollProgress * 16}px`,
            padding: `${12 + scrollProgress * 4}px ${scrollProgress * 24}px`,
            boxShadow: scrollProgress > 0.5 ? `0 4px 20px -4px hsl(var(--primary) / ${scrollProgress * 0.1})` : 'none',
            border: scrollProgress > 0.3 ? `1px solid hsl(var(--border) / ${scrollProgress * 0.5})` : '1px solid transparent',
          }}
        >
          {/* Logo - Animated */}
          {isHomePage ? (
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
              
              {/* Mini Equalizer when music is playing */}
              <AnimatePresence>
                {isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -10 }}
                    className="hidden sm:flex items-center gap-2 ml-2 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20"
                  >
                    <MiniEqualizer />
                    <span className="text-[10px] text-primary font-medium">♪</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.a>
          ) : (
            <Link 
              to="/" 
              className="flex items-center gap-3 group"
            >
              <motion.div 
                className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center overflow-hidden"
                whileHover={{ rotate: 5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
              
              {/* Mini Equalizer when music is playing */}
              <AnimatePresence>
                {isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -10 }}
                    className="hidden sm:flex items-center gap-2 ml-2 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20"
                  >
                    <MiniEqualizer />
                    <span className="text-[10px] text-primary font-medium">♪</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4" ref={dropdownRef}>
            {/* Dropdown Groups */}
            <div className="flex items-center gap-1 bg-secondary/30 backdrop-blur-sm rounded-full p-1 border border-border/30">
              {Object.entries(navGroups).map(([key, group]) => (
                <div 
                  key={key} 
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(key)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {(() => {
                    const groupSectionIds = group.items.map(i => i.href.replace('#', ''));
                    const isGroupActive = groupSectionIds.includes(activeSection);
                    return (
                      <button
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                          isGroupActive ? 'bg-primary/15 text-primary' : 
                          activeDropdown === key ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <group.icon className="h-3.5 w-3.5" />
                        <span>{group.label}</span>
                        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${activeDropdown === key ? 'rotate-180' : ''}`} />
                      </button>
                    );
                  })()}
                  
                  <AnimatePresence>
                    {activeDropdown === key && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.1 }}
                        className="absolute top-full left-0 pt-1 z-50"
                      >
                        <div className="min-w-[140px] bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
                          {group.items.map((item) => {
                            const href = isHomePage ? item.href : `/${item.href}`;
                            const sectionId = item.href.replace('#', '');
                            const isActive = activeSection === sectionId;
                            return (
                              <a
                                key={item.name}
                                href={href}
                                className={`block px-4 py-2.5 text-sm transition-colors ${
                                  isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                              >
                                {item.name}
                              </a>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              
              {/* Single Links */}
              {singleLinks.map((link) => {
                const isRoute = 'isRoute' in link && link.isRoute;
                const isActive = isRoute ? location.pathname.startsWith(link.href) : activeSection === link.href.replace('#', '');
                
                if (isRoute) {
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                        isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <link.icon className="h-3.5 w-3.5" />
                      <span>{link.name}</span>
                    </Link>
                  );
                }
                
                const href = isHomePage ? link.href : `/${link.href}`;
                return (
                  <a
                    key={link.name}
                    href={href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                      isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <link.icon className="h-3.5 w-3.5" />
                    <span>{link.name}</span>
                  </a>
                );
              })}
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full h-8 px-3 text-muted-foreground hover:text-foreground"
                onClick={() => navigate('/community')}
              >
                <Users className="h-4 w-4" />
                <span className="ml-1.5 hidden lg:inline">{language === 'ja' ? 'コミュニティ' : 'Community'}</span>
              </Button>

              <ThemeToggle />
              <LanguageSwitcher />
              
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full h-8 px-3 text-muted-foreground hover:text-foreground"
                      onClick={() => navigate('/admin')}
                    >
                      <Settings className="h-4 w-4" />
                      <span className="ml-1.5 hidden lg:inline">{language === 'ja' ? '管理' : 'Admin'}</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8"
                    onClick={() => navigate('/profile')}
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-full h-8 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
                    asChild
                  >
                    <a href="https://www.patreon.com/paradisecreator/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Patreon</span>
                    </a>
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="rounded-full h-8 px-4"
                  onClick={() => navigate('/auth')}
                >
                  {language === 'ja' ? 'ログイン' : 'Login'}
                </Button>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="container mx-auto px-6 pt-24 pb-8 h-full flex flex-col">
              <div className="flex-1 flex flex-col justify-center space-y-2">
                {/* Mobile: Flat list of all items */}
                {Object.entries(navGroups).flatMap(([key, group], groupIndex) =>
                  group.items.map((item, itemIndex) => {
                    const href = isHomePage ? item.href : `/${item.href}`;
                    const index = groupIndex * 2 + itemIndex;
                    return (
                      <motion.a
                        key={item.name}
                        href={href}
                        className="group flex items-center gap-4 py-4 border-b border-border/20"
                        onClick={() => setIsMobileMenuOpen(false)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.15 }}
                      >
                        <span className="text-2xl font-medium text-foreground group-hover:text-primary transition-colors">
                          {item.name}
                        </span>
                        <span className="ml-auto text-muted-foreground/30 text-sm">→</span>
                      </motion.a>
                    );
                  })
                )}
                {singleLinks.map((link, index) => {
                  const isRoute = 'isRoute' in link && link.isRoute;
                  
                  if (isRoute) {
                    return (
                      <Link
                        key={link.name}
                        to={link.href}
                        className="group flex items-center gap-4 py-4 border-b border-border/20"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <motion.span
                          className="text-2xl font-medium text-foreground group-hover:text-primary transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (index + 4) * 0.03, duration: 0.15 }}
                        >
                          {link.name}
                        </motion.span>
                        <span className="ml-auto text-muted-foreground/30 text-sm">→</span>
                      </Link>
                    );
                  }
                  
                  const href = isHomePage ? link.href : `/${link.href}`;
                  return (
                    <motion.a
                      key={link.name}
                      href={href}
                      className="group flex items-center gap-4 py-4 border-b border-border/20"
                      onClick={() => setIsMobileMenuOpen(false)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index + 4) * 0.03, duration: 0.15 }}
                    >
                      <span className="text-2xl font-medium text-foreground group-hover:text-primary transition-colors">
                        {link.name}
                      </span>
                      <span className="ml-auto text-muted-foreground/30 text-sm">→</span>
                    </motion.a>
                  );
                })}
              </div>
              
              {/* Mobile Menu Bottom Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.15 }}
                className="pt-8 space-y-3"
              >
                <Button
                  variant="outline"
                  className="w-full h-12 text-base rounded-xl"
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/community'); }}
                >
                  <Users className="h-5 w-5 mr-2" />
                  {language === 'ja' ? 'コミュニティ' : 'Community'}
                </Button>
                
                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        className="w-full h-12 text-base rounded-xl"
                        onClick={() => { setIsMobileMenuOpen(false); navigate('/chat-admin'); }}
                      >
                        <Settings className="h-5 w-5 mr-2" />
                        {language === 'ja' ? '管理画面' : 'Admin'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full h-12 text-base rounded-xl"
                      onClick={() => { setIsMobileMenuOpen(false); navigate('/profile'); }}
                    >
                      <User className="h-5 w-5 mr-2" />
                      {profile?.display_name || (language === 'ja' ? 'プロフィール' : 'Profile')}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base rounded-xl"
                    onClick={() => { setIsMobileMenuOpen(false); navigate('/auth'); }}
                  >
                    <User className="h-5 w-5 mr-2" />
                    {language === 'ja' ? 'ログイン' : 'Login'}
                  </Button>
                )}
                
                {isAuthenticated && (
                  <Button
                    className="w-full h-14 text-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl"
                    asChild
                  >
                    <a href="https://www.patreon.com/paradisecreator/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                      <Sparkles className="h-5 w-5" />
                      Support on Patreon
                    </a>
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;
