import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface UIVisibilityContextType {
  isUIVisible: boolean;
  isScrolling: boolean;
}

const UIVisibilityContext = createContext<UIVisibilityContextType | undefined>(undefined);

export const UIVisibilityProvider = ({ children }: { children: ReactNode }) => {
  const [isUIVisible, setIsUIVisible] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    
    // Don't hide if near top of page
    if (scrollY < 50) {
      setIsScrolling(false);
      setIsUIVisible(true);
      return;
    }

    // Start scrolling - hide UI
    setIsScrolling(true);
    setIsUIVisible(false);

    // Clear existing timeout
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    // Set new timeout - show UI after scroll stops
    const timeout = setTimeout(() => {
      setIsScrolling(false);
      setIsUIVisible(true);
    }, 150);

    setScrollTimeout(timeout);
  }, [scrollTimeout]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [handleScroll, scrollTimeout]);

  return (
    <UIVisibilityContext.Provider value={{ isUIVisible, isScrolling }}>
      {children}
    </UIVisibilityContext.Provider>
  );
};

export const useUIVisibility = () => {
  const context = useContext(UIVisibilityContext);
  if (context === undefined) {
    throw new Error('useUIVisibility must be used within a UIVisibilityProvider');
  }
  return context;
};
