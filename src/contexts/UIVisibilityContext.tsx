import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

interface UIVisibilityContextType {
  isUIVisible: boolean;
  isScrolling: boolean;
}

const UIVisibilityContext = createContext<UIVisibilityContextType | undefined>(undefined);

export const UIVisibilityProvider = ({ children }: { children: ReactNode }) => {
  const [isUIVisible, setIsUIVisible] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const scrollDelta = Math.abs(scrollY - lastScrollY.current);
    lastScrollY.current = scrollY;
    
    // Don't hide if near top of page
    if (scrollY < 50) {
      setIsScrolling(false);
      setIsUIVisible(true);
      return;
    }

    // Only hide if scrolling fast enough (reduces jitter)
    if (scrollDelta > 5) {
      setIsScrolling(true);
      setIsUIVisible(false);
    }

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set new timeout - show UI after scroll stops (600ms for smoother experience)
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      setIsUIVisible(true);
    }, 600);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

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
