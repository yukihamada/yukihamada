import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  category?: string;
}

const SEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  author = 'Yuki Hamada',
  category,
}: SEOProps) => {
  const { language } = useLanguage();
  
  const baseUrl = 'https://yukihamada.jp';
  const defaultTitle = language === 'ja' 
    ? 'Yuki Hamada - イノベーター・起業家・コミュニティビルダー' 
    : 'Yuki Hamada - Innovator, Entrepreneur & Community Builder';
  const defaultDescription = language === 'ja'
    ? '濱田優貴 - テクノロジーとコミュニティで世界をつなぐイノベーター。起業家として複数の事業を立ち上げ、柔術やAIなど多様な分野で活動中。'
    : 'Yuki Hamada - An innovator connecting the world through technology and community. Entrepreneur with multiple ventures, active in BJJ, AI, and more.';
  const defaultImage = `${baseUrl}/images/default-ogp.jpg`;
  
  const seoTitle = title ? `${title} | Yuki Hamada` : defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoImage = image 
    ? (image.startsWith('http') ? image : `${baseUrl}${image}`)
    : defaultImage;
  const seoUrl = url || baseUrl;
  const locale = language === 'ja' ? 'ja_JP' : 'en_US';

  const jsonLd = type === 'article' ? {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: seoDescription,
    image: seoImage,
    url: seoUrl,
    datePublished: publishedTime,
    dateModified: publishedTime,
    author: {
      '@type': 'Person',
      name: author,
      url: baseUrl,
      sameAs: [
        'https://twitter.com/yukihamada',
        'https://github.com/yukihamada'
      ]
    },
    publisher: {
      '@type': 'Person',
      name: 'Yuki Hamada',
      url: baseUrl
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': seoUrl
    },
    articleSection: category,
    inLanguage: language
  } : {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Yuki Hamada',
    url: baseUrl,
    description: seoDescription,
    author: {
      '@type': 'Person',
      name: 'Yuki Hamada',
      sameAs: [
        'https://twitter.com/yukihamada',
        'https://github.com/yukihamada'
      ]
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="author" content={author} />
      {category && <meta name="keywords" content={`${category}, Yuki Hamada, 濱田優貴`} />}
      <link rel="canonical" href={seoUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || defaultTitle} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:type" content={type === 'article' ? 'article' : 'website'} />
      <meta property="og:site_name" content="Yuki Hamada" />
      <meta property="og:locale" content={locale} />

      {/* Article specific OGP */}
      {type === 'article' && publishedTime && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          <meta property="article:author" content={author} />
          {category && <meta property="article:section" content={category} />}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@yukihamada" />
      <meta name="twitter:creator" content="@yukihamada" />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      <meta name="twitter:image:alt" content={title || defaultTitle} />

      {/* JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};

export default SEO;
