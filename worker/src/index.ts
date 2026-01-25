/**
 * Cloudflare Worker for Dynamic OGP
 *
 * クローラー（Twitter, Facebook等）からのリクエストには動的にOGPタグを生成
 * 通常のユーザーにはLovableのオリジンにプロキシ
 */

interface Env {
  ORIGIN_URL: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
}

interface BlogPost {
  id: string;
  slug: string;
  title_ja?: string;
  title_en?: string;
  excerpt_ja?: string;
  excerpt_en?: string;
  image?: string;
  published_at: string;
  category_ja?: string;
  category_en?: string;
  updated_at?: string;
}

// 画像URLの存在確認（HEAD リクエストで疎通チェック）
async function checkImageExists(imageUrl: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒タイムアウト
    
    const response = await fetch(imageUrl, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`[OGP] Image check failed: ${imageUrl} - status ${response.status}`);
      return false;
    }
    
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      console.log(`[OGP] Image check failed: ${imageUrl} - invalid content-type: ${contentType}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.log(`[OGP] Image check error: ${imageUrl} - ${error}`);
    return false;
  }
}

// クローラーのUser-Agentパターン
const CRAWLER_PATTERNS = [
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

// ページごとのOGPデータ
const PAGE_OGP: Record<string, { title: string; description: string; image?: string }> = {
  '/': {
    title: 'Yuki Hamada - イノベーター・起業家・コミュニティビルダー',
    description: '濱田優貴 - Enabler創業者、エンジェル投資家。世界中のクリエイターを支援し、新しい価値を生み出すコミュニティを構築。',
    image: '/images/default-ogp.jpg'
  },
  '/blog': {
    title: 'ブログ | Yuki Hamada',
    description: 'AI、テクノロジー、起業、柔術など多様なテーマについての記事。濱田優貴の考えと経験を共有します。',
    image: '/images/default-ogp.jpg'
  },
  '/community': {
    title: 'コミュニティ | Yuki Hamada',
    description: 'Enablerコミュニティ - クリエイターが集まり、アイデアを共有し、共に成長する場。',
    image: '/images/default-ogp.jpg'
  },
  '/auth': {
    title: 'ログイン | Yuki Hamada',
    description: 'アカウントにログインして、コミュニティに参加しましょう。',
    image: '/images/default-ogp.jpg'
  },
  '/profile': {
    title: 'プロフィール | Yuki Hamada',
    description: 'あなたのプロフィール設定を管理します。',
    image: '/images/default-ogp.jpg'
  }
};

function isCrawler(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  const result = CRAWLER_PATTERNS.some(pattern => ua.includes(pattern.toLowerCase()));
  console.log(`User-Agent: ${userAgent}, isCrawler: ${result}`);
  return result;
}

function generateOGPHtml(
  title: string,
  description: string,
  image: string,
  url: string,
  type: 'website' | 'article' = 'website',
  publishedTime?: string,
  author?: string
): string {
  const baseUrl = 'https://yukihamada.jp';
  const fullImage = image.startsWith('http') ? image : `${baseUrl}${image}`;
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);

  let ogTags = `
  <meta property="og:type" content="${type}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:image" content="${fullImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${safeTitle}" />
  <meta property="og:site_name" content="Yuki Hamada" />
  <meta property="og:locale" content="ja_JP" />`;

  if (type === 'article' && publishedTime) {
    ogTags += `
  <meta property="article:published_time" content="${publishedTime}" />
  <meta property="article:author" content="${author || 'Yuki Hamada'}" />`;
  }

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}" />
  <meta name="robots" content="index, follow" />
  ${ogTags}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@yukihamada" />
  <meta name="twitter:creator" content="@yukihamada" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${fullImage}" />
  <meta name="twitter:image:alt" content="${safeTitle}" />
  <link rel="canonical" href="${url}" />
</head>
<body>
  <h1>${safeTitle}</h1>
  <p>${safeDescription}</p>
  <p><a href="${url}">View this page</a></p>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function fetchAllBlogPosts(env: Env): Promise<BlogPost[]> {
  const supabaseUrl = env.SUPABASE_URL || 'https://itryqwkqnexuawvpoetz.supabase.co';
  const supabaseKey = env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0cnlxd2txbmV4dWF3dnBvZXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTMyNTYsImV4cCI6MjA4MTY2OTI1Nn0.qrPduVUHBWup00n3UaATLQPtF8fASgqLxaSD9TdGurs';

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/blog_posts?status=eq.published&select=id,slug,title_ja,title_en,excerpt_ja,excerpt_en,image,published_at,category_ja,category_en&order=published_at.desc&limit=100`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Supabase fetch error:', response.status);
      return [];
    }

    return await response.json() as BlogPost[];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

