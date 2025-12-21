import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      .single();

    const baseUrl = 'https://yukihamada.jp';
    
    if (error || !post) {
      console.log('Post not found for slug:', slug);
      // Return default OGP for unknown posts
      return new Response(
        JSON.stringify({
          title: 'Yuki Hamada - イノベーター・起業家・コミュニティビルダー',
          description: '濱田優貴 - イネブラ創業者、エンジェル投資家。世界中のクリエイターを支援し、新しい価値を生み出すコミュニティを構築。',
          image: `${baseUrl}/images/default-ogp.jpg`,
          url: baseUrl,
          type: 'website',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get language-specific content
    const title = lang === 'en' ? post.title_en : post.title_ja;
    const excerpt = lang === 'en' ? post.excerpt_en : post.excerpt_ja;
    const category = lang === 'en' ? post.category_en : post.category_ja;
    const date = lang === 'en' ? post.date_en : post.date_ja;

    const postUrl = `${baseUrl}/blog/${slug}`;
    const imageUrl = post.image 
      ? (post.image.startsWith('http') ? post.image : `${baseUrl}${post.image}`)
      : `${baseUrl}/images/default-ogp.jpg`;

    const ogData = {
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

    console.log('Returning OGP data for:', slug, ogData);

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
