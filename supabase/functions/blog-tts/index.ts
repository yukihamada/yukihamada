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
    // Using eleven_turbo_v2_5 for faster generation
    const voiceId = language === 'ja' ? 'leGYIMqwBZraox9zSQym' : 'CwhRBWXzGAHq8TQ4Fs17';

    // Convert text to conversational style using AI for both languages
    // Limit text length for faster processing
    let processedText = text.substring(0, 4000);
    
    const systemPrompt = language === 'ja' 
      ? `あなたはテキストを音声読み上げ用に変換するプロのナレーターです。以下のルールに厳密に従ってテキストを変換してください：

【最重要ルール - ひらがな化】
すべての漢字を正確なひらがなに変換してください。漢字が1文字でも残っていたら失敗です。
- 「私」→「わたし」、「技術」→「ぎじゅつ」、「健康」→「けんこう」
- 「柔術」→「じゅうじゅつ」、「睡眠」→「すいみん」、「断食」→「だんじき」
- 「冷水」→「れいすい」、「呼吸」→「こきゅう」、「効果」→「こうか」
- 「人生」→「じんせい」、「変化」→「へんか」、「習慣」→「しゅうかん」
- 固有名詞も変換：「濱田」→「はまだ」、「東京」→「とうきょう」

【重複・冗長表現の削除 - 超重要】
1. 括弧内の補足は完全に省略する：
   - 「柔術（BJJ）」→「じゅうじゅつ」（BJJは読まない）
   - 「16時間断食（インターミッテントファスティング）」→「じゅうろくじかんだんじき」
   - 「睡眠の質（スリープクオリティ）」→「すいみんのしつ」
   - 「冷水浴（コールドプランジ）」→「れいすいよく」
2. 同じ意味の言い換えは最初の表現のみ使用
3. 注釈や参照（※、注：、*など）は完全に省略
4. URLやリンクテキストは省略

【話し言葉への変換】
1. 「〜である」「〜となる」→「〜なんですよね」「〜になりますね」
2. 「〜について述べる」→「〜についておはなしします」
3. 「重要なのは」→「だいじなのは」
4. 「〜が挙げられる」→「〜がありますね」
5. 読者に語りかけるように：「みなさん」「〜ですよね」「〜してみてください」
6. 箇条書きは「まずひとつめは」「つぎに」「さいごに」で自然につなぐ
7. ですます調で丁寧に、でも堅すぎず親しみやすく

【数字と英語の読み方】
1. 数字は読みやすく：「16時間」→「じゅうろくじかん」、「2.5倍」→「にてんごばい」
2. 英語は自然なカタカナに：「BJJ」→「ビージェージェー」、「cold plunge」→「コールドプランジ」

【出力形式】
- ひらがな + カタカナのみ
- 漢字は絶対に使わない
- 句読点は「、」「。」を使用
- 長い文は適度に区切って読みやすく`
      : `You are a professional narrator converting text for natural speech. Follow these rules:

【Remove Duplicates and Redundancy - CRITICAL】
1. Skip parenthetical explanations that repeat the same concept:
   - "BJJ (Brazilian Jiu-Jitsu)" → just "Brazilian Jiu-Jitsu"
   - "16-hour fasting (intermittent fasting)" → just "sixteen hour fasting"
   - "sleep quality (sleep score)" → just "sleep quality"
2. Skip footnotes, references, and annotations (*, †, ※, etc.)
3. Choose one term when synonyms are listed together
4. Skip URLs and link text

【Conversational Style】
1. Use conversational, friendly tone - like talking to a friend over coffee
2. First person "I" and address listener as "you"
3. Add natural transitions: "So here's the thing...", "What I found interesting..."
4. For lists, use: "First...", "Next...", "And finally..."
5. Break long sentences into shorter phrases
6. Keep it engaging and warm

【Numbers and Abbreviations】
1. Convert numbers: "16 hours" → "sixteen hours", "2.5x" → "two and a half times"
2. Spell out abbreviations naturally: "TTS" → "text to speech"

Transform for natural spoken delivery, like a podcast host sharing insights.`;

    console.log(`Converting ${language} text to conversational style...`);
    
    // Use Lovable AI gateway for faster processing
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: processedText }
        ],
        temperature: 0.5,
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

    // Use turbo model for faster generation
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: processedText,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
            speed: 1.1,
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
