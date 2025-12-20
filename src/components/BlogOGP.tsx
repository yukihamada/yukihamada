import { useEffect } from 'react';
import { BlogPost } from '@/data/blogPosts';

interface BlogOGPProps {
  post: BlogPost;
}

const BlogOGP = ({ post }: BlogOGPProps) => {
  useEffect(() => {
    const baseUrl = 'https://yukihamada.jp';
    const postUrl = `${baseUrl}/blog/${post.slug}`;
    const imageUrl = post.image ? `${baseUrl}${post.image}` : `${baseUrl}/images/default-ogp.jpg`;

    // Update title
    document.title = `${post.title} | Yuki Hamada`;

    // Update or create meta tags
    const updateMeta = (property: string, content: string, isName = false) => {
      const attr = isName ? 'name' : 'property';
      let meta = document.querySelector(`meta[${attr}="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // OGP tags
    updateMeta('og:title', post.title);
    updateMeta('og:description', post.excerpt);
    updateMeta('og:image', imageUrl);
    updateMeta('og:url', postUrl);
    updateMeta('og:type', 'article');

    // Twitter Card tags
    updateMeta('twitter:title', post.title);
    updateMeta('twitter:description', post.excerpt);
    updateMeta('twitter:image', imageUrl);
    updateMeta('twitter:card', 'summary_large_image', true);

    // Description
    updateMeta('description', post.excerpt, true);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', postUrl);

    // Cleanup
    return () => {
      document.title = 'Yuki Hamada - イノベーター・起業家・コミュニティビルダー';
    };
  }, [post]);

  return null;
};

export default BlogOGP;
