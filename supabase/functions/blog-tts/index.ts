import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { encode as hexEncode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a short hash from text content for cache invalidation
async function generateContentHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  const hashHex = new TextDecoder().decode(hexEncode(hashArray));
  return hashHex.substring(0, 8); // Use first 8 chars for brevity
}

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

    // Generate content hash for cache invalidation when text changes
    const contentHash = await generateContentHash(text);
    const cacheFileName = `${postSlug}_${language}_${contentHash}.mp3`;
    
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

    // Clean up old cache files for this post/language combo
    console.log(`Cache miss. Cleaning up old cache files for ${postSlug}_${language}...`);
    const { data: oldFiles } = await supabase.storage
      .from('blog-tts-cache')
      .list('', { search: `${postSlug}_${language}_` });
    
    if (oldFiles && oldFiles.length > 0) {
      const filesToDelete = oldFiles.map(f => f.name);
      console.log(`Deleting ${filesToDelete.length} old cache files:`, filesToDelete);
      await supabase.storage
        .from('blog-tts-cache')
        .remove(filesToDelete);
    }

    console.log(`Cache miss. Generating TTS for language: ${language}, text length: ${text.length}`);

    // Use Yuki's custom voice for Japanese, Roger for English
    const voiceId = language === 'ja' ? 'VneiyrGsB8R1ym9S1XYl' : 'CwhRBWXzGAHq8TQ4Fs17';

    // Convert text to conversational style using AI for both languages
    let processedText = text.substring(0, 5000);
    
    const systemPrompt = language === 'ja' 
      ? `あなたはテキストを音声読み上げ用に変換するアシスタントです。以下のルールに従ってテキストを変換してください：

1. 硬い文章を自然な話し言葉に変換する（例：「である」→「だよね」、「ではないか」→「じゃないかな」）
2. 【重要】漢字はすべてひらがなに変換する（固有名詞も含めてすべて）
3. 数字は読みやすいように変換（例：「2024年」→「にせんにじゅうよねん」）
4. 記号やURLは省略または説明に置き換える
5. 一人称は「ぼく」を使う
6. 親しみやすく、まるで友達に話しかけるような口調にする
7. 長すぎる文は適度に区切る
8. カタカナはそのままでOK

元のテキストの意味は保ちつつ、聞いて自然に感じる日本語に変換してください。出力はすべてひらがなとカタカナのみにしてください。`
      : `You are an assistant that converts text for natural speech synthesis. Follow these rules:

1. Convert formal writing to natural conversational speech (e.g., "It is important to note" → "Here's the thing")
2. Use first person "I" and speak directly to the listener as "you"
3. Add natural filler words and transitions (e.g., "so", "you know", "basically")
4. Convert numbers and abbreviations to spoken form (e.g., "2024" → "twenty twenty-four")
5. Remove or describe URLs and symbols
6. Break long sentences into shorter, more digestible phrases
7. Make it sound like a friendly conversation, as if talking to a friend
8. Keep the original meaning while making it sound warm and approachable

Transform the text to feel natural when spoken aloud, like a podcast or casual chat.`;

    console.log(`Converting ${language} text to conversational style...`);
    
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: processedText }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      processedText = aiData.choices?.[0]?.message?.content || processedText;
      console.log('Text converted successfully, new length:', processedText.length);
    } else {
      console.error('AI conversion failed, using original text:', await aiResponse.text());
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: processedText,
          model_id: "eleven_multilingual_v2",
          output_format: "mp3_44100_128",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.4,
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
