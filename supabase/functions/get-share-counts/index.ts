import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { slug } = await req.json()

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'slug is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if we have cached counts that are less than 1 hour old
    const { data: cached } = await supabase
      .from('blog_share_counts')
      .select('*')
      .eq('post_slug', slug)
      .single()

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    if (cached && new Date(cached.updated_at) > oneHourAgo) {
      return new Response(
        JSON.stringify({
          twitter: cached.twitter_count,
          facebook: cached.facebook_count,
          hatena: cached.hatena_count,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch fresh counts
    const baseUrl = 'https://yukihamada.jp'
    const postUrl = `${baseUrl}/blog/${slug}`

    // Fetch Hatena bookmark count (most reliable API)
    let hatenaCount = 0
    try {
      const hatenaRes = await fetch(
        `https://bookmark.hatenaapis.com/count/entry?url=${encodeURIComponent(postUrl)}`
      )
      if (hatenaRes.ok) {
        hatenaCount = await hatenaRes.json()
      }
    } catch (e) {
      console.error('Hatena API error:', e)
    }

    // Note: Twitter and Facebook no longer provide public share count APIs
    // We'll store 0 for these but could integrate with paid services in the future
    const twitterCount = 0
    const facebookCount = 0

    // Upsert the counts
    await supabase
      .from('blog_share_counts')
      .upsert({
        post_slug: slug,
        twitter_count: twitterCount,
        facebook_count: facebookCount,
        hatena_count: hatenaCount,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'post_slug'
      })

    return new Response(
      JSON.stringify({
        twitter: twitterCount,
        facebook: facebookCount,
        hatena: hatenaCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to get share counts' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})