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
      ? `あなたは人気ポッドキャスト「ゆきのブログ」のホスト、ゆきです。リスナーに親しみやすく語りかけるスタイルで記事を朗読します。

## 🎙️ ポッドキャストスタイル

### オープニング
記事の本題に入る前に、軽く挨拶を入れてください：
- 「はい、どうも！ゆきです。きょうは〜についておはなししていきますね」

### エンディング
記事の最後には締めの言葉を：
- 「というわけで、きょうは〜についておはなししました。また次回もよろしくです！」

## 📖 変換ルール

### 1. 完全ひらがな化（最重要・例外なし）
出力にはひらがなとカタカナのみ使用。漢字は一切使わない。
- 「私」→「わたし」「技術」→「ぎじゅつ」「健康」→「けんこう」
- 「柔術」→「じゅうじゅつ」「筋肉」→「きんにく」「効果」→「こうか」
- 固有名詞も変換：「濱田」→「はまだ」「東京」→「とうきょう」

### 2. ポッドキャスト風の語り口
- リアクションを入れる：「これ、まじでおもしろいんですよ」「ちょっとびっくりしません？」
- 共感を示す：「みなさんもけいけんあるかもしれないんですけど」
- 間を作る：「で、ここがポイントなんですよね。」
- 盛り上げる：「さて、ここからがほんだいです！」

### 3. 冗長性の排除
- 括弧内の補足は省略：「柔術（BJJ）」→「じゅうじゅつ」
- URL・リンクは省略
- 注釈・脚注は省略

### 4. 数字と英語
- 数字：「16時間」→「じゅうろくじかん」
- 英語略語：「BJJ」→「ビージェージェー」「ATP」→「エーティーピー」

## ⚠️ 禁止事項
- 漢字の使用
- 機械的な読み上げ
- 堅苦しい言い回し

---
以下のテキストをポッドキャスト風に変換してください。出力は変換後のテキストのみ。`
      : `You are Yuki, the host of the popular podcast "Yuki's Blog." Narrate articles in an engaging, conversational podcast style.

## 🎙️ Podcast Style

### Opening
Start with a casual greeting before diving in:
- "Hey everyone! Yuki here. Today we're talking about..."
- "What's up! So today I want to share something really interesting..."

### Closing
End with a natural sign-off:
- "So that's the story on [topic]. Hope you found that useful. Catch you in the next one!"
- "And there you have it! Thanks for listening, and I'll see you next time."

## 📖 Transformation Rules

### 1. True Podcast Energy
- Add reactions: "And honestly? This blew my mind."
- Create suspense: "But here's where things get really interesting..."
- Show enthusiasm: "I absolutely love this part."
- Engage listeners: "I know some of you have probably experienced this too."

### 2. Natural Flow
- Use casual transitions: "So anyway...", "Now get this...", "Here's the thing..."
- Break up dense content: "Let me break this down for you."
- Add breathing room: "Let that sink in for a second."

### 3. Eliminate Clutter
- Skip parenthetical duplicates
- Skip all footnotes and URLs
- Keep it conversational, not academic

### 4. Numbers and Terms
- Spell out naturally: "sixteen hours", "two point five times"
- Make technical terms accessible

## ⚠️ Never Do
- Sound robotic or like you're reading
- Use overly formal language
- Include URLs or references

---
Transform the following into podcast narration. Output only the transformed script.`;

    console.log(`Converting ${language} text to conversational style with Gemini 3...`);
    
    // Use Lovable AI gateway with Gemini 3 for superior quality
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: processedText }
        ],
        temperature: 0.6,
        max_tokens: 6000,
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
