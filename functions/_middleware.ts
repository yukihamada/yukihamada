// Cloudflare Pages Function for dynamic OGP
// This middleware intercepts requests from social media crawlers
// and injects proper OGP meta tags server-side

interface BlogPostData {
  slug: string;
  title: string;
  description: string;
  image: string;
  date: string;
  category: string;
}

// Blog post metadata for OGP (add more posts as needed)
const blogPosts: Record<string, BlogPostData> = {
  '2025-12-20-sinic': {
    slug: '2025-12-20-sinic',
    title: 'サイニック理論が示すAIの未来',
    description: 'オムロン創業者・立石一真が1970年代に提唱したサイニック理論。その先見性とAI時代への示唆を探る。',
    image: '/images/blog-sinic-theory.jpg',
    date: '2025-12-20',
    category: 'AI'
  },
  '2025-12-20': {
    slug: '2025-12-20',
    title: 'JiuFlowを作った話',
    description: 'AIを活用した柔術トレーニングアプリ「JiuFlow」の開発ストーリー。',
    image: '/images/blog-jiuflow.jpg',
    date: '2025-12-20',
    category: 'Product'
  },
  '2025-12-19': {
    slug: '2025-12-19',
    title: 'Lovable.devでサイトリニューアル',
    description: 'AIパワードのWeb開発ツール「Lovable.dev」を使ってサイトをリニューアルした体験談。',
    image: '/images/blog-lovable.jpg',
    date: '2025-12-19',
    category: 'Tech'
  },
  '2025-12-18': {
    slug: '2025-12-18',
    title: 'Claude完全ガイド',
    description: 'AnthropicのAI「Claude」を最大限に活用するための完全ガイド。',
    image: '/images/blog-claude.jpg',
    date: '2025-12-18',
    category: 'AI'
  },
  '2025-12-17': {
    slug: '2025-12-17',
    title: 'エコーチェンバーを抜け出す',
    description: '情報の偏りから脱却し、多様な視点を得るための方法論。',
    image: '/images/blog-echo-chamber.jpg',
    date: '2025-12-17',
    category: 'Thoughts'
  },
  '2025-12-16': {
    slug: '2025-12-16',
    title: '声を上げることの重要性',
    description: '変化を起こすために必要な「声を上げる」ことの価値と方法。',
    image: '/images/blog-voice.jpg',
    date: '2025-12-16',
    category: 'Thoughts'
  },
  '2025-12-15': {
    slug: '2025-12-15',
    title: 'AIと人間の共存',
    description: 'AI時代における人間の役割と、共存のための戦略。',
    image: '/images/blog-ai-human.jpg',
    date: '2025-12-15',
    category: 'AI'
  },
  'hybrid-lifestyle-longevity-performance-2026': {
    slug: 'hybrid-lifestyle-longevity-performance-2026',
    title: '【2026年完全版】「引き算」で寿命を伸ばし、「タイミング」で最強になる究極の食事法',
    description: 'ミトコンドリア最適化・オートファジー活性化・ケトン体活用を科学的根拠とともに解説。ON/OFFモードを使い分ける次世代の食事戦略。',
    image: '/images/blog-hybrid-lifestyle-hero.jpg',
    date: '2026-01-20',
    category: 'Health'
  }
};

// Page-specific OGP data
const pageOGP: Record<string, { title: string; description: string; image?: string }> = {
  '/': {
    title: 'Yuki Hamada - イノベーター・起業家・コミュニティビルダー',
    description: '濱田優貴 - イネブラ創業者、エンジェル投資家。世界中のクリエイターを支援し、新しい価値を生み出すコミュニティを構築。'
  },
  '/blog': {
    title: 'ブログ | Yuki Hamada',
    description: 'AI、テクノロジー、起業、柔術など多様なテーマについての記事。'
  },
  '/community': {
    title: 'コミュニティ | Yuki Hamada',
    description: 'イネブラコミュニティ - クリエイターが集まり、アイデアを共有し、共に成長する場。'
  },
  '/auth': {
    title: 'ログイン | Yuki Hamada',
    description: 'アカウントにログインして、コミュニティに参加しましょう。'
  }
};

// User agent patterns for social media crawlers
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
  'Google-InspectionTool'
];

function isCrawler(userAgent: string): boolean {
  return crawlerPatterns.some(pattern =>
    userAgent.toLowerCase().includes(pattern.toLowerCase())
  );
}

function generateOGPHtml(
  title: string,
  description: string,
  image: string,
  url: string,
  type: 'website' | 'article' = 'website',
  publishedTime?: string
): string {
  const baseUrl = 'https://yukihamada.jp';
  const fullImage = image.startsWith('http') ? image : `${baseUrl}${image}`;

  let html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="index, follow">

  <!-- Open Graph Protocol -->
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${fullImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Yuki Hamada">
  <meta property="og:locale" content="ja_JP">`;

  if (type === 'article' && publishedTime) {
    html += `
  <meta property="article:published_time" content="${publishedTime}">
  <meta property="article:author" content="Yuki Hamada">`;
  }

  html += `

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@yukihamada">
  <meta name="twitter:creator" content="@yukihamada">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${fullImage}">

  <link rel="canonical" href="${url}">
</head>
<body>
  <p>Redirecting to ${url}...</p>
  <script>window.location.href = "${url}";</script>
</body>
</html>`;

  return html;
}

export const onRequest: PagesFunction = async (context) => {
  const { request, next } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';

  // Only intercept for crawlers
  if (!isCrawler(userAgent)) {
    return next();
  }

  const baseUrl = 'https://yukihamada.jp';
  const pathname = url.pathname;

  // Blog post pages
  const blogMatch = pathname.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    const slug = blogMatch[1];
    const post = blogPosts[slug];

    if (post) {
      const html = generateOGPHtml(
        `${post.title} | Yuki Hamada`,
        post.description,
        post.image,
        `${baseUrl}${pathname}`,
        'article',
        post.date
      );

      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }
  }

  // Static pages
  const pageData = pageOGP[pathname];
  if (pageData) {
    const html = generateOGPHtml(
      pageData.title,
      pageData.description,
      pageData.image || '/images/default-ogp.jpg',
      `${baseUrl}${pathname}`
    );

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }

  // Default: pass through to next handler
  return next();
};
