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

export const useBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>(staticBlogPosts);
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
          setPosts(convertedPosts);
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError(err as Error);
        // Fallback to static posts on error
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
