import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language, postSlug } = await req.json();
    
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create cache file path
    const cacheFileName = `${postSlug}_${language}.mp3`;
    
    // Check if cached audio exists in storage
    console.log(`Checking cache for: ${cacheFileName}`);
    const { data: existingFile } = await supabase.storage
      .from('blog-tts-cache')
      .list('', { search: cacheFileName });
    
    if (existingFile && existingFile.length > 0) {
      // Return cached audio URL
      const { data: publicUrl } = supabase.storage
        .from('blog-tts-cache')
        .getPublicUrl(cacheFileName);
      
      console.log(`Cache hit! Returning cached audio: ${publicUrl.publicUrl}`);
      
      return new Response(
        JSON.stringify({ 
          cached: true, 
          audioUrl: publicUrl.publicUrl 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Cache miss. Generating TTS for language: ${language}, text length: ${text.length}`);

    // Use appropriate voice based on language
    const voiceId = language === 'ja' ? 'pFZP5JQG7iQjIQuC4Bku' : 'CwhRBWXzGAHq8TQ4Fs17'; // Lily for Japanese, Roger for English

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.substring(0, 5000), // Limit text length
          model_id: "eleven_multilingual_v2",
          output_format: "mp3_44100_128",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioUint8 = new Uint8Array(audioBuffer);
    
    // Upload to Supabase Storage for caching
    console.log(`Uploading audio to storage: ${cacheFileName}`);
    const { error: uploadError } = await supabase.storage
      .from('blog-tts-cache')
      .upload(cacheFileName, audioUint8, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Failed to cache audio:', uploadError);
      // Still return the audio even if caching fails
    } else {
      console.log('Audio cached successfully');
    }

    // Get the public URL
    const { data: publicUrl } = supabase.storage
      .from('blog-tts-cache')
      .getPublicUrl(cacheFileName);

    return new Response(
      JSON.stringify({ 
        cached: false, 
        audioUrl: publicUrl.publicUrl 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in blog-tts function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
