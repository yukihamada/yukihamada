import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface ShareCountsProps {
  postSlug: string;
}

interface ShareCountData {
  hatena: number;
}

const ShareCounts = ({ postSlug }: ShareCountsProps) => {
  const { language } = useLanguage();
  const [counts, setCounts] = useState<ShareCountData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // First try to get from cache
        const { data: cached } = await supabase
          .from('blog_share_counts')
          .select('hatena_count')
          .eq('post_slug', postSlug)
          .single();

        if (cached) {
          setCounts({ hatena: cached.hatena_count });
          setIsLoading(false);
          
          // Check if we need to refresh (older than 1 hour)
          // We'll do this in the background
        }

        // Fetch fresh counts from edge function
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-share-counts`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ slug: postSlug }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCounts({ hatena: data.hatena || 0 });
        }
      } catch (error) {
        console.error('Error fetching share counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, [postSlug]);

  if (isLoading || !counts) {
    return null;
  }

  const totalShares = counts.hatena;

  if (totalShares === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <svg 
        className="w-4 h-4" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
      <span>
        {totalShares.toLocaleString()} {language === 'ja' ? 'シェア' : 'shares'}
      </span>
      {counts.hatena > 0 && (
        <a
          href={`https://b.hatena.ne.jp/entry/s/yukihamada.jp/blog/${postSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00A4DE]/10 text-[#00A4DE] hover:bg-[#00A4DE]/20 transition-colors text-xs"
        >
          <svg className="w-3 h-3" viewBox="0 0 32 32" fill="currentColor">
            <path d="M4.615 7.385V24.615C4.615 26.52 6.095 28 8 28H24C25.905 28 27.385 26.52 27.385 24.615V7.385C27.385 5.48 25.905 4 24 4H8C6.095 4 4.615 5.48 4.615 7.385ZM20.923 22.154H18.462V12.923H20.923V22.154ZM19.692 11.692C18.873 11.692 18.154 10.974 18.154 10.154C18.154 9.333 18.873 8.615 19.692 8.615C20.513 8.615 21.231 9.333 21.231 10.154C21.231 10.974 20.513 11.692 19.692 11.692ZM14.769 22.154H12.308V15.692H10.769V13.538H14.769V22.154Z" />
          </svg>
          {counts.hatena}
        </a>
      )}
    </div>
  );
};

export default ShareCounts;