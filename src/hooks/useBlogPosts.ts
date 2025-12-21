import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { blogPosts as staticBlogPosts, BlogPost } from '@/data/blogPosts';

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
  created_at: string;
  updated_at: string;
}

// Convert DB format to app format
const convertDBToAppFormat = (dbPost: BlogPostDB): BlogPost => ({
  slug: dbPost.slug,
  featured: dbPost.featured,
  image: dbPost.image || undefined,
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

// Filter out future-dated posts
const filterFuturePosts = (posts: BlogPost[]): BlogPost[] => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Compare dates only, not time
  return posts.filter(post => {
    const postDate = parseDateString(post.ja.date);
    return postDate <= now;
  });
};

// Sort posts by date (newest first)
const sortPostsByDate = (posts: BlogPost[]): BlogPost[] => {
  return [...posts].sort((a, b) => {
    const dateA = parseDateString(a.ja.date);
    const dateB = parseDateString(b.ja.date);
    return dateB.getTime() - dateA.getTime();
  });
};

// Filter and sort posts
const processPublicPosts = (posts: BlogPost[]): BlogPost[] => {
  return sortPostsByDate(filterFuturePosts(posts));
};

export const useBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>(processPublicPosts(staticBlogPosts));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const convertedPosts = data.map(convertDBToAppFormat);
          setPosts(processPublicPosts(convertedPosts));
        } else {
          // Use processed static posts as fallback
          setPosts(processPublicPosts(staticBlogPosts));
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError(err as Error);
        // Fallback to processed static posts on error
        setPosts(processPublicPosts(staticBlogPosts));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return { posts, isLoading, error };
};

export const useBlogPost = (slug: string | undefined) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setPost(convertDBToAppFormat(data));
        } else {
          // Fallback to static posts
          const staticPost = staticBlogPosts.find(p => p.slug === slug);
          setPost(staticPost || null);
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError(err as Error);
        // Fallback to static posts
        const staticPost = staticBlogPosts.find(p => p.slug === slug);
        setPost(staticPost || null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  return { post, isLoading, error };
};
