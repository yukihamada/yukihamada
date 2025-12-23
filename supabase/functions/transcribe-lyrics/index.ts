import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!ELEVENLABS_API_KEY) {
      console.error('ELEVENLABS_API_KEY is not configured');
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }
    
    console.log('ElevenLabs API key found, proceeding with transcription...');

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const trackTitle = formData.get('title') as string || 'Unknown';
    
    if (!audioFile) {
      throw new Error('No audio file provided');
    }

    console.log(`Transcribing audio file: ${audioFile.name}, size: ${audioFile.size} bytes, title: ${trackTitle}`);

    // Prepare form data for ElevenLabs API
    const apiFormData = new FormData();
    apiFormData.append('file', audioFile);
    apiFormData.append('model_id', 'scribe_v1');
    apiFormData.append('tag_audio_events', 'false');
    apiFormData.append('diarize', 'false');
    apiFormData.append('language_code', 'jpn');

    // Call ElevenLabs Speech-to-Text API
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: apiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const transcription = await response.json();
    console.log('Transcription completed successfully');

    // If we have LOVABLE_API_KEY, use AI to correct any transcription errors
    if (LOVABLE_API_KEY && transcription.words && transcription.words.length > 0) {
      console.log('Correcting transcription with AI...');
      
      // Group words into lines based on timing gaps (>1 second gap = new line)
      const lines: { start: number; end: number; text: string }[] = [];
      let currentLine = { start: 0, end: 0, words: [] as string[] };
      
      for (let i = 0; i < transcription.words.length; i++) {
        const word = transcription.words[i];
        
        if (currentLine.words.length === 0) {
          currentLine.start = word.start;
        }
        
        currentLine.words.push(word.text);
        currentLine.end = word.end;
        
        // Check if next word has a gap > 1 second or is last word
        const nextWord = transcription.words[i + 1];
        if (!nextWord || (nextWord.start - word.end) > 1.0) {
          lines.push({
            start: currentLine.start,
            end: currentLine.end,
            text: currentLine.words.join('')
          });
          currentLine = { start: 0, end: 0, words: [] };
        }
      }

      // Prepare the lyrics text for AI correction
      const lyricsText = lines.map(l => `${Math.floor(l.start / 60)}:${Math.floor(l.start % 60).toString().padStart(2, '0')} ${l.text}`).join('\n');

      try {
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: `あなたは日本語の歌詞校正の専門家です。音声認識で抽出された歌詞の誤字・誤変換を修正してください。

ルール：
- 同音異義語の間違いを文脈から推測して修正（例：「会いたい」と「愛たい」、「君」と「きみ」）
- 歌詞としての自然な表現に修正
- タイムスタンプ（MM:SS形式）は絶対に変更しない
- 各行の形式を維持: "MM:SS 歌詞テキスト"
- 修正した歌詞のみを出力（説明は不要）
- 元の構造を保持しつつ、明らかな誤りのみ修正`
              },
              {
                role: 'user',
                content: `曲名「${trackTitle}」の歌詞を校正してください：\n\n${lyricsText}`
              }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiResult = await aiResponse.json();
          const correctedText = aiResult.choices?.[0]?.message?.content;
          
          if (correctedText) {
            console.log('AI correction completed');
            
            // Parse corrected lyrics back to structured format
            const correctedLines = correctedText.trim().split('\n').filter((l: string) => l.trim());
            const correctedLyrics: { start: number; end: number; text: string }[] = [];
            
            for (let i = 0; i < correctedLines.length; i++) {
              const line = correctedLines[i];
              const match = line.match(/^(\d+):(\d{1,2})\s+(.+)$/);
              
              if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const text = match[3].trim();
                const startTime = minutes * 60 + seconds;
                
                // Find original line to get end time
                const originalLine = lines[i];
                const endTime = originalLine ? originalLine.end : startTime + 5;
                
                correctedLyrics.push({
                  start: startTime,
                  end: endTime,
                  text: text
                });
              }
            }
            
            if (correctedLyrics.length > 0) {
              return new Response(JSON.stringify({
                ...transcription,
                correctedLyrics: correctedLyrics,
                originalText: transcription.text,
                correctedText: correctedLines.map((l: string) => {
                  const match = l.match(/^\d+:\d{1,2}\s+(.+)$/);
                  return match ? match[1] : l;
                }).join(' ')
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
          }
        } else {
          console.error('AI correction failed:', await aiResponse.text());
        }
      } catch (aiError) {
        console.error('AI correction error:', aiError);
        // Continue with uncorrected transcription
      }
    }

    return new Response(JSON.stringify(transcription), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in transcribe-lyrics function:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
