import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LikeButtonProps {
  postSlug: string;
}

// Generate a simple visitor ID based on browser fingerprint
const getVisitorId = (): string => {
  const stored = localStorage.getItem('visitor_id');
  if (stored) return stored;
  
  const newId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('visitor_id', newId);
  return newId;
};

const LikeButton = ({ postSlug }: LikeButtonProps) => {
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLikes = async () => {
      const visitorId = getVisitorId();
      
      // Get total like count
      const { count, error: countError } = await supabase
        .from('blog_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_slug', postSlug);

      if (!countError) {
        setLikeCount(count || 0);
      }

      // Check if current visitor has liked
      const { data: existingLike } = await supabase
        .from('blog_likes')
        .select('id')
        .eq('post_slug', postSlug)
        .eq('visitor_id', visitorId)
        .maybeSingle();

      setHasLiked(!!existingLike);
      setIsLoading(false);
    };

    fetchLikes();
  }, [postSlug]);

  const handleLike = async () => {
    if (hasLiked || isLoading) return;

    const visitorId = getVisitorId();
    setIsLoading(true);

    const { error } = await supabase
      .from('blog_likes')
      .insert({ post_slug: postSlug, visitor_id: visitorId });

    if (error) {
      if (error.code === '23505') {
        // Duplicate key - already liked
        toast.info('既にいいねしています');
        setHasLiked(true);
      } else {
        console.error('Error adding like:', error);
        toast.error('エラーが発生しました');
      }
    } else {
      setLikeCount(prev => prev + 1);
      setHasLiked(true);
      toast.success('いいねしました！');
    }

    setIsLoading(false);
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleLike}
      disabled={hasLiked || isLoading}
      className={`
        group flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300
        ${hasLiked 
          ? 'bg-primary/20 border-primary text-primary cursor-default' 
          : 'hover:bg-primary/10 hover:border-primary hover:text-primary'
        }
      `}
    >
      <Heart 
        className={`h-5 w-5 transition-all duration-300 ${
          hasLiked 
            ? 'fill-primary text-primary scale-110' 
            : 'group-hover:scale-110'
        }`} 
      />
      <span className="font-medium">
        {hasLiked ? 'いいね済み' : 'いいね'}
      </span>
      <span className={`
        px-2 py-0.5 rounded-full text-sm font-bold
        ${hasLiked ? 'bg-primary/30' : 'bg-foreground/10'}
      `}>
        {likeCount}
      </span>
    </Button>
  );
};

export default LikeButton;
