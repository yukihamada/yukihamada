import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    const lang = url.searchParams.get('lang') || 'ja';
    const format = url.searchParams.get('format') || 'json';
    const path = url.searchParams.get('path') || '/';
    
    console.log(`[og-metadata] Request: slug=${slug}, path=${path}, format=${format}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = 'https://yukihamada.jp';
    
    // Default OGP data
    let ogData = {
      title: 'Yuki Hamada - イノベーター・起業家・コミュニティビルダー',
      description: '濱田優貴 - イネブラ創業者、エンジェル投資家。世界中のクリエイターを支援し、新しい価値を生み出すコミュニティを構築。',
      image: `${baseUrl}/images/default-ogp.jpg`,
      url: baseUrl,
      type: 'website' as 'website' | 'article',
      publishedTime: '',
      section: '',
      siteName: 'Yuki Hamada',
      twitterCard: 'summary_large_image',
      twitterSite: '@yukihamada',
      twitterCreator: '@yukihamada',
      locale: 'ja_JP',
    };

    // If slug provided, fetch blog post
    if (slug) {
      const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (post && !error) {
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
        
        console.log(`[og-metadata] Found post: ${title}, image: ${imageUrl}`);
      } else {
        console.log(`[og-metadata] Post not found for slug: ${slug}`);
      }
    }

    // Return JSON if requested
    if (format === 'json') {
      return new Response(
        JSON.stringify(ogData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return HTML with OGP tags
    const html = `<!DOCTYPE html>
<html lang="${lang === 'en' ? 'en' : 'ja'}">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
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
  
  <!-- Redirect for browsers (3 second delay for crawlers to parse OGP) -->
  <meta http-equiv="refresh" content="3;url=${escapeHtml(ogData.url)}">
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
        'Cache-Control': 'public, max-age=3600'
      } 
    });
  } catch (error) {
    console.error('[og-metadata] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
