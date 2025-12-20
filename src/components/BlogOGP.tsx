import { useEffect } from 'react';
import { BlogPost } from '@/data/blogPosts';
import { useLanguage } from '@/contexts/LanguageContext';

interface BlogOGPProps {
  post: BlogPost;
}

const BlogOGP = ({ post }: BlogOGPProps) => {
  const { language } = useLanguage();
  const content = post[language];

  useEffect(() => {
    const baseUrl = 'https://yukihamada.jp';
    const postUrl = `${baseUrl}/blog/${post.slug}`;
    const imageUrl = post.image 
      ? (post.image.startsWith('http') ? post.image : `${baseUrl}${post.image}`)
      : `${baseUrl}/images/default-ogp.jpg`;

    // Update title with format: Post Title | Yuki Hamada
    document.title = `${content.title} | Yuki Hamada`;

    // Helper function to update or create meta tags
    const updateMeta = (property: string, contentValue: string, isName = false) => {
      const attr = isName ? 'name' : 'property';
      let meta = document.querySelector(`meta[${attr}="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', contentValue);
    };

    // Basic SEO meta tags
    updateMeta('description', content.excerpt, true);
    updateMeta('author', 'Yuki Hamada', true);
    updateMeta('keywords', `${content.category}, Yuki Hamada, 濱田優貴, ブログ, ${content.title.split(/[：:]/)[0]}`, true);

    // Open Graph Protocol tags
    updateMeta('og:title', content.title);
    updateMeta('og:description', content.excerpt);
    updateMeta('og:image', imageUrl);
    updateMeta('og:image:width', '1200');
    updateMeta('og:image:height', '630');
    updateMeta('og:image:alt', content.title);
    updateMeta('og:url', postUrl);
    updateMeta('og:type', 'article');
    updateMeta('og:site_name', 'Yuki Hamada');
    updateMeta('og:locale', language === 'ja' ? 'ja_JP' : 'en_US');

    // Article specific OGP tags
    updateMeta('article:published_time', content.date);
    updateMeta('article:author', 'Yuki Hamada');
    updateMeta('article:section', content.category);

    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image', true);
    updateMeta('twitter:site', '@yukihamada', true);
    updateMeta('twitter:creator', '@yukihamada', true);
    updateMeta('twitter:title', content.title, true);
    updateMeta('twitter:description', content.excerpt, true);
    updateMeta('twitter:image', imageUrl, true);
    updateMeta('twitter:image:alt', content.title, true);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', postUrl);

    // JSON-LD structured data for SEO
    const existingJsonLd = document.querySelector('script[type="application/ld+json"]');
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    const jsonLd = document.createElement('script');
    jsonLd.type = 'application/ld+json';
    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': content.title,
      'description': content.excerpt,
      'image': imageUrl,
      'url': postUrl,
      'datePublished': content.date,
      'dateModified': content.date,
      'author': {
        '@type': 'Person',
        'name': 'Yuki Hamada',
        'url': baseUrl,
        'sameAs': [
          'https://twitter.com/yukihamada',
          'https://github.com/yukihamada'
        ]
      },
      'publisher': {
        '@type': 'Person',
        'name': 'Yuki Hamada',
        'url': baseUrl
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': postUrl
      },
      'articleSection': content.category,
      'inLanguage': language
    });
    document.head.appendChild(jsonLd);

    // Cleanup function
    return () => {
      document.title = 'Yuki Hamada - イノベーター・起業家・コミュニティビルダー';
      const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
      if (jsonLdScript) {
        jsonLdScript.remove();
      }
    };
  }, [post, content, language]);

  return null;
};

export default BlogOGP;
