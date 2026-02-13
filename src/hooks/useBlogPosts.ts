import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlogPostContent {
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
}

export interface BlogPost {
  slug: string;
  featured: boolean;
  image?: string;
  ja: BlogPostContent;
  en: BlogPostContent;
}

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
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// Extended BlogPost with published_at for internal use
interface BlogPostWithPublishedAt extends BlogPost {
  publishedAt?: Date;
}

// Convert DB format to app format
const convertDBToAppFormat = (dbPost: BlogPostDB): BlogPostWithPublishedAt => ({
  slug: dbPost.slug,
  featured: dbPost.featured,
  image: dbPost.image || undefined,
  publishedAt: dbPost.published_at ? new Date(dbPost.published_at) : undefined,
  ja: {
    title: dbPost.title_ja,
    excerpt: dbPost.excerpt_ja,
    content: dbPost.content_ja,
    date: dbPost.date_ja,
    category: dbPost.category_ja,
  },
  en: {
    title: dbPost.title_en,
    excerpt: dbPost.excerpt_en,
    content: dbPost.content_en,
    date: dbPost.date_en,
    category: dbPost.category_en,
  },
});

// Parse date string to comparable format (handles both Japanese and English dates)
const parseDateString = (dateStr: string): Date => {
  // Japanese format: "2025年12月21日"
  const jaMatch = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (jaMatch) {
    return new Date(parseInt(jaMatch[1]), parseInt(jaMatch[2]) - 1, parseInt(jaMatch[3]));
  }
  // English format: "December 21, 2025"
  return new Date(dateStr);
};

// Filter out future-dated posts based on published_at or date string
const filterFuturePosts = (posts: BlogPostWithPublishedAt[]): BlogPost[] => {
  const now = new Date();
  return posts.filter(post => {
    // Use published_at if available, otherwise fall back to date string
    const postDate = post.publishedAt || parseDateString(post.ja.date);
    return postDate <= now;
  });
};

// Sort posts by date (newest first)
const sortPostsByDate = (posts: BlogPostWithPublishedAt[]): BlogPost[] => {
  return [...posts].sort((a, b) => {
    const dateA = a.publishedAt || parseDateString(a.ja.date);
    const dateB = b.publishedAt || parseDateString(b.ja.date);
    return dateB.getTime() - dateA.getTime();
  });
};

// Filter and sort posts for public view
const processPublicPosts = (posts: BlogPostWithPublishedAt[]): BlogPost[] => {
  return sortPostsByDate(filterFuturePosts(posts));
};

// Sort only (for admin view - includes future posts)
const processAllPosts = (posts: BlogPostWithPublishedAt[]): BlogPost[] => {
  return sortPostsByDate(posts);
};

// Check if user is admin
const checkIsAdmin = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
  return data === true;
};

export const useBlogPosts = (includeScheduled = false) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Check admin status if includeScheduled is requested
        let adminStatus = false;
        if (includeScheduled) {
          adminStatus = await checkIsAdmin();
          setIsAdmin(adminStatus);
        }

        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false, nullsFirst: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const convertedPosts = data.map(convertDBToAppFormat);
          // If admin and includeScheduled, show all posts; otherwise filter future posts
          if (includeScheduled && adminStatus) {
            setPosts(processAllPosts(convertedPosts));
          } else {
            setPosts(processPublicPosts(convertedPosts));
          }
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError(err as Error);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [includeScheduled]);

  return { posts, isLoading, error, isAdmin };
};

export const useBlogPost = (slug: string | undefined, allowScheduled = false) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      setLoadingProgress(100);
      return;
    }

    // Reset progress on slug change
    setLoadingProgress(0);

    const fetchPost = async () => {
      try {
        // Stage 1: Starting fetch (0-20%)
        setLoadingProgress(10);
        
        // Check admin status if allowScheduled
        let isAdmin = false;
        if (allowScheduled) {
          isAdmin = await checkIsAdmin();
        }
        setLoadingProgress(30);

        // Stage 2: Check React Query cache first, then fetch from database (30-70%)
        const cachedData = queryClient.getQueryData(['blog-post', slug]);
        let data: any = cachedData || null;
        let error: any = null;
        
        if (!cachedData) {
          const result = await supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();
          data = result.data;
          error = result.error;
        }

        setLoadingProgress(70);

        if (error) throw error;

        // Stage 3: Processing data (70-90%)
        if (data) {
          const convertedPost = convertDBToAppFormat(data);
          // If this is a draft (or any non-published status), allow viewing via direct URL
          // regardless of scheduled/future dates. This enables shareable preview links.
          const isDraftPreview = (data as BlogPostDB).status !== 'published';

          if (isDraftPreview) {
            setIsScheduled(false);
            setLoadingProgress(85);
            setPost(convertedPost);
            setLoadingProgress(100);
            return;
          }

          const now = new Date();
          const postDate = convertedPost.publishedAt || parseDateString(data.date_ja);
          const isFuturePost = postDate > now;
          
          setIsScheduled(isFuturePost);
          setLoadingProgress(85);
          
          // Show post if it's not future, or if user is admin
          if (!isFuturePost || isAdmin) {
            setPost(convertedPost);
          } else {
            setPost(null);
          }
        } else {
          setPost(null);
        }
        
        setLoadingProgress(100);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError(err as Error);
        setPost(null);
        setLoadingProgress(100);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug, allowScheduled]);

  return { post, isLoading, error, isScheduled, loadingProgress };
};

// Helper function to get blog post by slug (for SSE/MCP)
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) return null;
  return convertDBToAppFormat(data);
};

// Helper function to get localized blog post content
export const getLocalizedBlogPost = (post: BlogPost, language: 'en' | 'ja') => {
  const content = post[language];
  return {
    slug: post.slug,
    featured: post.featured,
    image: post.image,
    ...content,
  };
};
