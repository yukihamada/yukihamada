import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { MessageCircle, Send, Minus, Maximize2, Minimize2, Loader2, GripHorizontal, CheckCheck, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getVisitorSupabaseClient } from '@/lib/visitorSupabaseClient';
import { useChat } from '@/contexts/ChatContext';
import { useLanguage } from '@/contexts/LanguageContext';
import yukiProfile from '@/assets/yuki-profile.jpg';
import { TypingText } from '@/components/TypingText';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered';
  isGreeting?: boolean;
};

type StoredMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'delivered';
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-with-yuki`;
const STORAGE_KEY = 'yuki_chat_history';
const CONVERSATION_ID_KEY = 'yuki_chat_conversation_id';
const GREETED_KEY = 'yuki_chat_greeted';

// Get or create visitor ID
const getVisitorId = () => {
  let visitorId = localStorage.getItem('chat_visitor_id');
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem('chat_visitor_id', visitorId);
  }
  return visitorId;
};

// Save messages to localStorage
const saveMessagesToStorage = (messages: Message[]) => {
  const storedMessages: StoredMessage[] = messages.map(m => ({
    ...m,
    timestamp: m.timestamp.toISOString(),
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storedMessages));
};

// Load messages from localStorage
const loadMessagesFromStorage = (): Message[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: StoredMessage[] = JSON.parse(stored);
    return parsed.map(m => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }));
  } catch {
    return [];
  }
};

// Load conversation ID from localStorage
const loadConversationId = (): string | null => {
  return localStorage.getItem(CONVERSATION_ID_KEY);
};

// Save conversation ID to localStorage
const saveConversationId = (id: string) => {
  localStorage.setItem(CONVERSATION_ID_KEY, id);
};

// Voice Input Button Component
interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isDisabled: boolean;
  texts: { voiceStart: string; voiceStop: string; voiceNotSupported: string };
}

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

const VoiceInputButton = ({ onTranscript, isDisabled, texts }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        description: texts.voiceNotSupported,
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionClass();
    recognitionRef.current.lang = document.documentElement.lang === 'ja' ? 'ja-JP' : 'en-US';
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      onTranscript(transcript);
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={isListening ? stopListening : startListening}
      disabled={isDisabled}
      className={`rounded-full w-10 h-10 flex-shrink-0 ${isListening ? 'bg-red-500/20 text-red-500' : ''}`}
      title={isListening ? texts.voiceStop : texts.voiceStart}
    >
      {isListening ? (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <MicOff className="w-4 h-4" />
        </motion.div>
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </Button>
  );
};

export const AIChatSection = () => {
  const { toast } = useToast();
  const { isOpen, toggleChat, openChat, pageContext, currentBlogTitle } = useChat();
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>(() => loadMessagesFromStorage());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(() => loadConversationId());
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(() => {
    return localStorage.getItem(GREETED_KEY) === 'true';
  });
  const [showMusicPrompt, setShowMusicPrompt] = useState(false);
  const [hasShownBottomPrompt, setHasShownBottomPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const greetingInProgressRef = useRef(false);
  const visitorIdRef = useRef<string>(getVisitorId());

  // Detect when user scrolls to bottom of page
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const isAtBottom = scrollTop + windowHeight >= docHeight - 100;
      
      if (isAtBottom && !isOpen && !hasShownBottomPrompt) {
        setHasShownBottomPrompt(true);
        setShowMusicPrompt(true);
        openChat();
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen, hasShownBottomPrompt, openChat]);

  // Get time-based greeting prefix
  const getTimeGreeting = (lang: 'en' | 'ja') => {
    const hour = new Date().getHours();
    if (lang === 'ja') {
      if (hour >= 5 && hour < 12) return 'おはよう！';
      if (hour >= 12 && hour < 17) return 'こんにちは！';
      return 'こんばんは！';
    } else {
      if (hour >= 5 && hour < 12) return 'Good morning!';
      if (hour >= 12 && hour < 17) return 'Good afternoon!';
      return 'Good evening!';
    }
  };

  // Get visit count
  const getVisitCount = () => {
    const count = parseInt(localStorage.getItem('yuki_visit_count') || '0', 10);
    localStorage.setItem('yuki_visit_count', String(count + 1));
    return count;
  };

  const visitCount = getVisitCount();
  const isReturningVisitor = visitCount > 0;

  // Quick reply suggestions based on context
  const quickReplies = {
    en: {
      career: [
        'What companies have you founded?',
        'Tell me about Enabler',
        'What is your investment philosophy?',
        'How did you start your career?',
        'What was your biggest success?',
      ],
      bjj: [
        'What belt are you?',
        'How long have you trained?',
        'What competitions have you won?',
        'Who is your favorite BJJ player?',
        'Do you teach BJJ?',
      ],
      music: [
        'Can I listen to your songs?',
        'What genre do you make?',
        'What instruments do you play?',
        'Where can I stream your music?',
        'Are you releasing new songs?',
      ],
      investment: [
        'What kind of startups do you invest in?',
        'How can I pitch to you?',
        'What do you look for in founders?',
        'Do you do angel investing?',
      ],
      blog: [
        'What topics do you write about?',
        'What is your favorite article?',
        'Do you accept guest posts?',
      ],
      collaboration: [
        'Are you open to collaborations?',
        'How can I work with you?',
        'Do you offer consulting?',
        'What is the best way to contact you?',
      ],
      general: [
        'Tell me about your career',
        'What are your hobbies?',
        'How can I contact you?',
        'What is your background?',
      ],
    },
    ja: {
      career: [
        'どんな会社を創業した？',
        'Enablerについて教えて',
        '投資の哲学は？',
        'キャリアはどう始まった？',
        '一番の成功体験は？',
      ],
      bjj: [
        '何帯？',
        '柔術歴はどのくらい？',
        'どんな大会で優勝した？',
        '好きな柔術家は？',
        '柔術を教えてる？',
      ],
      music: [
        '曲を聴きたい',
        'どんなジャンル？',
        'どんな楽器を弾く？',
        'どこで曲を聴ける？',
        '新曲は出す予定？',
      ],
      investment: [
        'どんなスタートアップに投資してる？',
        'ピッチはどうすればいい？',
        '起業家に何を求める？',
        'エンジェル投資してる？',
      ],
      blog: [
        'どんな記事を書いてる？',
        'おすすめの記事は？',
        'ゲスト投稿は受け付けてる？',
      ],
      collaboration: [
        'コラボはできる？',
        '一緒に仕事したい',
        'コンサルティングはしてる？',
        '連絡先を教えて',
      ],
      general: [
        '経歴を教えて',
        '趣味は何？',
        '連絡先を知りたい',
        'バックグラウンドは？',
      ],
    },
  };

  // Determine which quick replies to show based on last assistant message
  const getQuickReplies = (): string[] => {
    if (messages.length === 0) return [];
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'assistant') return [];
    
    const content = lastMessage.content.toLowerCase();
    const replies = quickReplies[language];
    
    // Check for specific topics
    if (content.includes('career') || content.includes('経歴') || content.includes('enabler') || content.includes('起業') || content.includes('founded') || content.includes('創業')) {
      return replies.career;
    }
    if (content.includes('bjj') || content.includes('柔術') || content.includes('jiu') || content.includes('帯') || content.includes('belt') || content.includes('grappling')) {
      return replies.bjj;
    }
    if (content.includes('music') || content.includes('音楽') || content.includes('song') || content.includes('曲') || content.includes('album') || content.includes('アルバム')) {
      return replies.music;
    }
    if (content.includes('invest') || content.includes('投資') || content.includes('startup') || content.includes('スタートアップ') || content.includes('vc') || content.includes('angel')) {
      return replies.investment;
    }
    if (content.includes('blog') || content.includes('ブログ') || content.includes('article') || content.includes('記事') || content.includes('write') || content.includes('書')) {
      return replies.blog;
    }
    if (content.includes('work together') || content.includes('collaborate') || content.includes('contact') || content.includes('連絡') || content.includes('仕事') || content.includes('コラボ')) {
      return replies.collaboration;
    }
    
    return replies.general;
  };

  const texts = {
    en: {
      name: 'Yuki Hamada',
      title: 'Entrepreneur・Investor・BJJ Player・Musician',
      online: 'Online',
      newChat: 'New Chat',
      placeholder: 'Type a message...',
      errorTitle: 'Error',
      errorConversation: 'Failed to start conversation',
      voiceStart: 'Start voice input',
      voiceStop: 'Stop recording',
      voiceNotSupported: 'Voice input is not supported in this browser',
      suggestions: [
        'Tell me about your career',
        'What are your BJJ achievements?',
        'What kind of music do you make?',
        'Can I work with you?',
      ],
      greetings: {
        home: isReturningVisitor 
          ? `${getTimeGreeting('en')} Welcome back! Great to see you again. What would you like to explore today?`
          : `${getTimeGreeting('en')} I'm Yuki. Welcome to my portfolio site! Feel free to ask me anything about my work, investments, BJJ, or music!`,
        blog: isReturningVisitor
          ? `${getTimeGreeting('en')} Welcome back to my blog! Found anything interesting to read?`
          : `${getTimeGreeting('en')} I see you're browsing my blog. Want to discuss any of the topics I've written about?`,
        'blog-post': (title?: string) => isReturningVisitor
          ? `${getTimeGreeting('en')} Good to see you! Enjoying "${title || 'this article'}"? I'm happy to dive deeper into any part of it!`
          : `${getTimeGreeting('en')} I see you're reading "${title || 'my article'}". Feel free to ask me any questions about this topic!`,
        '404': `${getTimeGreeting('en')} Oops! Looks like you found a broken link. While you're here, feel free to chat with me about anything!`,
        other: isReturningVisitor
          ? `${getTimeGreeting('en')} Welcome back! How can I help you today?`
          : `${getTimeGreeting('en')} I'm Yuki. How can I help you today?`,
      },
    },
    ja: {
      name: '濱田 優貴',
      title: '起業家・投資家・柔術家・音楽家',
      online: 'オンライン',
      newChat: '新規チャット',
      placeholder: 'メッセージを入力...',
      errorTitle: 'エラー',
      errorConversation: '会話の開始に失敗しました',
      voiceStart: '音声入力を開始',
      voiceStop: '録音を停止',
      voiceNotSupported: 'このブラウザでは音声入力がサポートされていません',
      suggestions: [
        '経歴について教えて',
        '柔術の実績は？',
        'どんな音楽を作ってる？',
        '一緒に仕事できる？',
      ],
      greetings: {
        home: isReturningVisitor 
          ? `${getTimeGreeting('ja')}また来てくれたんだね！今日は何について話そうか？`
          : `${getTimeGreeting('ja')}濱田優貴です。ポートフォリオサイトへようこそ！仕事、投資、柔術、音楽など、なんでも聞いてね！`,
        blog: isReturningVisitor
          ? `${getTimeGreeting('ja')}ブログにまた来てくれてありがとう！気になる記事は見つかった？`
          : `${getTimeGreeting('ja')}ブログを見てくれてありがとう。気になる記事について話しましょうか？`,
        'blog-post': (title?: string) => isReturningVisitor
          ? `${getTimeGreeting('ja')}また来てくれたね！「${title || 'この記事'}」について、もっと深く話したいことはある？`
          : `${getTimeGreeting('ja')}「${title || 'この記事'}」を読んでくれてありがとう！質問があれば気軽に聞いてね。`,
        '404': `${getTimeGreeting('ja')}おっと！迷子になっちゃったみたいだね。よかったらなんでもチャットしよう！`,
        other: isReturningVisitor
          ? `${getTimeGreeting('ja')}また来てくれてありがとう！今日は何かお手伝いできることはある？`
          : `${getTimeGreeting('ja')}濱田優貴です。何かお手伝いできることはありますか？`,
      },
    },
  };

  const t = texts[language];

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessagesToStorage(messages);
    }
  }, [messages]);

  // Save conversation ID whenever it changes
  useEffect(() => {
    if (conversationId) {
      saveConversationId(conversationId);
    }
  }, [conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-greeting based on page context
  const sendAutoGreeting = useCallback(() => {
    if (hasGreeted || greetingInProgressRef.current || messages.length > 0) return;
    
    greetingInProgressRef.current = true;
    
    let greeting: string;
    const greetings = t.greetings;
    
    switch (pageContext) {
      case 'blog-post':
        greeting = typeof greetings['blog-post'] === 'function' 
          ? greetings['blog-post'](currentBlogTitle)
          : greetings['blog-post'];
        break;
      case 'blog':
        greeting = greetings.blog;
        break;
      case '404':
        greeting = greetings['404'];
        break;
      case 'home':
        greeting = greetings.home;
        break;
      default:
        greeting = greetings.other;
    }

    const greetingMessage: Message = {
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
      status: 'delivered',
      isGreeting: true, // Mark as greeting for typing animation
    };

    setMessages([greetingMessage]);
    setHasGreeted(true);
    localStorage.setItem(GREETED_KEY, 'true');
    greetingInProgressRef.current = false;
  }, [hasGreeted, messages.length, pageContext, currentBlogTitle, t.greetings]);

  // Send greeting when chat opens for the first time
  useEffect(() => {
    if (isOpen && !hasGreeted && messages.length === 0) {
      sendAutoGreeting();
    }
  }, [isOpen, hasGreeted, messages.length, sendAutoGreeting]);

  // Create or get conversation
  const ensureConversation = async () => {
    if (conversationId) return conversationId;

    const visitorId = visitorIdRef.current;
    const visitorSupabase = getVisitorSupabaseClient(visitorId);

    const { data, error } = await visitorSupabase
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
    const visitorSupabase = getVisitorSupabaseClient(visitorIdRef.current);

    const { error } = await visitorSupabase
      .from('chat_messages')
      .insert({
        conversation_id: convId,
        role,
        content,
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
              if (last?.role === "assistant" && last.status !== 'delivered') {
                return prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent, timestamp: new Date(), status: 'sending' }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    setIsTyping(false);
    
    // Update final message status
    setMessages(prev => prev.map((m, i) => 
      i === prev.length - 1 && m.role === 'assistant' ? { ...m, status: 'delivered' } : m
    ));
    
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
        title: t.errorTitle,
        description: t.errorConversation,
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
        title: t.errorTitle,
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
    setHasGreeted(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONVERSATION_ID_KEY);
    localStorage.removeItem(GREETED_KEY);
  };

  // Resizable chat dimensions
  const [chatWidth, setChatWidth] = useState(360);
  const [chatHeight, setChatHeight] = useState(450);
  const [isMaximized, setIsMaximized] = useState(false);
  const isResizing = useRef(false);
  const resizeDirection = useRef<'right' | 'bottom' | 'corner' | null>(null);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const prevSize = useRef({ width: 360, height: 450 });

  const handleResizeStart = (e: React.PointerEvent, direction: 'right' | 'bottom' | 'corner') => {
    if (window.innerWidth < 768) return;
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = true;
    resizeDirection.current = direction;
    startPos.current = { x: e.clientX, y: e.clientY, width: chatWidth, height: chatHeight };
    document.addEventListener('pointermove', handleResizeMove);
    document.addEventListener('pointerup', handleResizeEnd);
  };

  const handleResizeMove = (e: PointerEvent) => {
    if (!isResizing.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = startPos.current.y - e.clientY; // Inverted because we resize upward
    
    if (resizeDirection.current === 'right' || resizeDirection.current === 'corner') {
      setChatWidth(Math.max(280, Math.min(600, startPos.current.width + dx)));
    }
    if (resizeDirection.current === 'bottom' || resizeDirection.current === 'corner') {
      setChatHeight(Math.max(300, Math.min(800, startPos.current.height + dy)));
    }
  };

  const handleResizeEnd = () => {
    isResizing.current = false;
    resizeDirection.current = null;
    document.removeEventListener('pointermove', handleResizeMove);
    document.removeEventListener('pointerup', handleResizeEnd);
  };

  return (
    <>
      {/* Drag constraints container */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-40" />

      {/* Chat Toggle Button - only show when closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              boxShadow: [
                '0 0 15px hsl(var(--primary) / 0.3)',
                '0 0 25px hsl(var(--primary) / 0.5)',
                '0 0 15px hsl(var(--primary) / 0.3)',
              ],
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg flex items-center justify-center text-primary-foreground"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleChat}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <MessageCircle className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag={window.innerWidth >= 768 && !isResizing.current}
            dragControls={dragControls}
            dragConstraints={constraintsRef}
            dragElastic={0.05}
            dragMomentum={false}
            initial={{ opacity: 0, y: 20, scale: 0.95, x: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{ 
              width: window.innerWidth >= 768 ? chatWidth : undefined,
              height: window.innerWidth >= 768 ? chatHeight : undefined,
            }}
            className="fixed z-50 bg-background border border-border shadow-2xl flex flex-col overflow-hidden pointer-events-auto
              bottom-0 left-0 right-0 h-[70vh] rounded-t-2xl
              md:bottom-6 md:left-6 md:right-auto md:rounded-xl"
          >
            {/* Resize handles - desktop only */}
            <div 
              className="hidden md:block absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-primary/20 transition-colors"
              onPointerDown={(e) => handleResizeStart(e, 'right')}
            />
            <div 
              className="hidden md:block absolute left-0 right-0 top-0 h-2 cursor-ns-resize hover:bg-primary/20 transition-colors"
              onPointerDown={(e) => handleResizeStart(e, 'bottom')}
            />
            <div 
              className="hidden md:block absolute right-0 top-0 w-4 h-4 cursor-nesw-resize hover:bg-primary/20 transition-colors"
              onPointerDown={(e) => handleResizeStart(e, 'corner')}
            />

            {/* Header */}
            <div 
              className="bg-card border-b border-border p-3 md:cursor-grab md:active:cursor-grabbing select-none"
              onPointerDown={(e) => window.innerWidth >= 768 && !isResizing.current && dragControls.start(e)}
            >
              {/* Mobile drag indicator */}
              <div className="md:hidden w-8 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-2" />
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <img 
                    src={yukiProfile} 
                    alt="Yuki" 
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-card rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm truncate">{t.name}</h3>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    {t.online}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNewChat}
                    className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
                  >
                    {t.newChat}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (!isMaximized) {
                        prevSize.current = { width: chatWidth, height: chatHeight };
                        setChatWidth(window.innerWidth - 48);
                        setChatHeight(window.innerHeight - 48);
                      } else {
                        setChatWidth(prevSize.current.width);
                        setChatHeight(prevSize.current.height);
                      }
                      setIsMaximized(!isMaximized);
                    }}
                    className="hidden md:flex rounded-full h-7 w-7 hover:bg-muted"
                    title={language === 'ja' ? (isMaximized ? '元に戻す' : '最大化') : (isMaximized ? 'Restore' : 'Maximize')}
                  >
                    {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleChat}
                    className="rounded-full h-7 w-7 hover:bg-muted"
                    title={language === 'ja' ? '最小化' : 'Minimize'}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <GripHorizontal className="w-3 h-3 text-muted-foreground hidden md:block" />
                </div>
              </div>
            </div>

            {/* Music Prompt */}
            <AnimatePresence>
              {showMusicPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-3 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-foreground">
                      {language === 'ja' ? '🎵 音楽を聴きながらチャットしませんか？' : '🎵 Want to listen to music while chatting?'}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('toggleMusicPlayer'));
                          setShowMusicPrompt(false);
                        }}
                      >
                        {language === 'ja' ? '再生' : 'Play'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => setShowMusicPrompt(false)}
                      >
                        {language === 'ja' ? '後で' : 'Later'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-muted/20">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-3">
                  <img 
                    src={yukiProfile} 
                    alt="Yuki" 
                    className="w-16 h-16 rounded-full object-cover mb-3 ring-2 ring-primary/20"
                  />
                  <h4 className="font-medium text-foreground text-sm mb-0.5">{t.name}</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    {t.title}
                  </p>
                  <div className="space-y-1.5 w-full max-w-[260px]">
                    {t.suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="block w-full text-xs bg-card hover:bg-card/80 border border-border rounded-lg px-3 py-2 transition-colors text-left"
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
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <img 
                      src={yukiProfile} 
                      alt="Yuki" 
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5"
                    />
                  )}
                  <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                    <div
                      className={`rounded-xl px-3 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-card text-foreground border border-border rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.isGreeting && message.role === 'assistant' ? (
                          <TypingText text={message.content} speed={25} />
                        ) : (
                          message.content
                        )}
                      </p>
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

            {/* Input */}
            <div className="border-t border-border bg-card safe-area-inset-bottom">
              {/* Quick Reply Suggestions */}
              {messages.length > 0 && !isLoading && getQuickReplies().length > 0 && (
                <div className="px-3 pt-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
                  {getQuickReplies().map((reply) => (
                    <button
                      key={reply}
                      onClick={() => setInput(reply)}
                      className="flex-shrink-0 text-xs bg-secondary/50 hover:bg-secondary border border-border rounded-full px-3 py-1.5 transition-colors text-muted-foreground hover:text-foreground whitespace-nowrap"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="p-4 md:p-3 flex gap-2 items-end">
                <VoiceInputButton 
                  onTranscript={(text) => setInput(prev => prev + text)}
                  isDisabled={isLoading}
                  texts={t}
                />
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.placeholder}
                    disabled={isLoading}
                    rows={1}
                    className="w-full resize-none rounded-2xl border border-border bg-muted/50 px-4 py-3 md:py-2.5 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 max-h-32"
                    style={{ minHeight: '48px' }}
                  />
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="rounded-full w-12 h-12 md:w-10 md:h-10 bg-primary hover:bg-primary/90 flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 md:w-4 md:h-4 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 md:w-4 md:h-4" />
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
