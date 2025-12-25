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
  const [chatMode, setChatModeState] = useState<ChatMode>(() => {
    return (localStorage.getItem(CHAT_MODE_KEY) as ChatMode) || 'yuki';
  });

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen(prev => !prev), []);

  const setChatMode = useCallback((mode: ChatMode) => {
    setChatModeState(mode);
    localStorage.setItem(CHAT_MODE_KEY, mode);
  }, []);

  // Load Newt widget script and position it
  useEffect(() => {
    const styleId = 'newt-chat-position-style';
    
    if (chatMode === 'newt') {
      // Add custom positioning CSS for Newt widget (bottom-left like Yuki)
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          #newt-chat-widget,
          [id^="newt-chat"],
          .newt-chat-widget,
          iframe[src*="newt.net"] {
            left: 16px !important;
            right: auto !important;
            bottom: 16px !important;
          }
        `;
        document.head.appendChild(style);
      }
      
      // Check if script already exists
      if (!document.querySelector('script[src="https://chat-widget.newt.net/embed.js"]')) {
        (window as any).newtChatSettings = {
          widgetId: '3ec574de-5e18-4f65-b9ac-d0f8f6b7055c'
        };
        const script = document.createElement('script');
        script.src = 'https://chat-widget.newt.net/embed.js';
        script.async = true;
        script.onload = () => {
          // Open Newt widget after script loads
          setTimeout(() => {
            if ((window as any).NewtChat?.open) {
              (window as any).NewtChat.open();
            }
          }, 500);
        };
        document.body.appendChild(script);
      } else {
        // Script already loaded, just open the widget
        if ((window as any).NewtChat?.open) {
          (window as any).NewtChat.open();
        }
      }
    } else {
      // Remove positioning style when not using Newt
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }, [chatMode]);

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
