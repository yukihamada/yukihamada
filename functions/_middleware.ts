/**
 * Cloudflare Pages Middleware for Dynamic OGP
 * 
 * SNSクローラーからのリクエストをog-metadata Edge Functionにプロキシ
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

export const onRequest: PagesFunction = async (context) => {
  const { request, next } = context;
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  const pathname = url.pathname;

  // クローラーでない場合は通常のリクエストを続行
  if (!isCrawler(userAgent)) {
    return next();
  }

  // クローラーの場合：og-metadata Edge Functionにプロキシ
  const supabaseUrl = 'https://itryqwkqnexuawvpoetz.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0cnlxd2txbmV4dWF3dnBvZXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTMyNTYsImV4cCI6MjA4MTY2OTI1Nn0.qrPduVUHBWup00n3UaATLQPtF8fASgqLxaSD9TdGurs';

  // ブログ記事のスラッグを抽出
  const blogMatch = pathname.match(/^\/blog\/([^/]+)$/);
  const slug = blogMatch ? blogMatch[1] : '';

  // og-metadata Edge Functionを呼び出し
  const ogUrl = new URL(`${supabaseUrl}/functions/v1/og-metadata`);
  ogUrl.searchParams.set('format', 'html');
  if (slug) {
    ogUrl.searchParams.set('slug', slug);
  }
  ogUrl.searchParams.set('path', pathname);

  try {
    const response = await fetch(ogUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
    });

    if (!response.ok) {
      console.error('og-metadata fetch failed:', response.status);
      return next();
    }

    const html = await response.text();
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('og-metadata error:', error);
    return next();
  }
};
