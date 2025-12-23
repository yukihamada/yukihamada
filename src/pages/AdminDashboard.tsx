import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  LayoutDashboard, FileText, MessageCircle, Users, MessageSquare,
  BarChart3, Eye, Heart, TrendingUp, RefreshCw, ArrowLeft,
  Plus, Edit, Trash2, Save, X, ChevronRight, User, Bot,
  Shield, LogOut, Settings, Columns2, PanelLeft, Music, Calendar, Clock,
  Globe, Sparkles, History, RotateCcw, Monitor, Smartphone, Tablet, GitCompare,
  Play, Headphones, Link, Replace
} from 'lucide-react';
import MarkdownPreview from '@/components/MarkdownPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { blogPosts } from '@/data/blogPosts';

interface BlogPostDB {
  id: string;
  slug: string;
  featured: boolean;
  image: string | null;
  title_ja: string;
  excerpt_ja: string;
  content_ja: string;
  date_ja: string;
  category_ja: string;
  title_en: string;
  excerpt_en: string;
  content_en: string;
  date_en: string;
  category_en: string;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Conversation {
  id: string;
  visitor_id: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface BlogAnalytics {
  post_slug: string;
  view_count: number;
  unique_visitors: number;
  like_count: number;
  first_view_at: string | null;
  last_view_at: string | null;
}

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: string | null;
  display_name: string | null;
}

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  category: string;
  user_id: string;
  is_pinned: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

interface ForumComment {
  id: string;
  content: string;
  user_id: string;
  topic_id: string | null;
  blog_slug: string | null;
  parent_id: string | null;
  created_at: string;
}

interface LyricLine {
  start: number;
  end: number;
  text: string;
}

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
  artwork: string | null;
  color: string;
  display_order: number;
  is_active: boolean;
  lyrics: LyricLine[] | null;
  created_at: string;
  updated_at: string;
}

interface MusicPlayCount {
  track_id: string;
  play_count: number;
  unique_listeners: number;
}

interface AIPrompt {
  id: string;
  name: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AIPromptVersion {
  id: string;
  prompt_id: string;
  content: string;
  version_number: number;
  created_at: string;
  created_by: string | null;
}

// Parse User Agent to get readable device/browser info with bot detection
const parseUserAgent = (ua: string | null): { 
  device: string; 
  browser: string; 
  os: string; 
  icon: 'monitor' | 'smartphone' | 'tablet' | 'bot';
  isBot: boolean;
  botName: string | null;
  browserVersion: string | null;
} => {
  if (!ua) return { device: '不明', browser: '不明', os: '不明', icon: 'monitor', isBot: false, botName: null, browserVersion: null };
  
  // Bot detection patterns
  const botPatterns: { pattern: RegExp; name: string }[] = [
    { pattern: /Googlebot/i, name: 'Googlebot' },
    { pattern: /bingbot/i, name: 'Bingbot' },
    { pattern: /Slurp/i, name: 'Yahoo! Slurp' },
    { pattern: /DuckDuckBot/i, name: 'DuckDuckBot' },
    { pattern: /Baiduspider/i, name: 'Baidu Spider' },
    { pattern: /YandexBot/i, name: 'Yandex Bot' },
    { pattern: /facebookexternalhit/i, name: 'Facebook Bot' },
    { pattern: /Twitterbot/i, name: 'Twitter Bot' },
    { pattern: /LinkedInBot/i, name: 'LinkedIn Bot' },
    { pattern: /Slackbot/i, name: 'Slack Bot' },
    { pattern: /Discordbot/i, name: 'Discord Bot' },
    { pattern: /WhatsApp/i, name: 'WhatsApp Bot' },
    { pattern: /TelegramBot/i, name: 'Telegram Bot' },
    { pattern: /ChatGPT/i, name: 'ChatGPT Bot' },
    { pattern: /GPTBot/i, name: 'GPT Bot' },
    { pattern: /ClaudeBot/i, name: 'Claude Bot' },
    { pattern: /Applebot/i, name: 'Apple Bot' },
    { pattern: /PetalBot/i, name: 'Petal Bot' },
    { pattern: /SemrushBot/i, name: 'Semrush Bot' },
    { pattern: /AhrefsBot/i, name: 'Ahrefs Bot' },
    { pattern: /MJ12bot/i, name: 'Majestic Bot' },
    { pattern: /DotBot/i, name: 'DotBot' },
    { pattern: /Screaming Frog/i, name: 'Screaming Frog' },
    { pattern: /HeadlessChrome/i, name: 'Headless Chrome' },
    { pattern: /PhantomJS/i, name: 'PhantomJS' },
    { pattern: /Puppeteer/i, name: 'Puppeteer' },
    { pattern: /Selenium/i, name: 'Selenium' },
    { pattern: /bot|crawler|spider|scraper/i, name: '不明なBot' },
  ];

  // Check for bots first
  for (const { pattern, name } of botPatterns) {
    if (pattern.test(ua)) {
      return { 
        device: 'Bot', 
        browser: name, 
        os: '-', 
        icon: 'bot',
        isBot: true,
        botName: name,
        browserVersion: null
      };
    }
  }
  
  // Detect device type
  let device = 'PC';
  let icon: 'monitor' | 'smartphone' | 'tablet' | 'bot' = 'monitor';
  if (/iPad/i.test(ua)) {
    device = 'iPad';
    icon = 'tablet';
  } else if (/iPhone/i.test(ua)) {
    device = 'iPhone';
    icon = 'smartphone';
  } else if (/Android.*Mobile/i.test(ua)) {
    device = 'Android Phone';
    icon = 'smartphone';
  } else if (/Android/i.test(ua)) {
    device = 'Android Tablet';
    icon = 'tablet';
  } else if (/Macintosh/i.test(ua)) {
    device = 'Mac';
  } else if (/Windows/i.test(ua)) {
    device = 'Windows PC';
  } else if (/Linux/i.test(ua)) {
    device = 'Linux PC';
  }
  
  // Detect browser with version
  let browser = '不明';
  let browserVersion: string | null = null;
  
  const edgeMatch = ua.match(/Edg\/([\d.]+)/i);
  const chromeMatch = ua.match(/Chrome\/([\d.]+)/i);
  const firefoxMatch = ua.match(/Firefox\/([\d.]+)/i);
  const safariMatch = ua.match(/Version\/([\d.]+).*Safari/i);
  const operaMatch = ua.match(/(?:Opera|OPR)\/([\d.]+)/i);
  
  if (edgeMatch) {
    browser = 'Edge';
    browserVersion = edgeMatch[1].split('.')[0];
  } else if (operaMatch) {
    browser = 'Opera';
    browserVersion = operaMatch[1].split('.')[0];
  } else if (chromeMatch && !/Chromium/i.test(ua)) {
    browser = 'Chrome';
    browserVersion = chromeMatch[1].split('.')[0];
  } else if (safariMatch) {
    browser = 'Safari';
    browserVersion = safariMatch[1].split('.')[0];
  } else if (firefoxMatch) {
    browser = 'Firefox';
    browserVersion = firefoxMatch[1].split('.')[0];
  }
  
  // Detect OS with version
  let os = '不明';
  if (/Windows NT 10/i.test(ua)) {
    os = 'Windows 10/11';
  } else if (/Windows NT 6\.3/i.test(ua)) {
    os = 'Windows 8.1';
  } else if (/Windows NT 6\.2/i.test(ua)) {
    os = 'Windows 8';
  } else if (/Windows NT 6\.1/i.test(ua)) {
    os = 'Windows 7';
  } else if (/Windows/i.test(ua)) {
    os = 'Windows';
  } else if (/Mac OS X/i.test(ua)) {
    const match = ua.match(/Mac OS X ([\d_]+)/);
    if (match) {
      const version = match[1].replace(/_/g, '.').split('.').slice(0, 2).join('.');
      os = `macOS ${version}`;
    } else {
      os = 'macOS';
    }
  } else if (/Android ([\d.]+)/i.test(ua)) {
    const match = ua.match(/Android ([\d.]+)/i);
    os = match ? `Android ${match[1].split('.')[0]}` : 'Android';
  } else if (/iOS ([\d_]+)/i.test(ua) || /iPhone OS ([\d_]+)/i.test(ua)) {
    const match = ua.match(/(?:iOS|iPhone OS) ([\d_]+)/i);
    if (match) {
      const version = match[1].replace(/_/g, '.').split('.').slice(0, 2).join('.');
      os = `iOS ${version}`;
    } else {
      os = 'iOS';
    }
  } else if (/Linux/i.test(ua)) {
    if (/Ubuntu/i.test(ua)) {
      os = 'Ubuntu';
    } else if (/Fedora/i.test(ua)) {
      os = 'Fedora';
    } else {
      os = 'Linux';
    }
  }
  
  return { 
    device, 
    browser: browserVersion ? `${browser} ${browserVersion}` : browser, 
    os, 
    icon,
    isBot: false,
    botName: null,
    browserVersion
  };
};

// Simple diff function to highlight changes between two texts
const getDiffLines = (oldText: string, newText: string): { type: 'same' | 'added' | 'removed'; text: string }[] => {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const result: { type: 'same' | 'added' | 'removed'; text: string }[] = [];
  
  const maxLen = Math.max(oldLines.length, newLines.length);
  
  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];
    
