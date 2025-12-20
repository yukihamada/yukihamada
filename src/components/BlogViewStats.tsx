import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface BlogViewStatsProps {
  postSlug: string;
}

// Get or create visitor ID
const getVisitorId = (): string => {
  const stored = localStorage.getItem('visitor_id');
  if (stored) return stored;
  
  const newId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('visitor_id', newId);
  return newId;
};

const BlogViewStats = ({ postSlug }: BlogViewStatsProps) => {
  const { language } = useLanguage();
  const [totalViews, setTotalViews] = useState(0);
  const [liveViewers, setLiveViewers] = useState(1); // Start with 1 (current user)
  const [isLoading, setIsLoading] = useState(true);

  const texts = {
    en: {
      views: 'views',
      viewing: 'viewing now'
    },
    ja: {
      views: '回閲覧',
      viewing: '人が閲覧中'
    }
  };

  const t = texts[language];

  useEffect(() => {
    const visitorId = getVisitorId();
    
    // Record the view
    const recordView = async () => {
      await supabase
        .from('blog_views')
        .insert({ post_slug: postSlug, visitor_id: visitorId });
    };

    // Get total view count
    const fetchTotalViews = async () => {
      const { count } = await supabase
        .from('blog_views')
        .select('*', { count: 'exact', head: true })
        .eq('post_slug', postSlug);
      
      setTotalViews(count || 0);
      setIsLoading(false);
    };

    recordView();
    fetchTotalViews();

    // Set up presence channel for real-time viewers
    const channelName = `blog-presence-${postSlug}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: visitorId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const viewerCount = Object.keys(state).length;
        setLiveViewers(Math.max(1, viewerCount));
      })
      .on('presence', { event: 'join' }, () => {
        const state = channel.presenceState();
        setLiveViewers(Math.max(1, Object.keys(state).length));
      })
      .on('presence', { event: 'leave' }, () => {
        const state = channel.presenceState();
        setLiveViewers(Math.max(1, Object.keys(state).length));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user: visitorId,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postSlug]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 text-muted-foreground text-sm">
        <div className="h-4 w-20 bg-foreground/10 rounded animate-pulse" />
        <div className="h-4 w-24 bg-foreground/10 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      {/* Total views */}
      <motion.div 
        className="flex items-center gap-1.5 text-muted-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Eye className="h-4 w-4" />
        <span>{totalViews.toLocaleString()} {t.views}</span>
      </motion.div>

      {/* Live viewers */}
      <motion.div 
        className="flex items-center gap-1.5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="relative">
          <Users className="h-4 w-4 text-green-500" />
          {/* Pulsing dot */}
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={liveViewers}
            className="text-green-500 font-medium"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {liveViewers} {t.viewing}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BlogViewStats;
