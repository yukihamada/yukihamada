/**
 * Cloudflare Pages Middleware for Dynamic OGP
 * 
 * SNSクローラーからのリクエストに対してOGPメタタグを直接生成
 * 通常のユーザーはそのまま通過
 */

// クローラーのUser-Agentパターン
const crawlerPatterns = [
  'Twitterbot',
  'facebookexternalhit',
  'LinkedInBot',
  'Slackbot',
  'TelegramBot',
  'WhatsApp',
  'Discordbot',
  'PinterestBot',
  'Applebot',
  'Google-InspectionTool',
  'Googlebot',
  'bingbot',
  'Baiduspider',
  'DuckDuckBot',
  'Embedly',
  'Quora Link Preview',
  'Showyoubot',
  'outbrain',
  'vkShare',
  'W3C_Validator',
  'redditbot',
  'Mediapartners-Google',
];

function isCrawler(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return crawlerPatterns.some(pattern => ua.includes(pattern.toLowerCase()));
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface BlogPost {
  slug: string;
  title_ja: string;
  title_en: string;
  excerpt_ja: string;
  excerpt_en: string;
  image: string | null;
  category_ja: string;
  category_en: string;
  date_ja: string;
  date_en: string;
}

async function fetchBlogPost(slug: string, supabaseUrl: string, supabaseAnonKey: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&select=slug,title_ja,title_en,excerpt_ja,excerpt_en,image,category_ja,category_en,date_ja,date_en&limit=1`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      }
    );
    
    if (!response.ok) {
      console.error('Failed to fetch blog post:', response.status);
      return null;
    }
    
    const data = await response.json();
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

function generateOGPHtml(
  title: string,
  description: string,
  image: string,
  url: string,
  type: 'website' | 'article' = 'website',
  publishedTime?: string,
  section?: string,
  lang: string = 'ja'
): string {
  const locale = lang === 'en' ? 'en_US' : 'ja_JP';
  
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  
  <!-- Basic SEO -->
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="author" content="Yuki Hamada">
  
  <!-- Open Graph Protocol -->
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${escapeHtml(url)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Yuki Hamada">
  <meta property="og:locale" content="${locale}">
  ${publishedTime ? `<meta property="article:published_time" content="${escapeHtml(publishedTime)}">` : ''}
  ${section ? `<meta property="article:section" content="${escapeHtml(section)}">` : ''}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@yukihamada">
  <meta name="twitter:creator" content="@yukihamada">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  
  <!-- Redirect for browsers (3 second delay for crawlers to parse OGP) -->
  <meta http-equiv="refresh" content="3;url=${escapeHtml(url)}">
  <link rel="canonical" href="${escapeHtml(url)}">
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <p>Redirecting to <a href="${escapeHtml(url)}">${escapeHtml(url)}</a>...</p>
</body>
</html>`;
}

export const onRequest: PagesFunction = async (context) => {
  const { request, next } = context;
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  const pathname = url.pathname;

  // クローラーでない場合は通常のリクエストを続行
  if (!isCrawler(userAgent)) {
    return next();
  }

  console.log(`[OGP Middleware] Crawler detected: ${userAgent.substring(0, 50)}, path: ${pathname}`);

  const baseUrl = 'https://yukihamada.jp';
  const supabaseUrl = 'https://itryqwkqnexuawvpoetz.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0cnlxd2txbmV4dWF3dnBvZXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTMyNTYsImV4cCI6MjA4MTY2OTI1Nn0.qrPduVUHBWup00n3UaATLQPtF8fASgqLxaSD9TdGurs';

  // ブログ記事のスラッグを抽出
  const blogMatch = pathname.match(/^\/blog\/([^/]+)$/);
  
  if (blogMatch) {
    const slug = blogMatch[1];
    console.log(`[OGP Middleware] Blog post slug: ${slug}`);
    
    // ブログ記事を取得
    const post = await fetchBlogPost(slug, supabaseUrl, supabaseAnonKey);
    
    // 記事が見つからなくてもデフォルトOGPを返す
    const defaultImage = `${baseUrl}/images/default-ogp.jpg`;
    
    if (post) {
      // 画像URLを構築（nullや空文字の場合もデフォルトにフォールバック）
      let imageUrl = defaultImage;
      if (post.image && post.image.trim() !== '') {
        imageUrl = post.image.startsWith('http') ? post.image : `${baseUrl}${post.image}`;
      }
      
      const html = generateOGPHtml(
        `${post.title_ja} | Yuki Hamada`,
        post.excerpt_ja || 'Yuki Hamadaのブログ記事',
        imageUrl,
        `${baseUrl}/blog/${slug}`,
        'article',
        post.date_ja || '',
        post.category_ja || '',
        'ja'
      );
      
      console.log(`[OGP Middleware] Serving OGP for: ${post.title_ja}, image: ${imageUrl}`);
      
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  }
  
  // ブログ一覧ページ
  if (pathname === '/blog' || pathname === '/blog/') {
    const html = generateOGPHtml(
      'ブログ | Yuki Hamada',
      '柔術、AI、テクノロジー、ライフスタイルについての記事を発信しています。',
      `${baseUrl}/images/default-ogp.jpg`,
      `${baseUrl}/blog`,
      'website'
    );
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
  
  // トップページ
  if (pathname === '/' || pathname === '') {
    const html = generateOGPHtml(
      'Yuki Hamada - イノベーター・起業家・コミュニティビルダー',
      '濱田優貴 - イネブラ創業者、エンジェル投資家。世界中のクリエイターを支援し、新しい価値を生み出すコミュニティを構築。',
      `${baseUrl}/images/default-ogp.jpg`,
      baseUrl,
      'website'
    );
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // その他のページは通常のリクエストを続行
  return next();
};
