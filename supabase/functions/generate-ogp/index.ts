import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate visual-only prompt based on title and category
function generateVisualPrompt(title: string, category: string): string {
  const lowerTitle = title.toLowerCase();
  const lowerCategory = category.toLowerCase();
  
  // BJJ / Martial Arts
  if (lowerCategory.includes('柔術') || lowerTitle.includes('柔術') || lowerTitle.includes('bjj')) {
    return 'A dramatic scene of Brazilian Jiu-Jitsu practitioners on a mat, dynamic grappling positions, gym environment with soft lighting, sweat and intensity, cinematic sports photography';
  }
  
  // AI / Technology
  if (lowerCategory.includes('テクノロジー') || lowerCategory.includes('ai') || lowerTitle.includes('ai') || lowerTitle.includes('人工知能')) {
    return 'Futuristic abstract visualization of neural networks and data streams, glowing blue and purple circuits, holographic interfaces, sleek technological aesthetic';
  }
  
  // Career / Business
  if (lowerCategory.includes('キャリア') || lowerCategory.includes('経営') || lowerTitle.includes('仕事') || lowerTitle.includes('キャリア')) {
    return 'Professional business environment, modern office with large windows, person contemplating at a desk, warm golden hour lighting, aspirational atmosphere';
  }
  
  // Security
  if (lowerCategory.includes('セキュリティ') || lowerTitle.includes('セキュリティ') || lowerTitle.includes('警告')) {
    return 'Digital security concept, glowing shield icon protecting data, dark background with red alert accents, cyber defense visualization';
  }
  
  // Life / Philosophy
  if (lowerCategory.includes('ライフ') || lowerTitle.includes('愛') || lowerTitle.includes('人生')) {
    return 'Artistic still life with warm colors, peaceful nature scene, sunrise or sunset with beautiful clouds, contemplative and serene atmosphere';
  }
  
  // Future / Prediction
  if (lowerCategory.includes('未来') || lowerTitle.includes('未来')) {
    return 'Futuristic cityscape at twilight, hovering vehicles, holographic displays, blend of organic and technological elements, sci-fi optimism';
  }
  
  // Default: Abstract professional
  return 'Abstract artistic composition with flowing shapes and gradients, professional color palette of blues and teals, dynamic movement, modern and sophisticated';
}

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
    // Create visual-only prompt based on title and category
    const visualPrompt = generateVisualPrompt(title, category);
    
    const prompt = `Create a stunning, artistic blog header image. NO TEXT OR LETTERS ALLOWED.

Topic: "${title}"
Category: ${category}

Requirements:
- ABSOLUTELY NO TEXT, LETTERS, WORDS, OR TYPOGRAPHY in the image
- Dimensions: 1200x630 (OGP standard, 16:9 aspect ratio)
- Cinematic, high-quality photography or artistic illustration style
- Rich colors, dramatic lighting, professional composition
- Visual metaphors and symbolic imagery that represent the topic
- Ultra high resolution, photorealistic or artistic quality

Visual concept: ${visualPrompt}

CRITICAL: The image must contain NO TEXT whatsoever. Only visual elements.`;

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
