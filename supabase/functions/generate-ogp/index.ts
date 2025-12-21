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
    const { postSlug, title, category, language = 'ja' } = await req.json();
    
    console.log(`[generate-ogp] Generating OGP for: ${postSlug}`);
    console.log(`[generate-ogp] Title: ${title}`);
    console.log(`[generate-ogp] Category: ${category}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate OGP image using Lovable AI with image generation model
    const prompt = `Create a professional blog OGP (Open Graph Protocol) image for social media sharing.

Title: "${title}"
Category: ${category}
Style: Modern, clean, professional blog header image
Dimensions: 1200x630 (OGP standard)
Requirements:
- Dark gradient background (deep blue to purple or similar professional colors)
- The title text "${title}" should be prominently displayed in white/light text
- Add subtle decorative elements related to the topic (tech icons, abstract shapes)
- Include a small category badge showing "${category}"
- Modern typography with good contrast
- Professional and eye-catching design suitable for Twitter/Facebook/LinkedIn sharing
- Ultra high resolution, sharp text`;

    console.log('[generate-ogp] Calling AI image generation...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-ogp] AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your account.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[generate-ogp] AI response received');

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error('[generate-ogp] No image in response:', JSON.stringify(data).substring(0, 500));
      throw new Error('No image generated');
    }

    // Extract base64 data
    const base64Match = imageUrl.match(/^data:image\/(png|jpeg|webp);base64,(.+)$/);
    if (!base64Match) {
      throw new Error('Invalid image format');
    }

    const imageType = base64Match[1];
    const base64Data = base64Match[2];
    
    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to Supabase Storage
    const fileName = `ogp-${postSlug}.${imageType}`;
    const filePath = `blog-ogp/${fileName}`;

    console.log(`[generate-ogp] Uploading to storage: ${filePath}`);

    // Check if blog-ogp bucket exists, create if not
    const { data: buckets } = await supabase.storage.listBuckets();
    const ogpBucket = buckets?.find(b => b.name === 'blog-ogp');
    
    if (!ogpBucket) {
      console.log('[generate-ogp] Creating blog-ogp bucket...');
      const { error: createError } = await supabase.storage.createBucket('blog-ogp', {
        public: true
      });
      if (createError) {
        console.error('[generate-ogp] Error creating bucket:', createError);
      }
    }

    // Upload the image
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-ogp')
      .upload(fileName, bytes, {
        contentType: `image/${imageType}`,
        upsert: true
      });

    if (uploadError) {
      console.error('[generate-ogp] Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('blog-ogp')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    console.log(`[generate-ogp] Uploaded successfully: ${publicUrl}`);

    // Update blog post with new OGP image URL
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ image: publicUrl })
      .eq('slug', postSlug);

    if (updateError) {
      console.error('[generate-ogp] Error updating blog post:', updateError);
      // Don't throw - image was still generated successfully
    } else {
      console.log('[generate-ogp] Blog post updated with new image');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: publicUrl,
        message: 'OGP image generated successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[generate-ogp] Error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
