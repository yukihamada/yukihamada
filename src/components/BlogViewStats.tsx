import { useState, useEffect, useRef } from 'react';
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
  const [liveViewers, setLiveViewers] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const texts = {
    en: { views: 'views', viewing: 'viewing now' },
    ja: { views: '回閲覧', viewing: '人が閲覧中' }
  };

  const t = texts[language];

  useEffect(() => {
    const visitorId = getVisitorId();
    let isMounted = true;
    
    const init = async () => {
      // Record view and fetch count in parallel
      const [, viewResult] = await Promise.all([
        supabase.from('blog_views').insert({ post_slug: postSlug, visitor_id: visitorId }),
        supabase.rpc('get_blog_view_count', { p_post_slug: postSlug })
      ]);
      
      if (isMounted && !viewResult.error && viewResult.data !== null) {
        setTotalViews(viewResult.data);
      }
      if (isMounted) setIsLoading(false);
    };

    init();

    // Set up presence channel with debounce
    const channelName = `blog-presence-${postSlug}`;
    const channel = supabase.channel(channelName, {
      config: { presence: { key: visitorId } },
    });
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        if (!isMounted) return;
        const state = channel.presenceState();
        setLiveViewers(Math.max(1, Object.keys(state).length));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user: visitorId, online_at: new Date().toISOString() });
        }
      });

    return () => {
      isMounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [postSlug]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 text-muted-foreground text-sm">
        <div className="h-4 w-20 bg-foreground/10 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Eye className="h-4 w-4" />
        <span>{totalViews.toLocaleString()} {t.views}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="relative">
          <Users className="h-4 w-4 text-green-500" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
        <span className="text-green-500 font-medium">
          {liveViewers} {t.viewing}
        </span>
      </div>
    </div>
  );
};

export default BlogViewStats;
