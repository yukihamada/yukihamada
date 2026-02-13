import { QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Prefetch a single blog post by slug into React Query cache
export const prefetchBlogPost = (queryClient: QueryClient, slug: string) => {
  queryClient.prefetchQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Prefetch multiple blog posts
export const prefetchBlogPosts = (queryClient: QueryClient, slugs: string[]) => {
  slugs.forEach(slug => prefetchBlogPost(queryClient, slug));
};
