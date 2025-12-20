import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { 
  MessageCircle, User, Bot, ChevronRight, ArrowLeft, Trash2, RefreshCw, 
  BarChart3, Eye, Heart, TrendingUp, LogOut, Lock, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { blogPosts } from '@/data/blogPosts';
import { Session } from '@supabase/supabase-js';

type Conversation = {
  id: string;
  visitor_id: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message: string;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

type BlogAnalytics = {
  post_slug: string;
  view_count: number;
  unique_visitors: number;
  like_count: number;
  first_view_at: string | null;
  last_view_at: string | null;
};

const ChatAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Auth state
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Chat state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  // Analytics state
  const [blogAnalytics, setBlogAnalytics] = useState<BlogAnalytics[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Check auth and admin status
  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthLoading(true);
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer the role check
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsAuthLoading(false);
        }
      });

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession?.user) {
        await checkAdminRole(currentSession.user.id);
      }
      setIsAuthLoading(false);
      
      return () => subscription.unsubscribe();
    };
    
    checkAuth();
  }, []);

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: 'admin'
    });
    
    if (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    } else {
      setIsAdmin(data === true);
    }
    setIsAuthLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      setAuthError(error.message);
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
  };

  const fetchConversations = async () => {
    setIsLoading(true);
    const { data: convData, error: convError } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (convError) {
      console.error('Error fetching conversations:', convError);
      setIsLoading(false);
      return;
    }

    const conversationsWithDetails = await Promise.all(
      (convData || []).map(async (conv) => {
        const { data: msgData } = await supabase
          .from('chat_messages')
          .select('content, role')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false });

        const messageCount = msgData?.length || 0;
        const lastUserMessage = msgData?.find(m => m.role === 'user')?.content || '';

        return {
          ...conv,
          message_count: messageCount,
          last_message: lastUserMessage.substring(0, 50) + (lastUserMessage.length > 50 ? '...' : '')
        };
      })
    );

    setConversations(conversationsWithDetails);
    setIsLoading(false);
  };

  const fetchMessages = async (conversationId: string) => {
    setIsLoadingMessages(true);
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages((data || []).map(m => ({
        ...m,
        role: m.role as 'user' | 'assistant'
      })));
    }
    setIsLoadingMessages(false);
  };

  const fetchBlogAnalytics = async () => {
    setIsLoadingAnalytics(true);
    const { data, error } = await supabase.rpc('get_blog_analytics');
    
    if (error) {
      console.error('Error fetching blog analytics:', error);
    } else {
      setBlogAnalytics(data || []);
    }
    setIsLoadingAnalytics(false);
  };

  const deleteConversation = async (conversationId: string) => {
    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "エラー",
        description: "会話の削除に失敗しました",
        variant: "destructive",
      });
    } else {
      toast({
        title: "削除完了",
        description: "会話を削除しました",
      });
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchConversations();
      fetchBlogAnalytics();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const getPostTitle = (slug: string) => {
    const post = blogPosts.find(p => p.slug === slug);
    return post?.title || slug;
  };

  const totalViews = blogAnalytics.reduce((sum, a) => sum + a.view_count, 0);
  const totalLikes = blogAnalytics.reduce((sum, a) => sum + a.like_count, 0);
  const totalUniqueVisitors = blogAnalytics.reduce((sum, a) => sum + a.unique_visitors, 0);

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Login form
  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">管理者ログイン</h1>
              <p className="text-muted-foreground text-sm">
                {session && !isAdmin 
                  ? 'このアカウントには管理者権限がありません' 
                  : '管理者アカウントでログインしてください'}
              </p>
            </div>
            
            {session && !isAdmin ? (
              <div className="space-y-4">
                <p className="text-center text-sm text-muted-foreground">
                  ログイン中: {session.user.email}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  ログアウト
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate('/')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  ホームに戻る
                </Button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                {authError && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                    {authError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">メールアドレス</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">パスワード</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ログイン中...
                    </>
                  ) : (
                    'ログイン'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate('/')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  ホームに戻る
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold">管理ダッシュボード</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {session.user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">ログアウト</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              アクセス解析
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              チャット管理
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">総閲覧数</span>
                </div>
                <p className="text-3xl font-bold">{totalViews.toLocaleString()}</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">ユニーク訪問者</span>
                </div>
                <p className="text-3xl font-bold">{totalUniqueVisitors.toLocaleString()}</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-pink-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">総いいね数</span>
                </div>
                <p className="text-3xl font-bold">{totalLikes.toLocaleString()}</p>
              </div>
            </div>

            {/* Blog Stats Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  記事別アクセス統計
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchBlogAnalytics}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
                  更新
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="text-left p-4 font-medium">記事タイトル</th>
                      <th className="text-right p-4 font-medium whitespace-nowrap">閲覧数</th>
                      <th className="text-right p-4 font-medium whitespace-nowrap">訪問者</th>
                      <th className="text-right p-4 font-medium whitespace-nowrap">いいね</th>
                      <th className="text-right p-4 font-medium whitespace-nowrap">最終閲覧</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingAnalytics ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                        </td>
                      </tr>
                    ) : blogAnalytics.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          まだデータがありません
                        </td>
                      </tr>
                    ) : (
                      blogAnalytics.map((analytics) => (
                        <tr key={analytics.post_slug} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="p-4">
                            <div className="max-w-md truncate">
                              {getPostTitle(analytics.post_slug)}
                            </div>
                            <div className="text-xs text-muted-foreground">{analytics.post_slug}</div>
                          </td>
                          <td className="text-right p-4 font-medium">{analytics.view_count}</td>
                          <td className="text-right p-4">{analytics.unique_visitors}</td>
                          <td className="text-right p-4">
                            <span className="inline-flex items-center gap-1 text-pink-500">
                              <Heart className="w-3 h-3" />
                              {analytics.like_count}
                            </span>
                          </td>
                          <td className="text-right p-4 text-sm text-muted-foreground whitespace-nowrap">
                            {analytics.last_view_at 
                              ? format(new Date(analytics.last_view_at), 'MM/dd HH:mm', { locale: ja })
                              : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                チャット履歴
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchConversations}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                更新
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
              {/* Conversations List */}
              <div className="lg:col-span-1 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border bg-muted/30">
                  <h3 className="font-semibold flex items-center gap-2">
                    会話一覧
                    <span className="text-xs text-muted-foreground ml-auto">
                      {conversations.length}件
                    </span>
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>まだ会話がありません</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {conversations.map((conv) => (
                        <div
                          key={conv.id}
                          className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedConversation === conv.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedConversation(conv.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs text-muted-foreground truncate">
                                  {conv.visitor_id.substring(0, 8)}...
                                </span>
                              </div>
                              <p className="text-sm font-medium truncate">
                                {conv.last_message || '(メッセージなし)'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(conv.updated_at), 'MM/dd HH:mm', { locale: ja })}
                                </span>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  {conv.message_count}件
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('この会話を削除しますか？')) {
                                    deleteConversation(conv.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Messages Panel */}
              <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border bg-muted/30">
                  <h3 className="font-semibold flex items-center gap-2">
                    {selectedConversation ? (
                      <>
                        <MessageCircle className="w-4 h-4" />
                        メッセージ詳細
                      </>
                    ) : (
                      <span className="text-muted-foreground">会話を選択してください</span>
                    )}
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {!selectedConversation ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <MessageCircle className="w-16 h-16 opacity-30 mb-4" />
                      <p>左側のリストから会話を選択してください</p>
                    </div>
                  ) : isLoadingMessages ? (
                    <div className="flex items-center justify-center h-32">
                      <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>メッセージがありません</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {message.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-primary" />
                            </div>
                          )}
                          <div className={`max-w-[70%] ${message.role === 'user' ? 'order-1' : ''}`}>
                            <div
                              className={`rounded-2xl px-4 py-3 ${
                                message.role === 'user'
                                  ? 'bg-primary text-primary-foreground rounded-br-md'
                                  : 'bg-muted text-foreground rounded-bl-md'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 px-2">
                              {format(new Date(message.created_at), 'MM/dd HH:mm:ss', { locale: ja })}
                            </p>
                          </div>
                          {message.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-accent" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ChatAdmin;