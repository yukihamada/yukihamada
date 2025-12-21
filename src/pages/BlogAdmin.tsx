import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Eye, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

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
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

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
  published_at: formatDateTimeLocal(new Date()),
};

const BlogAdmin = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [posts, setPosts] = useState<BlogPostDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<BlogPostDB> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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
      fetchPosts();
    } else {
      setIsLoading(false);
    }
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      toast.error('ブログ記事の取得に失敗しました');
    } else {
      setPosts(data || []);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
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
      published_at: editingPost.published_at ? new Date(editingPost.published_at).toISOString() : new Date().toISOString(),
    };

    if (isCreating) {
      const { error } = await supabase
        .from('blog_posts')
        .insert([postData]);

      if (error) {
        console.error('Error creating post:', error);
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
        console.error('Error updating post:', error);
        toast.error('記事の更新に失敗しました');
      } else {
        toast.success('記事を更新しました');
        setEditingPost(null);
        fetchPosts();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      toast.error('記事の削除に失敗しました');
    } else {
      toast.success('記事を削除しました');
      fetchPosts();
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                管理者権限がありません。管理者に連絡してください。
              </p>
              <Button
                className="w-full mt-4"
                onClick={() => navigate('/')}
              >
                ホームに戻る
              </Button>
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
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/blog')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              ブログに戻る
            </Button>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">ブログ管理</h1>
              <Button
                onClick={() => {
                  setEditingPost(emptyPost);
                  setIsCreating(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                新規作成
              </Button>
            </div>
          </motion.div>

          {editingPost ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {isCreating ? '新規記事作成' : '記事編集'}
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => {
                        setEditingPost(null);
                        setIsCreating(false);
                      }}>
                        <X className="mr-2 h-4 w-4" />
                        キャンセル
                      </Button>
                      <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        保存
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="slug">スラグ（URL）</Label>
                        <Input
                          id="slug"
                          value={editingPost.slug || ''}
                          onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                          placeholder="2025-01-01-example"
                        />
                      </div>
                      <div>
                        <Label htmlFor="image">画像パス</Label>
                        <Input
                          id="image"
                          value={editingPost.image || ''}
                          onChange={(e) => setEditingPost({ ...editingPost, image: e.target.value })}
                          placeholder="/images/blog-example.jpg"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="featured"
                          checked={editingPost.featured || false}
                          onCheckedChange={(checked) => setEditingPost({ ...editingPost, featured: checked })}
                        />
                        <Label htmlFor="featured">注目記事</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="published_at" className="whitespace-nowrap">公開日時</Label>
                        <Input
                          id="published_at"
                          type="datetime-local"
                          value={editingPost.published_at ? formatDateTimeLocal(new Date(editingPost.published_at)) : formatDateTimeLocal(new Date())}
                          onChange={(e) => setEditingPost({ ...editingPost, published_at: e.target.value })}
                          className="w-auto"
                        />
                        {editingPost.published_at && isScheduledPost(editingPost.published_at) && (
                          <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            予約投稿
                          </span>
                        )}
                      </div>
                    </div>

                    <Tabs defaultValue="ja" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="ja">日本語</TabsTrigger>
                        <TabsTrigger value="en">English</TabsTrigger>
                      </TabsList>
                      <TabsContent value="ja" className="space-y-4">
                        <div>
                          <Label htmlFor="title_ja">タイトル</Label>
                          <Input
                            id="title_ja"
                            value={editingPost.title_ja || ''}
                            onChange={(e) => setEditingPost({ ...editingPost, title_ja: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="date_ja">日付</Label>
                            <Input
                              id="date_ja"
                              value={editingPost.date_ja || ''}
                              onChange={(e) => setEditingPost({ ...editingPost, date_ja: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="category_ja">カテゴリ</Label>
                            <Input
                              id="category_ja"
                              value={editingPost.category_ja || ''}
                              onChange={(e) => setEditingPost({ ...editingPost, category_ja: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="excerpt_ja">概要</Label>
                          <Textarea
                            id="excerpt_ja"
                            value={editingPost.excerpt_ja || ''}
                            onChange={(e) => setEditingPost({ ...editingPost, excerpt_ja: e.target.value })}
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="content_ja">本文（Markdown）</Label>
                          <Textarea
                            id="content_ja"
                            value={editingPost.content_ja || ''}
                            onChange={(e) => setEditingPost({ ...editingPost, content_ja: e.target.value })}
                            rows={20}
                            className="font-mono text-sm"
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value="en" className="space-y-4">
                        <div>
                          <Label htmlFor="title_en">Title</Label>
                          <Input
                            id="title_en"
                            value={editingPost.title_en || ''}
                            onChange={(e) => setEditingPost({ ...editingPost, title_en: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="date_en">Date</Label>
                            <Input
                              id="date_en"
                              value={editingPost.date_en || ''}
                              onChange={(e) => setEditingPost({ ...editingPost, date_en: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="category_en">Category</Label>
                            <Input
                              id="category_en"
                              value={editingPost.category_en || ''}
                              onChange={(e) => setEditingPost({ ...editingPost, category_en: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="excerpt_en">Excerpt</Label>
                          <Textarea
                            id="excerpt_en"
                            value={editingPost.excerpt_en || ''}
                            onChange={(e) => setEditingPost({ ...editingPost, excerpt_en: e.target.value })}
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="content_en">Content (Markdown)</Label>
                          <Textarea
                            id="content_en"
                            value={editingPost.content_en || ''}
                            onChange={(e) => setEditingPost({ ...editingPost, content_en: e.target.value })}
                            rows={20}
                            className="font-mono text-sm"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    まだDBに記事がありません。新規作成してください。
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {isScheduledPost(post.published_at) && (
                                <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  予約
                                </span>
                              )}
                              {post.featured && (
                                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                                  注目
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">{post.category_ja}</span>
                            </div>
                            <h3 className="font-semibold">{post.title_ja}</h3>
                            <p className="text-sm text-muted-foreground">
                              {post.published_at 
                                ? new Date(post.published_at).toLocaleString('ja-JP', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : post.date_ja}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/blog/${post.slug}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingPost(post)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(post.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BlogAdmin;
