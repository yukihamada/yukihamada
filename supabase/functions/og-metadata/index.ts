import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Check if the request is from a social media crawler
const isCrawler = (userAgent: string): boolean => {
  const crawlerPatterns = [
    'facebookexternalhit',
    'Facebot',
    'Twitterbot',
    'LinkedInBot',
    'Pinterest',
    'Slackbot',
    'Discordbot',
    'TelegramBot',
    'WhatsApp',
    'Line',
    'Hatena',
    'Mixi',
    'bot',
    'crawler',
    'spider',
    'curl',
    'wget',
  ];
  const ua = userAgent.toLowerCase();
  return crawlerPatterns.some(pattern => ua.includes(pattern.toLowerCase()));
};

// Escape HTML special characters
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    const lang = url.searchParams.get('lang') || 'ja';
    const format = url.searchParams.get('format') || 'auto';
    const userAgent = req.headers.get('user-agent') || '';
    
    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'slug parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch blog post from database
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    const baseUrl = 'https://yukihamada.jp';
    
    // Default OGP data
    let ogData = {
      title: 'Yuki Hamada - イノベーター・起業家・コミュニティビルダー',
      description: '濱田優貴 - イネブラ創業者、エンジェル投資家。世界中のクリエイターを支援し、新しい価値を生み出すコミュニティを構築。',
      image: `${baseUrl}/images/default-ogp.jpg`,
      url: baseUrl,
      type: 'website',
      publishedTime: '',
      section: '',
      siteName: 'Yuki Hamada',
      twitterCard: 'summary_large_image',
      twitterSite: '@yukihamada',
      twitterCreator: '@yukihamada',
      locale: 'ja_JP',
    };

    if (post && !error) {
      // Get language-specific content
      const title = lang === 'en' ? post.title_en : post.title_ja;
      const excerpt = lang === 'en' ? post.excerpt_en : post.excerpt_ja;
      const category = lang === 'en' ? post.category_en : post.category_ja;
      const date = lang === 'en' ? post.date_en : post.date_ja;

      const postUrl = `${baseUrl}/blog/${slug}`;
      const imageUrl = post.image 
        ? (post.image.startsWith('http') ? post.image : `${baseUrl}${post.image}`)
        : `${baseUrl}/images/default-ogp.jpg`;

      ogData = {
        title: `${title} | Yuki Hamada`,
        description: excerpt,
        image: imageUrl,
        url: postUrl,
        type: 'article',
        publishedTime: date,
        section: category,
        siteName: 'Yuki Hamada',
        twitterCard: 'summary_large_image',
        twitterSite: '@yukihamada',
        twitterCreator: '@yukihamada',
        locale: lang === 'en' ? 'en_US' : 'ja_JP',
      };
    }

    console.log('OGP request for slug:', slug, 'User-Agent:', userAgent.substring(0, 50));

    // If format=json or not a crawler, return JSON
    if (format === 'json') {
      return new Response(
        JSON.stringify(ogData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For crawlers or format=html, return full HTML with OGP tags
    if (format === 'html' || isCrawler(userAgent)) {
      const html = `<!DOCTYPE html>
<html lang="${lang === 'en' ? 'en' : 'ja'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(ogData.title)}</title>
  
  <!-- Basic SEO -->
  <meta name="description" content="${escapeHtml(ogData.description)}">
  <meta name="author" content="Yuki Hamada">
  
  <!-- Open Graph Protocol -->
  <meta property="og:type" content="${ogData.type}">
  <meta property="og:url" content="${escapeHtml(ogData.url)}">
  <meta property="og:title" content="${escapeHtml(ogData.title)}">
  <meta property="og:description" content="${escapeHtml(ogData.description)}">
  <meta property="og:image" content="${escapeHtml(ogData.image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${escapeHtml(ogData.siteName)}">
  <meta property="og:locale" content="${ogData.locale}">
  ${ogData.publishedTime ? `<meta property="article:published_time" content="${escapeHtml(ogData.publishedTime)}">` : ''}
  ${ogData.section ? `<meta property="article:section" content="${escapeHtml(ogData.section)}">` : ''}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="${ogData.twitterCard}">
  <meta name="twitter:site" content="${ogData.twitterSite}">
  <meta name="twitter:creator" content="${ogData.twitterCreator}">
  <meta name="twitter:title" content="${escapeHtml(ogData.title)}">
  <meta name="twitter:description" content="${escapeHtml(ogData.description)}">
  <meta name="twitter:image" content="${escapeHtml(ogData.image)}">
  
  <!-- Redirect for browsers -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(ogData.url)}">
  <link rel="canonical" href="${escapeHtml(ogData.url)}">
</head>
<body>
  <h1>${escapeHtml(ogData.title)}</h1>
  <p>${escapeHtml(ogData.description)}</p>
  <p>Redirecting to <a href="${escapeHtml(ogData.url)}">${escapeHtml(ogData.url)}</a>...</p>
</body>
</html>`;

      return new Response(html, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        }
      });
    }

    // Default: return JSON
    return new Response(
      JSON.stringify(ogData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
