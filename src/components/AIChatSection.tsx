import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { MessageCircle, Send, X, Bot, Loader2, GripHorizontal, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useChat } from '@/contexts/ChatContext';
import yukiProfile from '@/assets/yuki-profile.jpg';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered';
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-with-yuki`;

// Get or create visitor ID
const getVisitorId = () => {
  let visitorId = localStorage.getItem('chat_visitor_id');
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem('chat_visitor_id', visitorId);
  }
  return visitorId;
};

export const AIChatSection = () => {
  const { toast } = useToast();
  const { isOpen, toggleChat } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Create or get conversation
  const ensureConversation = async () => {
    if (conversationId) return conversationId;
    
    const visitorId = getVisitorId();
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({ visitor_id: visitorId })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
    
    setConversationId(data.id);
    return data.id;
  };

  // Save message to database
  const saveMessage = async (convId: string, role: 'user' | 'assistant', content: string) => {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: convId,
        role,
        content
      });
    
    if (error) {
      console.error('Error saving message:', error);
    }
  };

  const streamChat = async (userMessages: Message[], convId: string) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: userMessages.map(m => ({ role: m.role, content: m.content }))
      }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || 'チャットの開始に失敗しました');
    }

    if (!resp.body) throw new Error('レスポンスボディがありません');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    setIsTyping(true);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent, timestamp: new Date(), status: 'delivered' }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    setIsTyping(false);
    
    // Save assistant message to database
    if (assistantContent) {
      await saveMessage(convId, 'assistant', assistantContent);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const convId = await ensureConversation();
    if (!convId) {
      toast({
        title: "エラー",
        description: "会話の開始に失敗しました",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = { 
      role: 'user', 
      content: input.trim(),
      timestamp: new Date(),
      status: 'sending'
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Save user message to database
    await saveMessage(convId, 'user', userMessage.content);
    
    // Update message status to sent
    setMessages(prev => prev.map((m, i) => 
      i === prev.length - 1 ? { ...m, status: 'sent' } : m
    ));

    try {
      await streamChat(newMessages, convId);
      // Update message status to delivered
      setMessages(prev => prev.map(m => 
        m.role === 'user' ? { ...m, status: 'delivered' } : m
      ));
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "メッセージの送信に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  return (
    <>
      {/* Drag constraints container */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-40" />

      {/* Chat Toggle Button with Pulse Animation */}
      <motion.button
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg flex items-center justify-center text-primary-foreground"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        animate={!isOpen ? {
          boxShadow: [
            '0 0 20px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.2)',
            '0 0 30px hsl(var(--primary) / 0.6), 0 0 60px hsl(var(--primary) / 0.4)',
            '0 0 20px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.2)',
          ],
        } : {}}
        transition={!isOpen ? {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        } : {}}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        
        {/* Pulse rings */}
        {!isOpen && (
          <>
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-primary"
              animate={{
                scale: [1, 1.5, 2],
                opacity: [0.6, 0.3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-primary"
              animate={{
                scale: [1, 1.5, 2],
                opacity: [0.6, 0.3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.5,
              }}
            />
          </>
        )}
      </motion.button>

      {/* Chat Window - Messenger Style */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragControls={dragControls}
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            dragMomentum={false}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-6 z-50 w-[380px] sm:w-[420px] h-[600px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
          >
            {/* Messenger Style Header */}
            <div 
              className="bg-card border-b border-border p-3 cursor-grab active:cursor-grabbing select-none"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={yukiProfile} 
                    alt="Yuki" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">濱田 優貴</h3>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    オンライン
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNewChat}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    新規チャット
                  </Button>
                  <GripHorizontal className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Messages - Messenger Style */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <img 
                    src={yukiProfile} 
                    alt="Yuki" 
                    className="w-20 h-20 rounded-full object-cover mb-4 ring-4 ring-primary/20"
                  />
                  <h4 className="font-semibold text-foreground mb-1">濱田 優貴</h4>
                  <p className="text-xs text-muted-foreground mb-6">
                    起業家・投資家・柔術家・音楽家
                  </p>
                  <div className="space-y-2 w-full max-w-[280px]">
                    {['経歴について教えて', '柔術の実績は？', 'どんな音楽を作ってる？'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="block w-full text-sm bg-card hover:bg-card/80 border border-border rounded-full px-4 py-2.5 transition-all hover:shadow-md"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <img 
                      src={yukiProfile} 
                      alt="Yuki" 
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-1"
                    />
                  )}
                  <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[260px] rounded-2xl px-4 py-2.5 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-card text-foreground border border-border rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1">
                      <span className="text-[10px] text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.role === 'user' && message.status && (
                        <span className="text-[10px]">
                          {message.status === 'sending' && (
                            <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                          )}
                          {message.status === 'sent' && (
                            <CheckCheck className="w-3 h-3 text-muted-foreground" />
                          )}
                          {message.status === 'delivered' && (
                            <CheckCheck className="w-3 h-3 text-primary" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 items-end"
                >
                  <img 
                    src={yukiProfile} 
                    alt="Yuki" 
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <motion.span
                        className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.span
                        className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.span
                        className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input - Messenger Style */}
            <div className="p-3 border-t border-border bg-card">
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="メッセージを入力..."
                    disabled={isLoading}
                    rows={1}
                    className="w-full resize-none rounded-full border border-border bg-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 max-h-32"
                    style={{ minHeight: '42px' }}
                  />
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="rounded-full w-10 h-10 bg-primary hover:bg-primary/90 flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
