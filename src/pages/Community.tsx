import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { 
  MessageSquare, 
  Plus, 
  ArrowLeft, 
  Clock, 
  User, 
  Loader2,
  Send,
  X,
  Lock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';

interface Topic {
  id: string;
  title: string;
  content: string;
  category: string;
  view_count: number;
  created_at: string;
  user_id: string;
  profiles?: {
    public_id: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
  comment_count?: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    public_id: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

const Community = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const texts = {
    en: {
      title: 'Community',
      subtitle: 'Join the discussion',
      newTopic: 'New Topic',
      login: 'Login to participate',
      topicTitle: 'Title',
      topicContent: 'Content',
      category: 'Category',
      categories: {
        general: 'General',
        bjj: 'BJJ',
        music: 'Music',
        tech: 'Tech',
        business: 'Business',
      },
      submit: 'Post',
      cancel: 'Cancel',
      noTopics: 'No topics yet. Be the first to start a discussion!',
      comments: 'Comments',
      writeComment: 'Write a comment...',
      back: 'Back to topics',
      views: 'views',
      loginRequired: 'Please login to participate',
      loginToView: 'Login to view details',
      loginPromptTitle: 'Member Only Content',
      loginPromptDesc: 'Register or login to view topic details and participate in discussions.',
    },
    ja: {
      title: 'コミュニティ',
      subtitle: 'ディスカッションに参加しよう',
      newTopic: '新しいトピック',
      login: 'ログインして参加',
      topicTitle: 'タイトル',
      topicContent: '内容',
      category: 'カテゴリー',
      categories: {
        general: '一般',
        bjj: '柔術',
        music: '音楽',
        tech: 'テック',
        business: 'ビジネス',
      },
      submit: '投稿',
      cancel: 'キャンセル',
      noTopics: 'まだトピックがありません。最初のディスカッションを始めましょう！',
      comments: 'コメント',
      writeComment: 'コメントを書く...',
      back: 'トピック一覧に戻る',
      views: '閲覧',
      loginRequired: '参加するにはログインしてください',
      loginToView: 'ログインして詳細を見る',
      loginPromptTitle: '会員限定コンテンツ',
      loginPromptDesc: '会員登録またはログインすると、トピックの詳細を見たりディスカッションに参加できます。',
    },
  };

  const t = texts[language];

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setIsLoading(true);
    try {
      // Use security definer function to get topics with safe profile data
      const { data, error } = await supabase.rpc('get_forum_topics_safe');

      if (error) {
        console.error('Error fetching topics:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        const topicsFormatted = data.map((topic: {
          id: string;
          title: string;
          content: string;
          category: string;
          created_at: string;
          updated_at: string;
          view_count: number;
          is_pinned: boolean;
          author_public_id: string | null;
          author_display_name: string | null;
          author_avatar_url: string | null;
          comment_count: number;
        }) => ({
          id: topic.id,
          title: topic.title,
          content: topic.content,
          category: topic.category,
          created_at: topic.created_at,
          view_count: topic.view_count || 0,
          user_id: '', // Not exposed for security
          profiles: {
            public_id: topic.author_public_id,
            display_name: topic.author_display_name,
            avatar_url: topic.author_avatar_url,
          },
          comment_count: Number(topic.comment_count) || 0,
        }));
        setTopics(topicsFormatted as Topic[]);
      }
    } catch (err) {
      console.error('Error in fetchTopics:', err);
    }
    setIsLoading(false);
  };

  const fetchComments = async (topicId: string) => {
    // Use security definer function to get comments with safe profile data
    const { data, error } = await supabase.rpc('get_forum_comments_safe', {
      p_topic_id: topicId,
      p_blog_slug: null,
    });

    if (error) {
      console.error('Error fetching comments:', error);
      return;
    }

    if (data) {
      const commentsFormatted = data.map((comment: {
        id: string;
        content: string;
        created_at: string;
        updated_at: string;
        topic_id: string;
        blog_slug: string | null;
        parent_id: string | null;
        author_public_id: string | null;
        author_display_name: string | null;
        author_avatar_url: string | null;
      }) => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_id: '', // Not exposed for security
        profiles: {
          public_id: comment.author_public_id,
          display_name: comment.author_display_name,
          avatar_url: comment.author_avatar_url,
        },
      }));
      setComments(commentsFormatted as Comment[]);
    }
  };

  const handleSelectTopic = async (topic: Topic) => {
    // Require authentication to view details
    if (!isAuthenticated) {
      return; // The UI will show login prompt
    }
    
    setSelectedTopic(topic);
    fetchComments(topic.id);
    
    // Increment view count
    await supabase
      .from('forum_topics')
      .update({ view_count: topic.view_count + 1 })
      .eq('id', topic.id);
  };

  const handleCreateTopic = async () => {
    if (!user || !newTitle.trim() || !newContent.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase.from('forum_topics').insert({
      user_id: user.id,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
    });

    if (!error) {
      setNewTitle('');
      setNewContent('');
      setShowNewTopic(false);
      fetchTopics();
      toast({ title: language === 'ja' ? '投稿しました' : 'Posted successfully' });
    }
    setIsSubmitting(false);
  };

  const handleAddComment = async () => {
    if (!user || !selectedTopic || !newComment.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase.from('forum_comments').insert({
      user_id: user.id,
      topic_id: selectedTopic.id,
      content: newComment.trim(),
    });

    if (!error) {
      setNewComment('');
      fetchComments(selectedTopic.id);
    }
    setIsSubmitting(false);
  };

  const formatDate = (dateStr: string) => {
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: language === 'ja' ? ja : enUS,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-foreground mb-2">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </motion.div>

          {/* Actions */}
          <div className="flex gap-4 mb-8">
            {selectedTopic && (
              <Button variant="ghost" onClick={() => setSelectedTopic(null)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.back}
              </Button>
            )}
            {!selectedTopic && (
              isAuthenticated ? (
                <Button onClick={() => setShowNewTopic(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t.newTopic}
                </Button>
              ) : (
                <Button onClick={() => navigate('/auth')}>
                  {t.login}
                </Button>
              )
            )}
          </div>

          {/* New Topic Form */}
          {showNewTopic && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-card border border-border rounded-xl p-6 mb-8"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{t.newTopic}</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowNewTopic(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">{t.category}</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-border bg-muted/50 px-3 py-2"
                  >
                    {Object.entries(t.categories).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t.topicTitle}</label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="mt-1"
                    placeholder={language === 'ja' ? 'タイトルを入力...' : 'Enter title...'}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t.topicContent}</label>
                  <Textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="mt-1 min-h-[120px]"
                    placeholder={language === 'ja' ? '内容を入力...' : 'Enter content...'}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => setShowNewTopic(false)}>
                    {t.cancel}
                  </Button>
                  <Button onClick={handleCreateTopic} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t.submit}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Topic Detail View */}
          {selectedTopic ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {selectedTopic.profiles?.display_name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(selectedTopic.created_at)}</p>
                  </div>
                  <span className="ml-auto px-3 py-1 text-xs bg-primary/10 text-primary rounded-full">
                    {t.categories[selectedTopic.category as keyof typeof t.categories] || selectedTopic.category}
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-4">{selectedTopic.title}</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{selectedTopic.content}</p>
              </div>

              {/* Comments */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t.comments} ({comments.length})</h3>
                
                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-sm">
                        {comment.profiles?.display_name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-10">{comment.content}</p>
                  </motion.div>
                ))}

                {/* Add Comment */}
                {isAuthenticated ? (
                  <div className="flex gap-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={t.writeComment}
                      className="flex-1 min-h-[60px]"
                    />
                    <Button 
                      onClick={handleAddComment} 
                      disabled={isSubmitting || !newComment.trim()}
                      size="icon"
                      className="self-end"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => navigate('/auth')} className="w-full">
                    {t.loginRequired}
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            /* Topics List */
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : topics.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {t.noTopics}
                </div>
              ) : (
                topics.map((topic, index) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectTopic(topic)}
                    className={`bg-card border border-border rounded-xl p-5 transition-all group ${
                      isAuthenticated 
                        ? 'cursor-pointer hover:border-primary/50' 
                        : 'cursor-default'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-muted-foreground">
                            {topic.profiles?.display_name || 'Anonymous'}
                          </span>
                          <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                            {t.categories[topic.category as keyof typeof t.categories] || topic.category}
                          </span>
                        </div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                          {topic.title}
                        </h3>
                        {/* Show preview only for authenticated users */}
                        {isAuthenticated ? (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {topic.content}
                          </p>
                        ) : (
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Lock className="w-4 h-4" />
                            <span>{t.loginToView}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(topic.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {topic.comment_count}
                          </span>
                          <span>{topic.view_count} {t.views}</span>
                        </div>
                      </div>
                      
                      {/* Login prompt for non-authenticated users */}
                      {!isAuthenticated && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/auth');
                          }}
                        >
                          {language === 'ja' ? 'ログイン' : 'Login'}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              
              {/* Login Banner for non-authenticated users */}
              {!isAuthenticated && topics.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6 text-center"
                >
                  <Lock className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">{t.loginPromptTitle}</h3>
                  <p className="text-muted-foreground mb-4">{t.loginPromptDesc}</p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => navigate('/auth')}>
                      {language === 'ja' ? '無料で会員登録' : 'Sign Up Free'}
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/auth')}>
                      {language === 'ja' ? 'ログイン' : 'Login'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Community;
