import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[check-scheduled-posts] Starting scheduled post check...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current timestamp
    const now = new Date().toISOString();
    console.log(`[check-scheduled-posts] Current time: ${now}`);

    // Find posts that should be published (published_at <= now and status = 'published')
    // These posts have a scheduled time that has passed
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, slug, title_ja, published_at')
      .eq('status', 'published')
      .lte('published_at', now);

    if (fetchError) {
      console.error('[check-scheduled-posts] Error fetching posts:', fetchError);
      throw fetchError;
    }

    console.log(`[check-scheduled-posts] Found ${scheduledPosts?.length || 0} posts with passed publish time`);

    // Log each post that's now "live"
    if (scheduledPosts && scheduledPosts.length > 0) {
      for (const post of scheduledPosts) {
        console.log(`[check-scheduled-posts] Post "${post.title_ja}" (${post.slug}) is now live. Published at: ${post.published_at}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Checked ${scheduledPosts?.length || 0} published posts`,
        timestamp: now,
        posts: scheduledPosts?.map(p => ({ slug: p.slug, title: p.title_ja })) || []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[check-scheduled-posts] Error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