function generateSitemap(posts: BlogPost[]): string {
  const baseUrl = 'https://yukihamada.jp';
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${baseUrl}/images/default-ogp.jpg</image:loc>
      <image:title>Yuki Hamada</image:title>
    </image:image>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/community</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;

  for (const post of posts) {
    const pubDate = post.published_at ? post.published_at.split('T')[0] : today;
    const title = escapeHtml(post.title_ja || post.title_en || '');
    const image = post.image || '/images/default-ogp.jpg';
    const fullImage = image.startsWith('http') ? image : `${baseUrl}${image}`;

    xml += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${pubDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${fullImage}</image:loc>
      <image:title>${title}</image:title>
    </image:image>
  </url>`;
  }

  xml += '\n</urlset>';
  return xml;
}

function generateRssFeed(posts: BlogPost[]): string {
  const baseUrl = 'https://yukihamada.jp';
  const now = new Date().toUTCString();

  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Yuki Hamada Blog</title>
    <link>${baseUrl}/blog</link>
    <description>濱田優貴のブログ - AI、テクノロジー、起業、柔術など</description>
    <language>ja</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/images/default-ogp.jpg</url>
      <title>Yuki Hamada Blog</title>
      <link>${baseUrl}/blog</link>
    </image>`;

  for (const post of posts.slice(0, 20)) {
    const title = escapeHtml(post.title_ja || post.title_en || '');
    const description = escapeHtml(post.excerpt_ja || post.excerpt_en || '');
    const pubDate = post.published_at ? new Date(post.published_at).toUTCString() : now;
    const image = post.image || '/images/default-ogp.jpg';
    const fullImage = image.startsWith('http') ? image : `${baseUrl}${image}`;

    rss += `
    <item>
      <title>${title}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      <enclosure url="${fullImage}" type="image/jpeg"/>
    </item>`;
  }

  rss += `
  </channel>
</rss>`;
  return rss;
}

async function fetchBlogPost(slug: string, env: Env): Promise<BlogPost | null> {
  const supabaseUrl = env.SUPABASE_URL || 'https://itryqwkqnexuawvpoetz.supabase.co';
  const supabaseKey = env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0cnlxd2txbmV4dWF3dnBvZXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTMyNTYsImV4cCI6MjA4MTY2OTI1Nn0.qrPduVUHBWup00n3UaATLQPtF8fASgqLxaSD9TdGurs';

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&select=id,slug,title_ja,title_en,excerpt_ja,excerpt_en,image,published_at,category_ja,category_en,updated_at&limit=1`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Supabase fetch error:', response.status);
      return null;
    }

    const posts = await response.json() as BlogPost[];
    return posts.length > 0 ? posts[0] : null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

// 静的アセットの拡張子パターン
const STATIC_ASSET_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico',
  '.css', '.js', '.woff', '.woff2', '.ttf', '.eot',
  '.mp4', '.webm', '.mp3', '.wav', '.ogg',
  '.pdf', '.zip', '.json', '.xml'
];

function isStaticAsset(pathname: string): boolean {
  const lowerPath = pathname.toLowerCase();
  return STATIC_ASSET_EXTENSIONS.some(ext => lowerPath.endsWith(ext));
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';
    const pathname = url.pathname;

    // 静的アセット（画像、CSS、JS等）は常にオリジンにプロキシ
    if (isStaticAsset(pathname)) {
      const originUrl = new URL(pathname + url.search, env.ORIGIN_URL);
      const newRequestHeaders = new Headers();
      request.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'host') {
          newRequestHeaders.set(key, value);
        }
      });

      const originRequest = new Request(originUrl.toString(), {
        method: request.method,
        headers: newRequestHeaders,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
        redirect: 'follow',
      });

      try {
        const response = await fetch(originRequest);
        const newHeaders = new Headers(response.headers);
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      } catch (error) {
        console.error('Static asset proxy error:', error);
        return new Response('Proxy Error', { status: 502 });
      }
    }

    // 動的サイトマップ
    if (pathname === '/sitemap.xml') {
      const posts = await fetchAllBlogPosts(env);
      const sitemap = generateSitemap(posts);
      return new Response(sitemap, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // RSSフィード
    if (pathname === '/feed.xml' || pathname === '/rss.xml') {
      const posts = await fetchAllBlogPosts(env);
      const rss = generateRssFeed(posts);
      return new Response(rss, {
        headers: {
          'Content-Type': 'application/rss+xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // クローラーでない場合はLovableにプロキシ
    if (!isCrawler(userAgent)) {
      const originUrl = new URL(pathname + url.search, env.ORIGIN_URL);

      // リクエストヘッダーをクローン（immutableなので新しいHeadersを作成）
      const newRequestHeaders = new Headers();
      request.headers.forEach((value, key) => {
        // Hostヘッダーは除外（オリジンのホストを使用）
        if (key.toLowerCase() !== 'host') {
          newRequestHeaders.set(key, value);
        }
      });

      const originRequest = new Request(originUrl.toString(), {
        method: request.method,
        headers: newRequestHeaders,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
        redirect: 'follow',
      });

      try {
        const response = await fetch(originRequest);

        // レスポンスヘッダーをコピー
        const newHeaders = new Headers(response.headers);
        newHeaders.delete('x-frame-options'); // 必要に応じて調整

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      } catch (error) {
        console.error('Proxy error:', error);
        return new Response('Proxy Error', { status: 502 });
      }
    }

    // クローラーの場合：動的OGPを生成
    const baseUrl = 'https://yukihamada.jp';
    const fullUrl = `${baseUrl}${pathname}`;

    // ブログ記事ページ
    const blogMatch = pathname.match(/^\/blog\/([^/]+)$/);
    if (blogMatch) {
      const slug = blogMatch[1];
      const post = await fetchBlogPost(slug, env);

      if (post) {
        const title = post.title_ja || post.title_en || 'Blog Post';
        const description = post.excerpt_ja || post.excerpt_en || '';
        const defaultImage = '/images/default-ogp.jpg';
        
        // 画像URLを構築
        let imageUrl = defaultImage;
        let candidateImageUrl: string | null = null;
        
        if (post.image && post.image.trim() !== '') {
          candidateImageUrl = post.image.startsWith('http') ? post.image : `${baseUrl}${post.image}`;
        }
        
        // 画像が設定されている場合は存在チェック
        if (candidateImageUrl) {
          const imageExists = await checkImageExists(candidateImageUrl);
          if (imageExists) {
            imageUrl = candidateImageUrl;
            console.log(`[OGP Worker] Image exists: ${candidateImageUrl}`);
          } else {
            console.log(`[OGP Worker] Image not accessible, falling back to default: ${candidateImageUrl}`);
            imageUrl = defaultImage;
          }
        }
        
        // キャッシュバスター
        const cacheVersion = post.updated_at ? new Date(post.updated_at).getTime() : Date.now();
        const imageUrlWithCacheBuster = `${imageUrl}?v=${cacheVersion}`;

        console.log(`Blog post found: ${slug}, title: ${title}, image: ${imageUrlWithCacheBuster}`);

        const html = generateOGPHtml(
          `${title} | Yuki Hamada`,
          description,
          imageUrlWithCacheBuster,
          fullUrl,
          'article',
          post.published_at
        );

        return new Response(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      } else {
        console.log(`Blog post not found: ${slug}`);
      }
    }

    // 静的ページ
    const pageData = PAGE_OGP[pathname];
    if (pageData) {
      const html = generateOGPHtml(
        pageData.title,
        pageData.description,
        pageData.image || '/images/default-ogp.jpg',
        fullUrl
      );

      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // それ以外のページはデフォルトOGPを返す
    const defaultOgp = PAGE_OGP['/'];
    const html = generateOGPHtml(
      defaultOgp.title,
      defaultOgp.description,
      defaultOgp.image || '/images/default-ogp.jpg',
      fullUrl
    );

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  },
};
