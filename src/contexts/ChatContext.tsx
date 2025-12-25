import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

type PageContext = 'home' | 'blog' | 'blog-post' | '404' | 'other';
type ChatMode = 'yuki' | 'newt';

const CHAT_MODE_KEY = 'chat_mode_preference';

interface ChatContextType {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  pageContext: PageContext;
  setPageContext: (context: PageContext) => void;
  currentBlogTitle?: string;
  setCurrentBlogTitle: (title: string | undefined) => void;
  pendingMessage?: string;
  setPendingMessage: (message: string | undefined) => void;
  chatMode: ChatMode;
  setChatMode: (mode: ChatMode) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pageContext, setPageContext] = useState<PageContext>('home');
  const [currentBlogTitle, setCurrentBlogTitle] = useState<string | undefined>(undefined);
  const [pendingMessage, setPendingMessage] = useState<string | undefined>(undefined);
  // Always start with 'yuki' mode on page load - Newt is only activated by explicit user action
  const [chatMode, setChatModeState] = useState<ChatMode>('yuki');
  // Used to trigger opening Newt only when user explicitly selects it
  const [newtOpenNonce, setNewtOpenNonce] = useState(0);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen(prev => !prev), []);

  const setChatMode = useCallback((mode: ChatMode) => {
    setChatModeState(mode);
    localStorage.setItem(CHAT_MODE_KEY, mode);
    if (mode === 'newt') {
      setNewtOpenNonce((n) => n + 1);
    }
  }, []);

  // Load Newt widget script, position it, and detect close
  useEffect(() => {
    const styleId = 'newt-chat-position-style';
    const hideStyleId = 'newt-chat-hide-style';
    let checkInterval: ReturnType<typeof setInterval> | null = null;

    const shouldUseNewt = chatMode === 'newt' && newtOpenNonce > 0;

    const hideNewtWidget = () => {
      // Add CSS to completely hide Newt widget
      if (!document.getElementById(hideStyleId)) {
        const style = document.createElement('style');
        style.id = hideStyleId;
        style.textContent = `
          /* Completely hide Newt widget */
          #newt-chat-widget,
          [id^="newt-chat"],
          [id^="newt_"],
          .newt-chat-widget,
          iframe[src*="newt"],
          iframe[src*="chat-widget.newt"],
          div[data-newt-chat],
          [class*="newt"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    };

    const showNewtWidget = () => {
      // Remove hide style
      const existingHideStyle = document.getElementById(hideStyleId);
      if (existingHideStyle) existingHideStyle.remove();
      
      // Add positioning style to force left side
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          /* Force Newt widget to bottom-left and show it */
          #newt-chat-widget,
          [id^="newt-chat"],
          [id^="newt_"],
          .newt-chat-widget,
          iframe[src*="newt"],
          iframe[src*="chat-widget.newt"],
          div[data-newt-chat],
          [class*="newt"] {
            left: 16px !important;
            right: auto !important;
            bottom: 16px !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
          }
        `;
        document.head.appendChild(style);
      }
    };

    const getLargestNewtElement = () => {
      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>(
          '#newt-chat-widget, [id^="newt-chat"], [id^="newt_"], .newt-chat-widget, iframe[src*="newt"]'
        )
      );

      let best: { el: HTMLElement; area: number } | null = null;
      for (const el of candidates) {
        const rect = el.getBoundingClientRect();
        const area = Math.max(0, rect.width) * Math.max(0, rect.height);
        if (!best || area > best.area) best = { el, area };
      }
      return best?.el ?? null;
    };

    const isNewtChatOpen = () => {
      const el = getLargestNewtElement();
      if (!el) return false;

      const rect = el.getBoundingClientRect();
      const styles = window.getComputedStyle(el);

      // Basic visibility checks
      if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') return false;

      // Closed state is typically a small launcher; open state is a larger panel.
      if (rect.width < 200 || rect.height < 200) return false;

      // Off-screen (some widgets animate out of view)
      if (rect.bottom < 0 || rect.top > window.innerHeight + 60) return false;

      return true;
    };

    const startCloseDetection = () => {
      let wasOpen = false;

      checkInterval = setInterval(() => {
        const openNow = isNewtChatOpen();
        if (wasOpen && !openNow) {
          // Newt was open and is now closed, switch back to Yuki mode and hide Newt
          setChatModeState('yuki');
          localStorage.setItem(CHAT_MODE_KEY, 'yuki');
          hideNewtWidget();
        }
        wasOpen = openNow;
      }, 400);

      // Also listen to postMessage signals from Newt if any (best-effort)
      const onMessage = (event: MessageEvent) => {
        try {
          const origin = String(event.origin || '');
          if (!origin.includes('newt')) return;

          const dataStr = typeof event.data === 'string' ? event.data : JSON.stringify(event.data ?? {});
          const normalized = dataStr.toLowerCase();
          if (normalized.includes('close') || normalized.includes('closed')) {
            setChatModeState('yuki');
            localStorage.setItem(CHAT_MODE_KEY, 'yuki');
            hideNewtWidget();
          }
        } catch {
          // ignore
        }
      };

      window.addEventListener('message', onMessage);
      return () => window.removeEventListener('message', onMessage);
    };

    let stopMessageListener: (() => void) | null = null;

    if (shouldUseNewt) {
      showNewtWidget();

      const openAndWatch = () => {
        // Open Newt widget (best-effort)
        if ((window as any).NewtChat?.open) {
          (window as any).NewtChat.open();
        }

        // Start watching for close
        if (!stopMessageListener) {
          stopMessageListener = startCloseDetection();
        }
      };

      // Check if script already exists
      if (!document.querySelector('script[src="https://chat-widget.newt.net/embed.js"]')) {
        (window as any).newtChatSettings = {
          widgetId: '3ec574de-5e18-4f65-b9ac-d0f8f6b7055c'
        };
        const script = document.createElement('script');
        script.src = 'https://chat-widget.newt.net/embed.js';
        script.async = true;
        script.onload = () => {
          // Give the widget time to mount before opening
          setTimeout(openAndWatch, 400);
        };
        document.body.appendChild(script);
      } else {
        openAndWatch();
      }
    } else {
      // Hide Newt widget completely when not using Newt
      hideNewtWidget();
      
      // Remove positioning style when not using Newt
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) existingStyle.remove();
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (stopMessageListener) stopMessageListener();
    };
  }, [chatMode, newtOpenNonce]);

  return (
    <ChatContext.Provider value={{ 
      isOpen, 
      openChat, 
      closeChat, 
      toggleChat,
      pageContext,
      setPageContext,
      currentBlogTitle,
      setCurrentBlogTitle,
      pendingMessage,
      setPendingMessage,
      chatMode,
      setChatMode,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
