import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  LayoutDashboard, FileText, MessageCircle, Users, MessageSquare,
  BarChart3, Eye, Heart, TrendingUp, RefreshCw, ArrowLeft,
  Plus, Edit, Trash2, Save, X, ChevronRight, User, Bot,
  Shield, LogOut, Settings, Columns2, PanelLeft
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
  status: 'draft',
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
        fetchComments()
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
      status: editingPost.status || 'draft',
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

  const getPostTitle = (slug: string) => {
    const post = blogPosts.find(p => p.slug === slug);
    return post?.ja.title || slug;
  };

  const totalViews = blogAnalytics.reduce((sum, a) => sum + a.view_count, 0);
  const totalLikes = blogAnalytics.reduce((sum, a) => sum + a.like_count, 0);
  const totalUniqueVisitors = blogAnalytics.reduce((sum, a) => sum + a.unique_visitors, 0);

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
      <main className="min-h-screen pt-20 pb-16 bg-background">
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
            <TabsList className="grid w-full max-w-2xl grid-cols-5 bg-muted/50">
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
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">ユーザー</span>
              </TabsTrigger>
              <TabsTrigger value="forum" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">フォーラム</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
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
                          <tr key={a.post_slug} className="border-b border-border/50">
                            <td className="p-3">
                              <div className="max-w-xs truncate">{getPostTitle(a.post_slug)}</div>
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
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AdminDashboard;
