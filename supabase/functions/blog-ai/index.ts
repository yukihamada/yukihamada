import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, postSlug, content, title, category, forceRegenerate } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'summarize') {
      // Check cache first (unless force regenerate)
      if (!forceRegenerate) {
        const { data: cached } = await supabase
          .from('blog_summaries')
          .select('summary_ja, summary_en')
          .eq('post_slug', postSlug)
          .single();

        if (cached) {
          console.log('Returning cached summary for:', postSlug);
          return new Response(JSON.stringify({
            summary_ja: cached.summary_ja,
            summary_en: cached.summary_en,
            cached: true
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } else {
        // Delete existing cache
        await supabase
          .from('blog_summaries')
          .delete()
          .eq('post_slug', postSlug);
        console.log('Cleared cache for:', postSlug);
      }

      // Generate new summary
      console.log('Generating new summary for:', postSlug);
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that summarizes blog articles. Provide concise, informative summaries that capture the key points. Return a JSON object with 'summary_ja' (Japanese) and 'summary_en' (English) fields. Each summary should be 2-3 sentences."
            },
            {
              role: "user",
              content: `Please summarize this blog article:\n\nTitle: ${title}\nCategory: ${category}\n\nContent:\n${content}\n\nReturn as JSON: {"summary_ja": "...", "summary_en": "..."}`
            }
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || '';
      
      // Parse JSON from response
      let summaries;
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          summaries = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", aiResponse);
        summaries = {
          summary_ja: "要約の生成に失敗しました。",
          summary_en: "Failed to generate summary."
        };
      }

      // Cache the result
      await supabase
        .from('blog_summaries')
        .upsert({
          post_slug: postSlug,
          summary_ja: summaries.summary_ja,
          summary_en: summaries.summary_en,
          updated_at: new Date().toISOString()
        });

      return new Response(JSON.stringify({
        summary_ja: summaries.summary_ja,
        summary_en: summaries.summary_en,
        cached: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'questions') {
      // Check cache first (unless force regenerate)
      if (!forceRegenerate) {
        const { data: cached } = await supabase
          .from('blog_suggested_questions')
          .select('questions_ja, questions_en')
          .eq('post_slug', postSlug)
          .single();

        if (cached) {
          console.log('Returning cached questions for:', postSlug);
          return new Response(JSON.stringify({
            questions_ja: cached.questions_ja,
            questions_en: cached.questions_en,
            cached: true
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } else {
        // Delete existing cache
        await supabase
          .from('blog_suggested_questions')
          .delete()
          .eq('post_slug', postSlug);
        console.log('Cleared questions cache for:', postSlug);
      }

      // Generate new questions
      console.log('Generating new questions for:', postSlug);
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that generates thoughtful questions about blog articles. Generate 4 relevant questions that readers might want to ask about the article. Return a JSON object with 'questions_ja' (array of Japanese questions) and 'questions_en' (array of English questions)."
            },
            {
              role: "user",
              content: `Generate 4 thoughtful questions for this blog article:\n\nTitle: ${title}\nCategory: ${category}\n\nContent:\n${content}\n\nReturn as JSON: {"questions_ja": ["...", "..."], "questions_en": ["...", "..."]}`
            }
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || '';
      
      // Parse JSON from response
      let questions;
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", aiResponse);
        questions = {
          questions_ja: ["この記事について質問があります", "もっと詳しく教えてください"],
          questions_en: ["I have a question about this article", "Can you tell me more?"]
        };
      }

      // Cache the result
      await supabase
        .from('blog_suggested_questions')
        .upsert({
          post_slug: postSlug,
          questions_ja: questions.questions_ja,
          questions_en: questions.questions_en,
          updated_at: new Date().toISOString()
        });

      return new Response(JSON.stringify({
        questions_ja: questions.questions_ja,
        questions_en: questions.questions_en,
        cached: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in blog-ai function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
