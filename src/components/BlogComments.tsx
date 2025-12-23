import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, Send, Loader2, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';

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

interface BlogCommentsProps {
  blogSlug: string;
}

export const BlogComments = ({ blogSlug }: BlogCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const texts = {
    en: {
      comments: 'Comments',
      writeComment: 'Share your thoughts...',
      login: 'Login to comment',
      noComments: 'No comments yet. Be the first to share your thoughts!',
    },
    ja: {
      comments: 'コメント',
      writeComment: 'コメントを書く...',
      login: 'コメントするにはログイン',
      noComments: 'まだコメントがありません。最初のコメントを書いてみましょう！',
    },
  };

  const t = texts[language];

  useEffect(() => {
    fetchComments();
  }, [blogSlug]);

  const fetchComments = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('forum_comments')
      .select('*')
      .eq('blog_slug', blogSlug)
      .order('created_at', { ascending: true });

    if (data) {
      const commentsWithProfiles = await Promise.all(
        data.map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('public_id, display_name, avatar_url')
            .eq('user_id', comment.user_id)
            .maybeSingle();
          return { ...comment, profiles: profile };
        })
      );
      setComments(commentsWithProfiles as Comment[]);
    }
    setIsLoading(false);
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase.from('forum_comments').insert({
      user_id: user.id,
      blog_slug: blogSlug,
      content: newComment.trim(),
    });

    if (!error) {
      setNewComment('');
      fetchComments();
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
    <div className="mt-12 pt-8 border-t border-border">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        {t.comments} ({comments.length})
      </h3>

      {/* Add Comment */}
      {isAuthenticated ? (
        <div className="flex gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t.writeComment}
              className="flex-1 min-h-[60px] resize-none"
            />
            <Button
              onClick={handleAddComment}
              disabled={isSubmitting || !newComment.trim()}
              size="icon"
              className="self-end"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => navigate('/auth')}
          className="w-full mb-8"
        >
          {t.login}
        </Button>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{t.noComments}</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">
                    {comment.profiles?.display_name || 'Anonymous'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
