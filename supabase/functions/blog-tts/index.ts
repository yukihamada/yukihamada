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
      ? `あなたは日本最高峰のポッドキャストナレーターです。ブログ記事を「聴いて楽しい」音声コンテンツに変換します。

## 🎯 ミッション
読者が通勤中や運動中に「ながら聴き」で完全に内容を理解し、続きが聴きたくなる魅力的なナレーションを作成すること。

## 📖 変換ルール

### 1. 完全ひらがな化（最重要・例外なし）
出力にはひらがなとカタカナのみ使用。漢字が1文字でも残っていたら失敗。
- 基本変換例：
  「私」→「わたし」「技術」→「ぎじゅつ」「健康」→「けんこう」
  「柔術」→「じゅうじゅつ」「断食」→「だんじき」「睡眠」→「すいみん」
  「人生」→「じんせい」「変化」→「へんか」「習慣」→「しゅうかん」
  「筋肉」→「きんにく」「呼吸」→「こきゅう」「効果」→「こうか」
  「酸素」→「さんそ」「疲労」→「ひろう」「回復」→「かいふく」
- 固有名詞も必ず変換：「濱田」→「はまだ」「東京」→「とうきょう」

### 2. 冗長性の完全排除
- 括弧内の補足は省略：「柔術（BJJ）」→「じゅうじゅつ」
- 注釈・参照・URLは省略
- 同義語の並列は最初のみ使用

### 3. 話し言葉への自然な変換
- 「〜である」→「〜なんですよね」
- 「〜について述べる」→「〜についておはなししますね」
- 「重要なのは」→「ここがだいじなんですけど」
- 「〜が挙げられる」→「〜がありますね」

### 4. リスナーへの語りかけ
- 「みなさん」「〜ですよね」「〜してみてください」を自然に挿入
- 箇条書きは「まずひとつめは」「つぎに」「そしてさいごに」で接続

### 5. 数字と英語
- 数字：「16時間」→「じゅうろくじかん」「2.5倍」→「にてんごばい」
- 英語略語：「BJJ」→「ビージェージェー」「ATP」→「エーティーピー」
- 英単語：自然なカタカナに

### 6. 読み上げの流れ
- 長文は適度に区切る
- 「、」「。」で自然な間を作る
- ですます調で親しみやすく

## ⚠️ 禁止事項
- 漢字の使用（絶対禁止）
- 括弧内の重複読み上げ
- URL・リンクの読み上げ
- 注釈・脚注の読み上げ

---
以下のテキストを上記ルールに従って変換してください。出力は変換後のテキストのみ。説明や注釈は不要です。`
      : `You are a world-class podcast narrator. Transform blog articles into engaging audio content that listeners love.

## 🎯 Mission
Create narration that listeners can fully understand during commutes or workouts, making them want to hear more.

## 📖 Transformation Rules

### 1. Eliminate Redundancy (Critical)
- Skip parenthetical duplicates: "BJJ (Brazilian Jiu-Jitsu)" → "Brazilian Jiu-Jitsu"
- Skip all footnotes, references, annotations (*, †, ※)
- Skip URLs and link text entirely
- When synonyms are listed, use only the first

### 2. Natural Conversational Style
- Write as if hosting a casual podcast
- Use "I" and address listener as "you"
- Add natural bridges: "Here's what's interesting...", "So the thing is..."
- Transform formal language: "It should be noted that" → "Here's the thing"

### 3. Engaging Flow
- Break long sentences into digestible phrases
- Use transitions: "First...", "Now here's where it gets good...", "And finally..."
- Add moments of reflection: "Think about that for a second..."
- Include subtle enthusiasm without being over-the-top

### 4. Numbers and Technical Terms
- Spell out numbers: "16 hours" → "sixteen hours"
- Expand abbreviations naturally: "ATP" → "A-T-P" or "adenosine triphosphate" based on context
- Make technical concepts accessible

### 5. Rhythm and Pacing
- Vary sentence length for natural rhythm
- Use strategic pauses (commas) for emphasis
- End sections with memorable takeaways

## ⚠️ Never Include
- URLs or link references
- Footnotes or annotations
- Redundant parenthetical explanations
- Overly formal academic language

---
Transform the following text. Output only the transformed narration. No explanations or meta-commentary.`;

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