    if (oldLine === undefined) {
      result.push({ type: 'added', text: newLine });
    } else if (newLine === undefined) {
      result.push({ type: 'removed', text: oldLine });
    } else if (oldLine === newLine) {
      result.push({ type: 'same', text: newLine });
    } else {
      result.push({ type: 'removed', text: oldLine });
      result.push({ type: 'added', text: newLine });
    }
  }
  
  return result;
};

// Helper to format date for datetime-local input
const formatDateTimeLocal = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Check if a post is scheduled (future)
const isScheduledPost = (publishedAt: string | null): boolean => {
  if (!publishedAt) return false;
  return new Date(publishedAt) > new Date();
};

const emptyPost: Omit<BlogPostDB, 'id' | 'created_at' | 'updated_at'> = {
  slug: '',
  featured: false,
  image: '',
  title_ja: '',
  excerpt_ja: '',
  content_ja: '',
  date_ja: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }),
  category_ja: '',
  title_en: '',
  excerpt_en: '',
  content_en: '',
  date_en: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  category_en: '',
  status: 'published',
  published_at: formatDateTimeLocal(new Date()),
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Blog state
  const [posts, setPosts] = useState<BlogPostDB[]>([]);
  const [editingPost, setEditingPost] = useState<Partial<BlogPostDB> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>('editor');
  const [previewLang, setPreviewLang] = useState<'ja' | 'en'>('ja');

  // Chat state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Analytics state
  const [blogAnalytics, setBlogAnalytics] = useState<BlogAnalytics[]>([]);

  // User state
  const [users, setUsers] = useState<UserWithRole[]>([]);

  // Forum state
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [comments, setComments] = useState<ForumComment[]>([]);

  // Music state
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [editingTrack, setEditingTrack] = useState<Partial<MusicTrack> | null>(null);
  const [isTranscribingLyrics, setIsTranscribingLyrics] = useState(false);
  const [lyricsText, setLyricsText] = useState(''); // For editing lyrics as text
  const [lyricsPreviewTime, setLyricsPreviewTime] = useState(0);
  const lyricsAudioRef = useRef<HTMLAudioElement | null>(null);
  const [musicPlayCounts, setMusicPlayCounts] = useState<MusicPlayCount[]>([]);

  // AI Prompts state
  const [aiPrompts, setAiPrompts] = useState<AIPrompt[]>([]);
  const [editingPrompt, setEditingPrompt] = useState<Partial<AIPrompt> | null>(null);
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  const [isCreatingTrack, setIsCreatingTrack] = useState(false);
  const [promptVersions, setPromptVersions] = useState<AIPromptVersion[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState<string | null>(null);
  const [comparingVersion, setComparingVersion] = useState<AIPromptVersion | null>(null);

  // Settings state
  const [affiliateIdJp, setAffiliateIdJp] = useState('yukihamada-22');
  const [affiliateIdUs, setAffiliateIdUs] = useState('yukihamada-20');
  const [isReplacingAffiliateLinks, setIsReplacingAffiliateLinks] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (user) {
      checkAdminRole();
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  const checkAdminRole = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    } else {
      setIsAdmin(data);
    }

    if (data) {
      await Promise.all([
        fetchPosts(),
        fetchConversations(),
        fetchBlogAnalytics(),
        fetchUsers(),
        fetchTopics(),
        fetchComments(),
        fetchMusicTracks(),
        fetchAiPrompts(),
        fetchMusicPlayCounts()
      ]);
    }
    setIsLoading(false);
  };

  // Blog functions
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data.map(post => ({
        ...post,
        status: (post.status as 'draft' | 'published') || 'published',
      })));
    }
  };

  const handleSavePost = async () => {
    if (!editingPost) return;

    const postData = {
      slug: editingPost.slug,
      featured: editingPost.featured || false,
      image: editingPost.image || null,
      title_ja: editingPost.title_ja,
      excerpt_ja: editingPost.excerpt_ja,
      content_ja: editingPost.content_ja,
      date_ja: editingPost.date_ja,
      category_ja: editingPost.category_ja,
      title_en: editingPost.title_en,
      excerpt_en: editingPost.excerpt_en,
      content_en: editingPost.content_en,
      date_en: editingPost.date_en,
      category_en: editingPost.category_en,
      status: editingPost.status || 'published',
      published_at: editingPost.published_at ? new Date(editingPost.published_at).toISOString() : new Date().toISOString(),
    };

    if (isCreating) {
      const { error } = await supabase.from('blog_posts').insert([postData]);
      if (error) {
        toast.error('記事の作成に失敗しました');
      } else {
        toast.success('記事を作成しました');
        setEditingPost(null);
        setIsCreating(false);
        fetchPosts();
      }
    } else {
      const { error } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', editingPost.id);
      if (error) {
        toast.error('記事の更新に失敗しました');
      } else {
        toast.success('記事を更新しました');
        setEditingPost(null);
        fetchPosts();
      }
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) {
      toast.error('記事の削除に失敗しました');
    } else {
      toast.success('記事を削除しました');
      fetchPosts();
    }
  };

  // Chat functions
  const fetchConversations = async () => {
    const { data: convData, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && convData) {
      const conversationsWithDetails = await Promise.all(
        convData.map(async (conv) => {
          const { data: msgData } = await supabase
            .from('chat_messages')
            .select('content, role')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false });

          return {
            ...conv,
            message_count: msgData?.length || 0,
            last_message: msgData?.find(m => m.role === 'user')?.content?.substring(0, 50) || ''
          };
        })
      );
      setConversations(conversationsWithDetails);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data.map(m => ({ ...m, role: m.role as 'user' | 'assistant' })));
    }
  };

  const deleteConversation = async (id: string) => {
    if (!confirm('この会話を削除しますか？')) return;
    const { error } = await supabase.from('chat_conversations').delete().eq('id', id);
    if (error) {
      toast.error('会話の削除に失敗しました');
    } else {
      toast.success('会話を削除しました');
      setConversations(prev => prev.filter(c => c.id !== id));
      if (selectedConversation === id) {
        setSelectedConversation(null);
        setMessages([]);
      }
    }
  };

  // Analytics
  const fetchBlogAnalytics = async () => {
    const { data, error } = await supabase.rpc('get_blog_analytics');
    if (!error && data) {
      setBlogAnalytics(data);
    }
  };

  // User functions
  const fetchUsers = async () => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && profiles) {
      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id)
            .maybeSingle();

          return {
            id: profile.user_id,
            email: '',
            created_at: profile.created_at,
            role: roleData?.role || null,
            display_name: profile.display_name
          };
        })
      );
      setUsers(usersWithRoles);
    }
  };

  const updateUserRole = async (userId: string, newRole: string | null) => {
    // First delete existing role
    await supabase.from('user_roles').delete().eq('user_id', userId);

    if (newRole) {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole as 'admin' | 'moderator' | 'user' });

      if (error) {
        toast.error('ロールの更新に失敗しました');
      } else {
        toast.success('ロールを更新しました');
        fetchUsers();
      }
    } else {
      toast.success('ロールを削除しました');
      fetchUsers();
    }
  };

  // Forum functions
  const fetchTopics = async () => {
    const { data, error } = await supabase
      .from('forum_topics')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTopics(data);
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('forum_comments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setComments(data);
    }
  };

  const deleteTopic = async (id: string) => {
    if (!confirm('このトピックを削除しますか？')) return;
    const { error } = await supabase.from('forum_topics').delete().eq('id', id);
    if (error) {
      toast.error('トピックの削除に失敗しました');
    } else {
      toast.success('トピックを削除しました');
      fetchTopics();
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm('このコメントを削除しますか？')) return;
    const { error } = await supabase.from('forum_comments').delete().eq('id', id);
    if (error) {
      toast.error('コメントの削除に失敗しました');
    } else {
      toast.success('コメントを削除しました');
      fetchComments();
    }
  };

  // Music functions
  const fetchMusicTracks = async () => {
    const { data, error } = await supabase
      .from('music_tracks')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data) {
      const mappedTracks: MusicTrack[] = data.map((track) => ({
        ...track,
        lyrics: track.lyrics as unknown as LyricLine[] | null,
      }));
      setMusicTracks(mappedTracks);
    }
  };

  const fetchMusicPlayCounts = async () => {
    const { data, error } = await supabase.rpc('get_music_play_counts');
    if (!error && data) {
      setMusicPlayCounts(data as MusicPlayCount[]);
    }
  };

  const getTrackPlayCount = (trackId: string): { plays: number; listeners: number } => {
    const count = musicPlayCounts.find(c => c.track_id === trackId);
    return {
      plays: count?.play_count ? Number(count.play_count) : 0,
      listeners: count?.unique_listeners ? Number(count.unique_listeners) : 0
    };
  };

  const handleSaveTrack = async () => {
    if (!editingTrack) return;

    // Parse lyrics text to LyricLine array
    let parsedLyrics: LyricLine[] | null = null;
    if (lyricsText.trim()) {
      try {
        // Try parsing as JSON first
        const parsed = JSON.parse(lyricsText);
        if (Array.isArray(parsed)) {
          parsedLyrics = parsed;
        }
      } catch {
        // Parse as simple text format: "0:00 歌詞テキスト" per line
        const lines = lyricsText.trim().split('\n');
        parsedLyrics = lines.map((line, index) => {
          const match = line.match(/^(\d+):(\d+)\s+(.+)$/);
          if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const text = match[3];
            return {
              start: minutes * 60 + seconds,
              end: minutes * 60 + seconds + 5,
              text,
            };
          }
          return {
            start: index * 5,
            end: (index + 1) * 5,
            text: line,
          };
        });
      }
    }

    const trackData = {
      title: editingTrack.title,
      artist: editingTrack.artist || 'Yuki Hamada',
      src: editingTrack.src,
      artwork: editingTrack.artwork || null,
      color: editingTrack.color || '#3b82f6',
      display_order: editingTrack.display_order || 0,
      is_active: editingTrack.is_active ?? true,
      lyrics: parsedLyrics as unknown as Json,
    };

    if (isCreatingTrack) {
      const { error } = await supabase.from('music_tracks').insert([trackData as any]);
      if (error) {
        toast.error('トラックの作成に失敗しました');
      } else {
        toast.success('トラックを作成しました');
        setEditingTrack(null);
        setIsCreatingTrack(false);
        setLyricsText('');
        fetchMusicTracks();
      }
    } else {
      const { error } = await supabase
        .from('music_tracks')
        .update(trackData as any)
        .eq('id', editingTrack.id);
      if (error) {
        toast.error('トラックの更新に失敗しました');
      } else {
        toast.success('トラックを更新しました');
        setEditingTrack(null);
        setLyricsText('');
        fetchMusicTracks();
      }
    }
  };

  // Transcribe lyrics using AI
  const transcribeLyricsForTrack = async (trackSrc: string) => {
    setIsTranscribingLyrics(true);
    try {
      const audioResponse = await fetch(trackSrc);
      const audioBlob = await audioResponse.blob();
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'track.mp3');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-lyrics`,
        {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || 'Failed to transcribe';
        if (errorMsg.includes('missing_permissions')) {
          throw new Error('ElevenLabs APIキーにspeech_to_text権限がありません。ElevenLabsダッシュボードでAPIキーの権限を確認してください。');
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      // Convert to LyricLine format
      if (data.words && Array.isArray(data.words)) {
        const lyrics: LyricLine[] = [];
        let currentLine = { text: '', start: 0, end: 0 };
        
        data.words.forEach((word: { text: string; start: number; end: number }, index: number) => {
          if (index === 0) {
            currentLine = { text: word.text, start: word.start, end: word.end };
          } else {
            const gap = word.start - currentLine.end;
            if (gap > 1 || /[。、！？.!?,]$/.test(currentLine.text)) {
              lyrics.push(currentLine);
              currentLine = { text: word.text, start: word.start, end: word.end };
            } else {
              currentLine.text += ' ' + word.text;
              currentLine.end = word.end;
            }
          }
        });
        lyrics.push(currentLine);
        
        // Format as text
        const formattedText = lyrics.map(line => {
          const minutes = Math.floor(line.start / 60);
          const seconds = Math.floor(line.start % 60);
          return `${minutes}:${seconds.toString().padStart(2, '0')} ${line.text}`;
        }).join('\n');
        
        setLyricsText(formattedText);
        toast.success('歌詞を抽出しました');
      } else if (data.text) {
        setLyricsText(data.text);
        toast.success('歌詞を抽出しました');
      }
    } catch (error: any) {
      console.error('Transcription error:', error);
      toast.error(error.message || '歌詞の抽出に失敗しました');
    } finally {
      setIsTranscribingLyrics(false);
    }
  };

  const deleteTrack = async (id: string) => {
    if (!confirm('このトラックを削除しますか？')) return;
    const { error } = await supabase.from('music_tracks').delete().eq('id', id);
    if (error) {
      toast.error('トラックの削除に失敗しました');
    } else {
      toast.success('トラックを削除しました');
      fetchMusicTracks();
    }
  };

  const toggleTrackActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('music_tracks')
      .update({ is_active: !isActive })
      .eq('id', id);
    if (error) {
      toast.error('更新に失敗しました');
    } else {
      fetchMusicTracks();
    }
  };

  // AI Prompt functions
  const fetchAiPrompts = async () => {
    const { data, error } = await supabase
      .from('ai_prompts')
      .select('*')
      .order('name', { ascending: true });

    if (!error && data) {
      setAiPrompts(data);
    }
  };

  const handleSavePrompt = async () => {
    if (!editingPrompt) return;

    const promptData = {
      name: editingPrompt.name,
      content: editingPrompt.content,
      is_active: editingPrompt.is_active ?? true,
    };

    if (isCreatingPrompt) {
      const { error } = await supabase.from('ai_prompts').insert([promptData]);
      if (error) {
        toast.error('プロンプトの作成に失敗しました');
      } else {
        toast.success('プロンプトを作成しました');
        setEditingPrompt(null);
        setIsCreatingPrompt(false);
        fetchAiPrompts();
      }
    } else {
      // Save current version before updating
      const { data: currentPrompt } = await supabase
        .from('ai_prompts')
        .select('content')
        .eq('id', editingPrompt.id)
        .single();

      if (currentPrompt && currentPrompt.content !== editingPrompt.content) {
        // Get current max version number
        const { data: versions } = await supabase
          .from('ai_prompt_versions')
          .select('version_number')
          .eq('prompt_id', editingPrompt.id)
          .order('version_number', { ascending: false })
          .limit(1);

        const nextVersion = (versions?.[0]?.version_number || 0) + 1;

        // Save the old content as a version
        await supabase.from('ai_prompt_versions').insert({
          prompt_id: editingPrompt.id,
          content: currentPrompt.content,
          version_number: nextVersion,
          created_by: user?.id
        });
      }

      const { error } = await supabase
        .from('ai_prompts')
        .update(promptData)
        .eq('id', editingPrompt.id);
      if (error) {
        toast.error('プロンプトの更新に失敗しました');
      } else {
        toast.success('プロンプトを更新しました');
        setEditingPrompt(null);
        fetchAiPrompts();
      }
    }
  };

  const fetchPromptVersions = async (promptId: string) => {
    const { data, error } = await supabase
      .from('ai_prompt_versions')
      .select('*')
      .eq('prompt_id', promptId)
      .order('version_number', { ascending: false });

    if (!error && data) {
      setPromptVersions(data);
    }
  };

  const restorePromptVersion = async (version: AIPromptVersion) => {
    if (!confirm(`バージョン ${version.version_number} に復元しますか？現在の内容は履歴に保存されます。`)) return;

    // First save current content as a new version
    const { data: currentPrompt } = await supabase
      .from('ai_prompts')
      .select('content')
      .eq('id', version.prompt_id)
      .single();

    if (currentPrompt) {
      const { data: versions } = await supabase
        .from('ai_prompt_versions')
        .select('version_number')
        .eq('prompt_id', version.prompt_id)
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVersion = (versions?.[0]?.version_number || 0) + 1;

      await supabase.from('ai_prompt_versions').insert({
        prompt_id: version.prompt_id,
        content: currentPrompt.content,
        version_number: nextVersion,
        created_by: user?.id
      });
    }

    // Restore the old version
    const { error } = await supabase
      .from('ai_prompts')
      .update({ content: version.content })
      .eq('id', version.prompt_id);

    if (error) {
      toast.error('復元に失敗しました');
    } else {
      toast.success(`バージョン ${version.version_number} に復元しました`);
      setShowVersionHistory(null);
      fetchAiPrompts();
      fetchPromptVersions(version.prompt_id);
    }
  };

  const deletePrompt = async (id: string) => {
    if (!confirm('このプロンプトを削除しますか？')) return;
    const { error } = await supabase.from('ai_prompts').delete().eq('id', id);
    if (error) {
      toast.error('プロンプトの削除に失敗しました');
    } else {
      toast.success('プロンプトを削除しました');
      fetchAiPrompts();
    }
  };

  const togglePromptActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('ai_prompts')
      .update({ is_active: !isActive })
      .eq('id', id);
    if (error) {
      toast.error('更新に失敗しました');
    } else {
      fetchAiPrompts();
    }
  };

  const getPostTitle = (slug: string) => {
    // First check database posts
    const dbPost = posts.find(p => p.slug === slug);
    if (dbPost) return dbPost.title_ja;
    // Fallback to static blog posts
    const staticPost = blogPosts.find(p => p.slug === slug);
    return staticPost?.ja.title || slug;
  };

  const totalViews = blogAnalytics.reduce((sum, a) => sum + a.view_count, 0);
  const totalLikes = blogAnalytics.reduce((sum, a) => sum + a.like_count, 0);
  const totalUniqueVisitors = blogAnalytics.reduce((sum, a) => sum + a.unique_visitors, 0);

  // Replace affiliate links in all blog posts
  const replaceAffiliateLinks = async () => {
    if (!confirm(`すべてのブログ記事のAmazonリンクをアフィリエイトID「${affiliateIdJp}」（日本）と「${affiliateIdUs}」（米国）に置換しますか？`)) return;
    
    setIsReplacingAffiliateLinks(true);
    let updatedCount = 0;
    
    try {
      for (const post of posts) {
        let contentJaUpdated = post.content_ja;
        let contentEnUpdated = post.content_en;
        let hasChanges = false;
        
        // Replace Japanese Amazon affiliate tags
        const jpTagRegex = /amazon\.co\.jp([^"'\s]*?)tag=([a-zA-Z0-9_-]+)/g;
        if (jpTagRegex.test(contentJaUpdated)) {
          contentJaUpdated = contentJaUpdated.replace(/amazon\.co\.jp([^"'\s]*?)tag=[a-zA-Z0-9_-]+/g, `amazon.co.jp$1tag=${affiliateIdJp}`);
          hasChanges = true;
        }
        
        // Replace US Amazon affiliate tags
        const usTagRegex = /amazon\.com([^"'\s]*?)tag=([a-zA-Z0-9_-]+)/g;
        if (usTagRegex.test(contentEnUpdated)) {
          contentEnUpdated = contentEnUpdated.replace(/amazon\.com([^"'\s]*?)tag=[a-zA-Z0-9_-]+/g, `amazon.com$1tag=${affiliateIdUs}`);
          hasChanges = true;
        }
        
        if (hasChanges) {
          const { error } = await supabase
            .from('blog_posts')
            .update({ content_ja: contentJaUpdated, content_en: contentEnUpdated })
            .eq('id', post.id);
          
          if (!error) {
            updatedCount++;
          }
        }
      }
      
      toast.success(`${updatedCount}件の記事を更新しました`);
      fetchPosts();
    } catch (error) {
      toast.error('更新中にエラーが発生しました');
    } finally {
      setIsReplacingAffiliateLinks(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">管理者権限がありません</p>
              <Button onClick={() => navigate('/')}>ホームに戻る</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-20 pb-16 bg-background relative z-10">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">管理ダッシュボード</h1>
                  <p className="text-sm text-muted-foreground">すべての管理機能を一元管理</p>
                </div>
              </div>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                ログアウト
              </Button>
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-5xl grid-cols-8 bg-muted/50">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">概要</span>
              </TabsTrigger>
              <TabsTrigger value="blog" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">ブログ</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">チャット</span>
              </TabsTrigger>
              <TabsTrigger value="prompts" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">AI</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">ユーザー</span>
              </TabsTrigger>
              <TabsTrigger value="music" className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                <span className="hidden sm:inline">音楽</span>
              </TabsTrigger>
              <TabsTrigger value="forum" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">フォーラム</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">設定</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Summary Stats Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-blue-500" />
                      </div>
                      <span className="text-sm text-muted-foreground">総閲覧数</span>
                    </div>
                    <p className="text-3xl font-bold">{totalViews.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-500" />
                      </div>
                      <span className="text-sm text-muted-foreground">訪問者</span>
                    </div>
                    <p className="text-3xl font-bold">{totalUniqueVisitors.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-pink-500" />
                      </div>
                      <span className="text-sm text-muted-foreground">いいね</span>
                    </div>
                    <p className="text-3xl font-bold">{totalLikes.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-purple-500" />
                      </div>
                      <span className="text-sm text-muted-foreground">会話数</span>
                    </div>
                    <p className="text-3xl font-bold">{conversations.length}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Stats Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-amber-500" />
                      </div>
                      <span className="text-sm text-muted-foreground">記事数</span>
                    </div>
                    <p className="text-3xl font-bold">{posts.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <Music className="w-5 h-5 text-cyan-500" />
                      </div>
                      <span className="text-sm text-muted-foreground">楽曲数</span>
                    </div>
                    <p className="text-3xl font-bold">{musicTracks.filter(t => t.is_active).length}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Play className="w-3 h-3 inline mr-1" />
                      {musicPlayCounts.reduce((sum, c) => sum + Number(c.play_count), 0).toLocaleString()} 再生
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-indigo-500" />
                      </div>
                      <span className="text-sm text-muted-foreground">登録ユーザー</span>
                    </div>
                    <p className="text-3xl font-bold">{users.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-rose-500" />
                      </div>
                      <span className="text-sm text-muted-foreground">トピック</span>
                    </div>
                    <p className="text-3xl font-bold">{topics.length}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    クイックアクション
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => { setActiveTab('blog'); setIsCreating(true); setEditingPost(emptyPost); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      新規記事作成
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('chat')}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      チャット管理
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('music')}>
                      <Music className="w-4 h-4 mr-2" />
                      音楽管理
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('users')}>
                      <Users className="w-4 h-4 mr-2" />
                      ユーザー管理
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    記事別アクセス統計
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 font-medium">記事</th>
                          <th className="text-right p-3 font-medium">閲覧</th>
                          <th className="text-right p-3 font-medium">訪問者</th>
                          <th className="text-right p-3 font-medium">いいね</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blogAnalytics.slice(0, 10).map((a) => (
                          <tr key={a.post_slug} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                            <td className="p-3">
                              <a 
                                href={`/blog/${a.post_slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="max-w-xs truncate block text-primary hover:underline"
                              >
                                {getPostTitle(a.post_slug)}
                              </a>
                            </td>
                            <td className="text-right p-3">{a.view_count}</td>
                            <td className="text-right p-3">{a.unique_visitors}</td>
                            <td className="text-right p-3">{a.like_count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      最近の記事
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {posts.slice(0, 5).map((post) => (
                      <div key={post.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{post.title_ja}</p>
                          <p className="text-xs text-muted-foreground">{post.date_ja}</p>
                        </div>
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                          {post.status === 'published' ? '公開' : '下書き'}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      最近の会話
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {conversations.slice(0, 5).map((conv) => (
                      <div key={conv.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{conv.last_message || '(メッセージなし)'}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(conv.updated_at), 'MM/dd HH:mm', { locale: ja })}
                          </p>
                        </div>
                        <Badge variant="outline">{conv.message_count}件</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Blog Tab */}
            <TabsContent value="blog" className="space-y-4">
              {editingPost ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                      {isCreating ? '新規記事作成' : '記事編集'}
                      <div className="flex gap-2 flex-wrap">
                        {/* View mode buttons */}
                        <div className="flex border rounded-md overflow-hidden">
                          <Button 
                            variant={viewMode === 'editor' ? "default" : "ghost"} 
                            size="sm"
                            onClick={() => setViewMode('editor')}
                            className="rounded-none"
                          >
                            <PanelLeft className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant={viewMode === 'split' ? "default" : "ghost"} 
                            size="sm"
                            onClick={() => setViewMode('split')}
                            className="rounded-none border-x"
                          >
                            <Columns2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant={viewMode === 'preview' ? "default" : "ghost"} 
                            size="sm"
                            onClick={() => setViewMode('preview')}
                            className="rounded-none"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        {editingPost?.slug && (
                          <Button variant="secondary" size="sm" onClick={() => window.open(`/blog/${editingPost.slug}`, '_blank')}>
                            外部プレビュー
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => { setEditingPost(null); setIsCreating(false); setViewMode('editor'); }}>
                          <X className="mr-2 h-4 w-4" />キャンセル
                        </Button>
                        <Button size="sm" onClick={handleSavePost}>
                          <Save className="mr-2 h-4 w-4" />保存
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Language selector for preview */}
                    {(viewMode === 'preview' || viewMode === 'split') && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant={previewLang === 'ja' ? 'default' : 'outline'}
                          onClick={() => setPreviewLang('ja')}
                        >
                          日本語
                        </Button>
                        <Button 
                          size="sm" 
                          variant={previewLang === 'en' ? 'default' : 'outline'}
                          onClick={() => setPreviewLang('en')}
                        >
                          English
                        </Button>
                      </div>
                    )}

                    {/* Split view */}
                    {viewMode === 'split' ? (
                      <div className="grid grid-cols-2 gap-4">
                        {/* Editor side */}
                        <div className="space-y-4 border-r pr-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>スラグ</Label>
                              <Input
                                value={editingPost.slug || ''}
                                onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                                placeholder="2025-01-01-example"
                              />
                            </div>
                            <div>
                              <Label>画像パス</Label>
                              <Input
                                value={editingPost.image || ''}
                                onChange={(e) => setEditingPost({ ...editingPost, image: e.target.value })}
                                placeholder="/images/blog-example.jpg"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={editingPost.featured || false}
                                onCheckedChange={(checked) => setEditingPost({ ...editingPost, featured: checked })}
                              />
                              <Label>注目</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Select
                                value={editingPost.status || 'draft'}
                                onValueChange={(value: 'draft' | 'published') => setEditingPost({ ...editingPost, status: value })}
                              >
                                <SelectTrigger className="w-24 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">下書き</SelectItem>
                                  <SelectItem value="published">公開</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label>{previewLang === 'ja' ? 'タイトル' : 'Title'}</Label>
                            <Input
                              value={previewLang === 'ja' ? (editingPost.title_ja || '') : (editingPost.title_en || '')}
                              onChange={(e) => setEditingPost({ 
                                ...editingPost, 
                                [previewLang === 'ja' ? 'title_ja' : 'title_en']: e.target.value 
                              })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>{previewLang === 'ja' ? '日付' : 'Date'}</Label>
                              <Input
                                value={previewLang === 'ja' ? (editingPost.date_ja || '') : (editingPost.date_en || '')}
                                onChange={(e) => setEditingPost({ 
                                  ...editingPost, 
                                  [previewLang === 'ja' ? 'date_ja' : 'date_en']: e.target.value 
                                })}
                              />
                            </div>
                            <div>
                              <Label>{previewLang === 'ja' ? 'カテゴリ' : 'Category'}</Label>
                              <Input
                                value={previewLang === 'ja' ? (editingPost.category_ja || '') : (editingPost.category_en || '')}
                                onChange={(e) => setEditingPost({ 
                                  ...editingPost, 
                                  [previewLang === 'ja' ? 'category_ja' : 'category_en']: e.target.value 
                                })}
                              />
                            </div>
                          </div>
                          <div>
                            <Label>{previewLang === 'ja' ? '概要' : 'Excerpt'}</Label>
                            <Textarea
                              value={previewLang === 'ja' ? (editingPost.excerpt_ja || '') : (editingPost.excerpt_en || '')}
                              onChange={(e) => setEditingPost({ 
                                ...editingPost, 
                                [previewLang === 'ja' ? 'excerpt_ja' : 'excerpt_en']: e.target.value 
                              })}
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label>{previewLang === 'ja' ? '本文' : 'Content'}</Label>
                            <Textarea
                              value={previewLang === 'ja' ? (editingPost.content_ja || '') : (editingPost.content_en || '')}
                              onChange={(e) => setEditingPost({ 
                                ...editingPost, 
                                [previewLang === 'ja' ? 'content_ja' : 'content_en']: e.target.value 
                              })}
                              rows={20}
                              className="font-mono text-sm"
                            />
                          </div>
                        </div>
                        {/* Preview side */}
                        <div className="max-h-[800px] overflow-y-auto">
                          <MarkdownPreview 
                            content={previewLang === 'ja' ? editingPost.content_ja || '' : editingPost.content_en || ''}
                            title={previewLang === 'ja' ? editingPost.title_ja : editingPost.title_en}
                            excerpt={previewLang === 'ja' ? editingPost.excerpt_ja : editingPost.excerpt_en}
                          />
                        </div>
                      </div>
                    ) : viewMode === 'preview' ? (
                      <div className="min-h-[600px] max-h-[800px] overflow-y-auto">
                        <MarkdownPreview 
                          content={previewLang === 'ja' ? editingPost.content_ja || '' : editingPost.content_en || ''}
                          title={previewLang === 'ja' ? editingPost.title_ja : editingPost.title_en}
                          excerpt={previewLang === 'ja' ? editingPost.excerpt_ja : editingPost.excerpt_en}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>スラグ</Label>
                            <Input
                              value={editingPost.slug || ''}
                              onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                              placeholder="2025-01-01-example"
                            />
                          </div>
                          <div>
                            <Label>画像パス</Label>
                            <Input
                              value={editingPost.image || ''}
                              onChange={(e) => setEditingPost({ ...editingPost, image: e.target.value })}
                              placeholder="/images/blog-example.jpg"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={editingPost.featured || false}
                              onCheckedChange={(checked) => setEditingPost({ ...editingPost, featured: checked })}
                            />
                            <Label>注目記事</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label>ステータス:</Label>
                            <Select
                              value={editingPost.status || 'draft'}
                              onValueChange={(value: 'draft' | 'published') => setEditingPost({ ...editingPost, status: value })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">下書き</SelectItem>
                                <SelectItem value="published">公開</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Tabs defaultValue="ja">
                          <TabsList>
                            <TabsTrigger value="ja">日本語</TabsTrigger>
                            <TabsTrigger value="en">English</TabsTrigger>
                          </TabsList>
                          <TabsContent value="ja" className="space-y-4 mt-4">
                            <div>
                              <Label>タイトル</Label>
                              <Input
                                value={editingPost.title_ja || ''}
                                onChange={(e) => setEditingPost({ ...editingPost, title_ja: e.target.value })}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>日付</Label>
                                <Input
                                  value={editingPost.date_ja || ''}
                                  onChange={(e) => setEditingPost({ ...editingPost, date_ja: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label>カテゴリ</Label>
                                <Input
                                  value={editingPost.category_ja || ''}
                                  onChange={(e) => setEditingPost({ ...editingPost, category_ja: e.target.value })}
                                />
                              </div>
                            </div>
                            <div>
                              <Label>概要</Label>
                              <Textarea
                                value={editingPost.excerpt_ja || ''}
                                onChange={(e) => setEditingPost({ ...editingPost, excerpt_ja: e.target.value })}
                                rows={2}
                              />
                            </div>
                            <div>
                              <Label>本文</Label>
                              <Textarea
                                value={editingPost.content_ja || ''}
                                onChange={(e) => setEditingPost({ ...editingPost, content_ja: e.target.value })}
                                rows={15}
                                className="font-mono text-sm"
                              />
                            </div>
                          </TabsContent>
                          <TabsContent value="en" className="space-y-4 mt-4">
                            <div>
                              <Label>Title</Label>
                              <Input
                                value={editingPost.title_en || ''}
                                onChange={(e) => setEditingPost({ ...editingPost, title_en: e.target.value })}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Date</Label>
                                <Input
                                  value={editingPost.date_en || ''}
                                  onChange={(e) => setEditingPost({ ...editingPost, date_en: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label>Category</Label>
                                <Input
                                  value={editingPost.category_en || ''}
                                  onChange={(e) => setEditingPost({ ...editingPost, category_en: e.target.value })}
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Excerpt</Label>
                              <Textarea
                                value={editingPost.excerpt_en || ''}
                                onChange={(e) => setEditingPost({ ...editingPost, excerpt_en: e.target.value })}
                                rows={2}
                              />
                            </div>
                            <div>
                              <Label>Content</Label>
                              <Textarea
                                value={editingPost.content_en || ''}
                                onChange={(e) => setEditingPost({ ...editingPost, content_en: e.target.value })}
                                rows={15}
                                className="font-mono text-sm"
                              />
                            </div>
                          </TabsContent>
                        </Tabs>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">ブログ記事管理</h2>
                    <Button onClick={() => { setEditingPost(emptyPost); setIsCreating(true); }}>
                      <Plus className="mr-2 h-4 w-4" />新規作成
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {posts.length === 0 ? (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                          DBに記事がありません
                        </CardContent>
                      </Card>
                    ) : (
                      posts.map((post) => (
                        <Card key={post.id}>
                          <CardContent className="py-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {post.status === 'draft' ? (
                                    <Badge variant="outline" className="text-muted-foreground">下書き</Badge>
                                  ) : (
                                    <Badge variant="default" className="bg-green-600">公開</Badge>
                                  )}
                                  {post.featured && <Badge variant="secondary">注目</Badge>}
                                  <span className="text-xs text-muted-foreground">{post.category_ja}</span>
                                </div>
                                <h3 className="font-medium truncate">{post.title_ja}</h3>
                                <p className="text-sm text-muted-foreground">{post.date_ja}</p>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => navigate(`/blog/${post.slug}`)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setEditingPost(post)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)} className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">チャット履歴</h2>
                <Button variant="outline" onClick={fetchConversations}>
                  <RefreshCw className="mr-2 h-4 w-4" />更新
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="max-h-[600px] overflow-y-auto">
                  <CardHeader>
                    <CardTitle className="text-base">会話一覧</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {conversations.map((conv) => (
                        <div
                          key={conv.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedConversation === conv.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                          }`}
                          onClick={() => { setSelectedConversation(conv.id); fetchMessages(conv.id); }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{conv.last_message || '(空)'}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(conv.updated_at), 'MM/dd HH:mm', { locale: ja })}
                                ・{conv.message_count}件
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
                <Card className="max-h-[600px] overflow-y-auto">
                  <CardHeader>
                    <CardTitle className="text-base">メッセージ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {messages.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">会話を選択してください</p>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg ${
                            msg.role === 'user' ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(msg.created_at), 'HH:mm:ss')}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI Prompts Tab */}
            <TabsContent value="prompts" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">AIプロンプト管理</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={fetchAiPrompts}>
                    <RefreshCw className="mr-2 h-4 w-4" />更新
                  </Button>
                  <Button onClick={() => { setIsCreatingPrompt(true); setEditingPrompt({ name: '', content: '', is_active: true }); }}>
                    <Plus className="mr-2 h-4 w-4" />新規追加
                  </Button>
                </div>
              </div>

              {editingPrompt ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {isCreatingPrompt ? '新規プロンプト追加' : 'プロンプト編集'}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditingPrompt(null); setIsCreatingPrompt(false); }}>
                          <X className="mr-2 h-4 w-4" />キャンセル
                        </Button>
                        <Button size="sm" onClick={handleSavePrompt}>
                          <Save className="mr-2 h-4 w-4" />保存
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>プロンプト名</Label>
                        <Input
                          value={editingPrompt.name || ''}
                          onChange={(e) => setEditingPrompt({ ...editingPrompt, name: e.target.value })}
                          placeholder="yuki-chat"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          システム内で識別に使用する名前（例: yuki-chat）
                        </p>
                      </div>
                      <div className="flex items-end">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={editingPrompt.is_active ?? true}
                            onCheckedChange={(checked) => setEditingPrompt({ ...editingPrompt, is_active: checked })}
                          />
                          <Label>有効</Label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>プロンプト内容</Label>
                      <Textarea
                        value={editingPrompt.content || ''}
                        onChange={(e) => setEditingPrompt({ ...editingPrompt, content: e.target.value })}
                        placeholder="AIのシステムプロンプトを入力してください..."
                        rows={15}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        AIの振る舞いを定義するシステムプロンプト
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      {aiPrompts.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">プロンプトがありません</p>
                      ) : (
                        aiPrompts.map((prompt) => (
                          <div
                            key={prompt.id}
                            className={`p-4 rounded-lg border ${!prompt.is_active ? 'opacity-50' : ''}`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="w-5 h-5 text-primary" />
                                  <p className="font-medium">{prompt.name}</p>
                                  {!prompt.is_active && <Badge variant="secondary">無効</Badge>}
                                  {prompt.is_active && <Badge variant="default">有効</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                                  {prompt.content.substring(0, 200)}...
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  更新: {format(new Date(prompt.updated_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => { 
                                    setShowVersionHistory(showVersionHistory === prompt.id ? null : prompt.id);
                                    if (showVersionHistory !== prompt.id) {
                                      fetchPromptVersions(prompt.id);
                                    }
                                  }}
                                >
                                  <History className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => togglePromptActive(prompt.id, prompt.is_active)}
                                >
                                  {prompt.is_active ? '無効化' : '有効化'}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => { setEditingPrompt(prompt); setIsCreatingPrompt(false); }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deletePrompt(prompt.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {showVersionHistory === prompt.id && (
                              <div className="mt-4 border-t pt-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-medium flex items-center gap-2">
                                    <History className="w-4 h-4" />
                                    バージョン履歴
                                  </h4>
                                  {comparingVersion && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setComparingVersion(null)}
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      差分を閉じる
                                    </Button>
                                  )}
                                </div>
                                
                                {comparingVersion && (
                                  <div className="mb-4 p-3 bg-muted/30 rounded-lg border">
                                    <div className="flex items-center gap-2 mb-2">
                                      <GitCompare className="w-4 h-4" />
                                      <span className="text-sm font-medium">
                                        v{comparingVersion.version_number} → 現在
                                      </span>
                                    </div>
                                    <div className="font-mono text-xs max-h-64 overflow-y-auto space-y-0.5">
                                      {getDiffLines(comparingVersion.content, prompt.content).map((line, i) => (
                                        <div
                                          key={i}
                                          className={`px-2 py-0.5 rounded ${
                                            line.type === 'added' 
                                              ? 'bg-green-500/20 text-green-700 dark:text-green-400' 
                                              : line.type === 'removed' 
                                                ? 'bg-red-500/20 text-red-700 dark:text-red-400' 
                                                : 'text-muted-foreground'
                                          }`}
                                        >
                                          <span className="mr-2 opacity-50">
                                            {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                                          </span>
                                          {line.text || ' '}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {promptVersions.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">履歴がありません</p>
                                ) : (
                                  <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {promptVersions.map((version) => (
                                      <div
                                        key={version.id}
                                        className={`p-3 rounded-lg text-sm ${
                                          comparingVersion?.id === version.id 
                                            ? 'bg-primary/10 border border-primary' 
                                            : 'bg-muted/50'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <Badge variant="outline">v{version.version_number}</Badge>
                                          <div className="flex items-center gap-1">
                                            <span className="text-xs text-muted-foreground mr-2">
                                              {format(new Date(version.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setComparingVersion(comparingVersion?.id === version.id ? null : version)}
                                              className="h-7"
                                            >
                                              <GitCompare className="h-3 w-3 mr-1" />
                                              差分
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => restorePromptVersion(version)}
                                              className="h-7"
                                            >
                                              <RotateCcw className="h-3 w-3 mr-1" />
                                              復元
                                            </Button>
                                          </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                                          {version.content.substring(0, 150)}...
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">ユーザー管理</h2>
                <Button variant="outline" onClick={fetchUsers}>
                  <RefreshCw className="mr-2 h-4 w-4" />更新
                </Button>
              </div>
              <Card>
                <CardContent className="pt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 font-medium">ユーザー</th>
                          <th className="text-left p-3 font-medium">登録日</th>
                          <th className="text-left p-3 font-medium">ロール</th>
                          <th className="text-right p-3 font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-b border-border/50">
                            <td className="p-3">
                              <div className="font-medium">{u.display_name || '(名前未設定)'}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-xs">{u.id}</div>
                            </td>
                            <td className="p-3 text-sm">
                              {format(new Date(u.created_at), 'yyyy/MM/dd', { locale: ja })}
                            </td>
                            <td className="p-3">
                              <Select
                                value={u.role || 'none'}
                                onValueChange={(value) => updateUserRole(u.id, value === 'none' ? null : value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">なし</SelectItem>
                                  <SelectItem value="user">ユーザー</SelectItem>
                                  <SelectItem value="moderator">モデレーター</SelectItem>
                                  <SelectItem value="admin">管理者</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-3 text-right">
                              {u.role && (
                                <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                                  {u.role}
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Music Tab */}
            <TabsContent value="music" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">音楽管理</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={fetchMusicTracks}>
                    <RefreshCw className="mr-2 h-4 w-4" />更新
                  </Button>
                  <Button onClick={() => { setIsCreatingTrack(true); setEditingTrack({ title: '', artist: 'Yuki Hamada', src: '', color: '#3b82f6', is_active: true, display_order: musicTracks.length + 1 }); }}>
                    <Plus className="mr-2 h-4 w-4" />新規追加
                  </Button>
                </div>
              </div>

              {editingTrack ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {isCreatingTrack ? '新規トラック追加' : 'トラック編集'}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditingTrack(null); setIsCreatingTrack(false); }}>
                          <X className="mr-2 h-4 w-4" />キャンセル
                        </Button>
                        <Button size="sm" onClick={handleSaveTrack}>
                          <Save className="mr-2 h-4 w-4" />保存
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>タイトル</Label>
                        <Input
                          value={editingTrack.title || ''}
                          onChange={(e) => setEditingTrack({ ...editingTrack, title: e.target.value })}
                          placeholder="曲のタイトル"
                        />
                      </div>
                      <div>
                        <Label>アーティスト</Label>
                        <Input
                          value={editingTrack.artist || ''}
                          onChange={(e) => setEditingTrack({ ...editingTrack, artist: e.target.value })}
                          placeholder="Yuki Hamada"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>音声ファイルパス</Label>
                        <Input
                          value={editingTrack.src || ''}
                          onChange={(e) => setEditingTrack({ ...editingTrack, src: e.target.value })}
                          placeholder="/audio/track-name.mp3"
                        />
                      </div>
                      <div>
                        <Label>アートワークパス</Label>
                        <Input
                          value={editingTrack.artwork || ''}
                          onChange={(e) => setEditingTrack({ ...editingTrack, artwork: e.target.value })}
                          placeholder="/assets/album-name.jpg"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>テーマカラー</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={editingTrack.color || '#3b82f6'}
                            onChange={(e) => setEditingTrack({ ...editingTrack, color: e.target.value })}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={editingTrack.color || '#3b82f6'}
                            onChange={(e) => setEditingTrack({ ...editingTrack, color: e.target.value })}
                            placeholder="#3b82f6"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>表示順</Label>
                        <Input
                          type="number"
                          value={editingTrack.display_order || 0}
                          onChange={(e) => setEditingTrack({ ...editingTrack, display_order: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={editingTrack.is_active ?? true}
                            onCheckedChange={(checked) => setEditingTrack({ ...editingTrack, is_active: checked })}
                          />
                          <Label>有効</Label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Lyrics Section with Preview */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">歌詞編集・プレビュー</Label>
                        {editingTrack.src && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => transcribeLyricsForTrack(editingTrack.src!)}
                            disabled={isTranscribingLyrics}
                          >
                            {isTranscribingLyrics ? (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                抽出中...
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                AIで歌詞を抽出
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      
                      {/* Audio Player for Preview */}
                      {editingTrack.src && (
                        <div className="p-3 bg-muted/30 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${editingTrack.color || '#3b82f6'}20` }}
                            >
                              <Music className="w-5 h-5" style={{ color: editingTrack.color || '#3b82f6' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{editingTrack.title || '新規トラック'}</p>
                              <audio 
                                ref={lyricsAudioRef}
                                src={editingTrack.src}
                                className="w-full h-8 mt-1"
                                controls
                                onTimeUpdate={(e) => setLyricsPreviewTime(e.currentTarget.currentTime)}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Editor */}
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">テキスト編集（分:秒 歌詞）</Label>
                          <Textarea
                            value={lyricsText}
                            onChange={(e) => setLyricsText(e.target.value)}
                            placeholder="0:00 最初の歌詞&#10;0:15 次の歌詞&#10;0:30 続きの歌詞..."
                            rows={12}
                            className="font-mono text-sm"
                          />
                          <p className="text-xs text-muted-foreground">
                            各行を「分:秒 歌詞」形式で入力（例: 1:23 歌詞テキスト）
                          </p>
                        </div>

                        {/* Preview */}
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">プレビュー（現在: {Math.floor(lyricsPreviewTime / 60)}:{String(Math.floor(lyricsPreviewTime % 60)).padStart(2, '0')}）</Label>
                          <div className="border rounded-lg h-[288px] overflow-y-auto bg-background">
                            {lyricsText.trim() ? (
                              <div className="p-3 space-y-1">
                                {lyricsText.split('\n').filter(line => line.trim()).map((line, idx) => {
                                  const match = line.match(/^(\d+):(\d{1,2})\s+(.+)$/);
                                  if (!match) {
                                    return (
                                      <div key={idx} className="p-2 rounded text-sm text-muted-foreground italic">
                                        {line} <span className="text-xs text-destructive ml-2">（形式エラー）</span>
                                      </div>
                                    );
                                  }
                                  const minutes = parseInt(match[1]);
                                  const seconds = parseInt(match[2]);
                                  const text = match[3];
                                  const lineTime = minutes * 60 + seconds;
                                  
                                  // Find next line time for highlighting current
                                  const nextLine = lyricsText.split('\n').filter(l => l.trim())[idx + 1];
                                  const nextMatch = nextLine?.match(/^(\d+):(\d{1,2})\s+/);
                                  const nextTime = nextMatch ? parseInt(nextMatch[1]) * 60 + parseInt(nextMatch[2]) : Infinity;
                                  
                                  const isActive = lyricsPreviewTime >= lineTime && lyricsPreviewTime < nextTime;
                                  const isPast = lyricsPreviewTime >= nextTime;
                                  
                                  return (
                                    <div 
                                      key={idx} 
                                      className={`p-2 rounded-lg text-sm flex items-start gap-3 cursor-pointer transition-colors ${
                                        isActive 
                                          ? 'bg-primary/20 text-foreground font-medium' 
                                          : isPast 
                                            ? 'text-muted-foreground/60' 
                                            : 'text-foreground/80 hover:bg-muted/50'
                                      }`}
                                      onClick={() => {
                                        if (lyricsAudioRef.current) {
                                          lyricsAudioRef.current.currentTime = lineTime;
                                        }
                                      }}
                                    >
                                      <span className="text-xs font-mono text-muted-foreground shrink-0 w-10">
                                        {minutes}:{String(seconds).padStart(2, '0')}
                                      </span>
                                      <span className="flex-1">{text}</span>
                                      {isActive && (
                                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0 mt-1.5" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                歌詞を入力またはAIで抽出してください
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            クリックでその位置にジャンプ・再生中の歌詞がハイライトされます
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      {musicTracks.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">トラックがありません</p>
                      ) : (
                        musicTracks.map((track) => (
                          <div
                            key={track.id}
                            className={`flex items-center gap-4 p-3 rounded-lg border ${!track.is_active ? 'opacity-50' : ''}`}
                          >
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${track.color}20` }}
                            >
                              <Music className="w-6 h-6" style={{ color: track.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{track.title}</p>
                                {!track.is_active && <Badge variant="secondary">無効</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground">{track.artist}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Play className="w-3 h-3" />
                                  {getTrackPlayCount(track.id).plays.toLocaleString()} 再生
                                </span>
                                <span className="flex items-center gap-1">
                                  <Headphones className="w-3 h-3" />
                                  {getTrackPlayCount(track.id).listeners.toLocaleString()} 人
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleTrackActive(track.id, track.is_active)}
                              >
                                {track.is_active ? '無効化' : '有効化'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setEditingTrack(track); setIsCreatingTrack(false); }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTrack(track.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Forum Tab */}
            <TabsContent value="forum" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">フォーラム管理</h2>
                <Button variant="outline" onClick={() => { fetchTopics(); fetchComments(); }}>
                  <RefreshCw className="mr-2 h-4 w-4" />更新
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">トピック ({topics.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                    {topics.map((topic) => (
                      <div key={topic.id} className="p-3 rounded-lg border">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {topic.is_pinned && <Badge variant="outline">固定</Badge>}
                              <Badge variant="secondary">{topic.category}</Badge>
                            </div>
                            <h4 className="font-medium truncate">{topic.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              閲覧: {topic.view_count} ・ {format(new Date(topic.created_at), 'MM/dd', { locale: ja })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTopic(topic.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">最近のコメント ({comments.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                    {comments.map((comment) => (
                      <div key={comment.id} className="p-3 rounded-lg border">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm line-clamp-2">{comment.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(comment.created_at), 'MM/dd HH:mm', { locale: ja })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteComment(comment.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">サイト設定</h2>
              </div>

              {/* Affiliate Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="w-5 h-5" />
                    Amazonアフィリエイト設定
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>日本（amazon.co.jp）アフィリエイトID</Label>
                      <Input
                        value={affiliateIdJp}
                        onChange={(e) => setAffiliateIdJp(e.target.value)}
                        placeholder="yourname-22"
                      />
                      <p className="text-xs text-muted-foreground">
                        例: yukihamada-22
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>米国（amazon.com）アフィリエイトID</Label>
                      <Input
                        value={affiliateIdUs}
                        onChange={(e) => setAffiliateIdUs(e.target.value)}
                        placeholder="yourname-20"
                      />
                      <p className="text-xs text-muted-foreground">
                        例: yukihamada-20
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">一括置換</h4>
                        <p className="text-sm text-muted-foreground">
                          すべてのブログ記事のAmazonリンクを上記のアフィリエイトIDに置換します
                        </p>
                      </div>
                      <Button 
                        onClick={replaceAffiliateLinks}
                        disabled={isReplacingAffiliateLinks || !affiliateIdJp}
                      >
                        {isReplacingAffiliateLinks ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            置換中...
                          </>
                        ) : (
                          <>
                            <Replace className="mr-2 h-4 w-4" />
                            一括置換を実行
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">リンクの作り方</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>1. <a href="https://affiliate.amazon.co.jp/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Amazonアソシエイト</a>に登録</p>
                      <p>2. 商品ページURLに <code className="bg-muted px-1 rounded">?tag=あなたのID-22</code> を追加</p>
                      <p>3. ブログ記事内でリンクを使用</p>
                    </div>
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs font-mono break-all">
                        https://www.amazon.co.jp/dp/B0BQJZXR6M?tag={affiliateIdJp}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AdminDashboard;
