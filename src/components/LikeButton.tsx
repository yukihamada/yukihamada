import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { language } = useLanguage();
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const texts = {
    en: {
      like: 'Like',
      liked: 'Liked',
      alreadyLiked: 'Already liked',
      error: 'An error occurred',
      success: 'Liked!'
    },
    ja: {
      like: 'いいね',
      liked: 'いいね済み',
      alreadyLiked: '既にいいねしています',
      error: 'エラーが発生しました',
      success: 'いいねしました！'
    }
  };

  const t = texts[language];

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
    setIsAnimating(true);

    const { error } = await supabase
      .from('blog_likes')
      .insert({ post_slug: postSlug, visitor_id: visitorId });

    if (error) {
      if (error.code === '23505') {
        toast.info(t.alreadyLiked);
        setHasLiked(true);
      } else {
        console.error('Error adding like:', error);
        toast.error(t.error);
      }
    } else {
      setLikeCount(prev => prev + 1);
      setHasLiked(true);
      toast.success(t.success);
    }

    setIsLoading(false);
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleLike}
      disabled={hasLiked || isLoading}
      className={`
        group relative flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 overflow-hidden
        ${hasLiked 
          ? 'bg-primary/20 border-primary text-primary cursor-default' 
          : 'hover:bg-primary/10 hover:border-primary hover:text-primary'
        }
      `}
    >
      {/* Background burst effect */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            className="absolute inset-0 bg-primary/20"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Heart icon with bounce animation */}
      <motion.div
        animate={isAnimating ? {
          scale: [1, 1.5, 0.8, 1.2, 1],
          rotate: [0, -10, 10, -5, 0],
        } : hasLiked ? { scale: 1 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Heart 
          className={`h-5 w-5 transition-all duration-300 ${
            hasLiked 
              ? 'fill-primary text-primary' 
              : 'group-hover:scale-110'
          }`} 
        />
      </motion.div>

      {/* Floating hearts effect */}
      <AnimatePresence>
        {isAnimating && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute pointer-events-none"
                initial={{ 
                  opacity: 1, 
                  scale: 0.5,
                  x: 0,
                  y: 0
                }}
                animate={{ 
                  opacity: 0, 
                  scale: 1,
                  x: (Math.random() - 0.5) * 80,
                  y: -40 - Math.random() * 40
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 0.6 + Math.random() * 0.2,
                  ease: "easeOut",
                  delay: i * 0.05
                }}
              >
                <Heart className="h-3 w-3 fill-primary text-primary" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      <motion.span 
        className="font-medium relative z-10"
        animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {hasLiked ? t.liked : t.like}
      </motion.span>

      <motion.span 
        className={`
          px-2 py-0.5 rounded-full text-sm font-bold relative z-10
          ${hasLiked ? 'bg-primary/30' : 'bg-foreground/10'}
        `}
        animate={isAnimating ? { 
          scale: [1, 1.3, 1],
        } : {}}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {likeCount}
      </motion.span>
    </Button>
  );
};

export default LikeButton;
