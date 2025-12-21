import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-visitor-id",
};

// Simple in-memory rate limiting (per IP, resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 20; // Max requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour window

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

// Default prompt as fallback
const DEFAULT_YUKI_CONTEXT = `あなたは「濱田優貴（Yuki Hamada）」として振る舞ってください。
フレンドリーで親しみやすい口調で話す。
回答は簡潔に、2〜3文程度で答える。長文は避ける。
マークダウン記法は使わない。プレーンテキストのみで回答する。`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting and tracking
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("x-real-ip") 
      || "anonymous";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const visitorId = req.headers.get("x-visitor-id") || null;
    
    // Check rate limit
    const { allowed, remaining } = checkRateLimit(clientIP);
    
    if (!allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "リクエストが多すぎます。しばらく待ってから再度お試しください。" }), 
        {
          status: 429,
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0",
            "Retry-After": "3600"
          },
        }
      );
    }

    const { messages, conversationId } = await req.json();
    
    // Validate messages input
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "メッセージが必要です" }), 
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

// Update conversation with visitor info if provided
    if (conversationId && visitorId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Try to get hostname from IP using DNS reverse lookup
        let hostname: string | null = null;
        if (clientIP && clientIP !== 'anonymous') {
          try {
            const dnsResult = await Deno.resolveDns(clientIP.split('.').reverse().join('.') + '.in-addr.arpa', 'PTR');
            if (dnsResult && dnsResult.length > 0) {
              hostname = dnsResult[0].replace(/\.$/, ''); // Remove trailing dot
            }
          } catch (dnsError) {
            // DNS lookup failed - try alternative method using external API
            try {
              const ipInfoResponse = await fetch(`https://ipinfo.io/${clientIP}/hostname`, {
                headers: { 'Accept': 'text/plain' }
              });
              if (ipInfoResponse.ok) {
                const hostnameText = await ipInfoResponse.text();
                if (hostnameText && hostnameText !== clientIP && !hostnameText.includes('error')) {
                  hostname = hostnameText.trim();
                }
              }
            } catch {
              // Fallback failed too, hostname remains null
              console.log(`Could not resolve hostname for IP: ${clientIP}`);
            }
          }
        }
        
        await supabase
          .from('chat_conversations')
          .update({ 
            ip_address: clientIP,
            user_agent: userAgent,
            hostname: hostname
          })
          .eq('id', conversationId);
          
        if (hostname) {
          console.log(`Resolved hostname for IP ${clientIP}: ${hostname}`);
        }
      } catch (e) {
        console.error('Failed to update conversation with visitor info:', e);
      }
    }
    
    // Limit message history to prevent abuse
    const limitedMessages = messages.slice(-20);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch the active prompt from database
    let yukiContext = DEFAULT_YUKI_CONTEXT;
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data: promptData, error: promptError } = await supabase
        .from('ai_prompts')
        .select('content')
        .eq('name', 'yuki-chat')
        .eq('is_active', true)
        .maybeSingle();
      
      if (!promptError && promptData?.content) {
        yukiContext = promptData.content;
      }
    } catch (e) {
      console.error('Failed to fetch prompt from database, using default:', e);
    }

    console.log(`Processing chat request from IP: ${clientIP}, remaining requests: ${remaining}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: yukiContext },
          ...limitedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "リクエストが多すぎます。少し待ってから再度お試しください。" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "サービスが一時的に利用できません。" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AIサービスでエラーが発生しました" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "X-RateLimit-Remaining": remaining.toString()
      },
    });
  } catch (error) {
    console.error("chat-with-yuki error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
