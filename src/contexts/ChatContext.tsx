import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type PageContext = 'home' | 'blog' | 'blog-post' | '404' | 'other';

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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pageContext, setPageContext] = useState<PageContext>('home');
  const [currentBlogTitle, setCurrentBlogTitle] = useState<string | undefined>(undefined);
  const [pendingMessage, setPendingMessage] = useState<string | undefined>(undefined);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen(prev => !prev), []);

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
