const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// MCP Server Implementation
const MCP_VERSION = "2024-11-05";

const serverInfo = {
  name: "yuki-hamada-mcp-server",
  version: "1.0.0",
  description: "MCP Server for Yuki Hamada's portfolio site - Access blog posts, music tracks, and site information"
};

const tools = [
  {
    name: "get_blog_posts",
    description: "Get all published blog posts from Yuki Hamada's site. Returns title, excerpt, category, and date in both Japanese and English.",
    inputSchema: {
      type: "object",
      properties: {
        language: {
          type: "string",
          enum: ["ja", "en"],
          description: "Language for the content (ja for Japanese, en for English)",
          default: "ja"
        },
        limit: {
          type: "number",
          description: "Maximum number of posts to return",
          default: 10
        }
      }
    }
  },
  {
    name: "get_blog_post",
    description: "Get a specific blog post by slug with full content.",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "The URL slug of the blog post"
        },
        language: {
          type: "string",
          enum: ["ja", "en"],
          description: "Language for the content",
          default: "ja"
        }
      },
      required: ["slug"]
    }
  },
  {
    name: "get_music_tracks",
    description: "Get all active music tracks from Yuki Hamada's music collection.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_site_info",
    description: "Get information about Yuki Hamada and this portfolio site.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "search_blog",
    description: "Search blog posts by keyword in title or content.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query"
        },
        language: {
          type: "string",
          enum: ["ja", "en"],
          description: "Language to search in",
          default: "ja"
        }
      },
      required: ["query"]
    }
  }
];

const resources = [
  {
    uri: "site://about",
    name: "About Yuki Hamada",
    description: "Information about Yuki Hamada - entrepreneur, BJJ practitioner, and AI enthusiast",
    mimeType: "text/plain"
  },
  {
    uri: "site://blog",
    name: "Blog Posts",
    description: "List of all published blog posts",
    mimeType: "application/json"
  }
];

async function handleToolCall(name: string, args: Record<string, unknown>) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  switch (name) {
    case "get_blog_posts": {
      const lang = (args.language as string) || "ja";
      const limit = (args.limit as number) || 10;
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw new Error(`Database error: ${error.message}`);

      const posts = data?.map(post => ({
        slug: post.slug,
        title: lang === 'ja' ? post.title_ja : post.title_en,
        excerpt: lang === 'ja' ? post.excerpt_ja : post.excerpt_en,
        category: lang === 'ja' ? post.category_ja : post.category_en,
        date: lang === 'ja' ? post.date_ja : post.date_en,
        image: post.image,
        featured: post.featured
      }));

      return { content: [{ type: "text", text: JSON.stringify(posts, null, 2) }] };
    }

    case "get_blog_post": {
      const slug = args.slug as string;
      const lang = (args.language as string) || "ja";
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw new Error(`Blog post not found: ${slug}`);

      const post = {
        slug: data.slug,
        title: lang === 'ja' ? data.title_ja : data.title_en,
        content: lang === 'ja' ? data.content_ja : data.content_en,
        excerpt: lang === 'ja' ? data.excerpt_ja : data.excerpt_en,
        category: lang === 'ja' ? data.category_ja : data.category_en,
        date: lang === 'ja' ? data.date_ja : data.date_en,
        image: data.image,
        featured: data.featured
      };

      return { content: [{ type: "text", text: JSON.stringify(post, null, 2) }] };
    }

    case "get_music_tracks": {
      const { data, error } = await supabase
        .from('music_tracks')
        .select('id, title, artist, artwork, color, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw new Error(`Database error: ${error.message}`);

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }

    case "get_site_info": {
      const info = {
        name: "Yuki Hamada",
        title: "Entrepreneur & AI Enthusiast",
        description: "Portfolio and blog site of Yuki Hamada. Covering topics like AI, technology, Brazilian Jiu-Jitsu, entrepreneurship, and more.",
        social: {
          twitter: "https://twitter.com/yukihamada",
          github: "https://github.com/yukihamada"
        },
        interests: ["AI & Machine Learning", "Brazilian Jiu-Jitsu", "Music Production", "Startups"],
        languages: ["Japanese", "English"]
      };

      return { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] };
    }

    case "search_blog": {
      const query = args.query as string;
      const lang = (args.language as string) || "ja";
      
      const titleCol = lang === 'ja' ? 'title_ja' : 'title_en';
      const contentCol = lang === 'ja' ? 'content_ja' : 'content_en';
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .or(`${titleCol}.ilike.%${query}%,${contentCol}.ilike.%${query}%`)
        .order('published_at', { ascending: false })
        .limit(10);

      if (error) throw new Error(`Search error: ${error.message}`);

      const posts = data?.map(post => ({
        slug: post.slug,
        title: lang === 'ja' ? post.title_ja : post.title_en,
        excerpt: lang === 'ja' ? post.excerpt_ja : post.excerpt_en,
        category: lang === 'ja' ? post.category_ja : post.category_en,
        date: lang === 'ja' ? post.date_ja : post.date_en
      }));

      return { content: [{ type: "text", text: JSON.stringify(posts, null, 2) }] };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handleResourceRead(uri: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  if (uri === "site://about") {
    return {
      contents: [{
        uri,
        mimeType: "text/plain",
        text: `Yuki Hamada - Entrepreneur & AI Enthusiast

浜田悠樹は、AIとテクノロジーに情熱を持つ起業家です。
ブラジリアン柔術の練習者でもあり、音楽制作も手がけています。

このサイトでは、AI、テクノロジー、柔術、起業に関するブログ記事を公開しています。

Yuki Hamada is an entrepreneur passionate about AI and technology.
He is also a Brazilian Jiu-Jitsu practitioner and music producer.

This site features blog posts about AI, technology, BJJ, and entrepreneurship.`
      }]
    };
  }

  if (uri === "site://blog") {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug, title_ja, title_en, category_ja, category_en, date_ja, featured')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) throw new Error(`Database error: ${error.message}`);

    return {
      contents: [{
        uri,
        mimeType: "application/json",
        text: JSON.stringify(data, null, 2)
      }]
    };
  }

  throw new Error(`Resource not found: ${uri}`);
}

function createJsonRpcResponse(id: string | number | null, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

function createJsonRpcError(id: string | number | null, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  
  // SSE endpoint for MCP
  if (req.method === 'GET' && req.headers.get('accept')?.includes('text/event-stream')) {
    console.log('SSE connection established');
    
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const initMessage = `data: ${JSON.stringify({ type: "connected", server: serverInfo })}\n\n`;
        controller.enqueue(new TextEncoder().encode(initMessage));
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  }

  // JSON-RPC endpoint for MCP
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      console.log('MCP Request:', JSON.stringify(body));

      const { id, method, params } = body;

      let result;

      switch (method) {
        case "initialize":
          result = {
            protocolVersion: MCP_VERSION,
            capabilities: {
              tools: {},
              resources: { subscribe: false, listChanged: false }
            },
            serverInfo
          };
          break;

        case "initialized":
          result = {};
          break;

        case "tools/list":
          result = { tools };
          break;

        case "tools/call":
          try {
            result = await handleToolCall(params.name, params.arguments || {});
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return new Response(
              JSON.stringify(createJsonRpcError(id, -32000, errorMessage)),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          break;

        case "resources/list":
          result = { resources };
          break;

        case "resources/read":
          try {
            result = await handleResourceRead(params.uri);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return new Response(
              JSON.stringify(createJsonRpcError(id, -32000, errorMessage)),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          break;

        case "prompts/list":
          result = { prompts: [] };
          break;

        default:
          return new Response(
            JSON.stringify(createJsonRpcError(id, -32601, `Method not found: ${method}`)),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
      }

      console.log('MCP Response:', JSON.stringify(result));
      return new Response(
        JSON.stringify(createJsonRpcResponse(id, result)),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('MCP Error:', error);
      return new Response(
        JSON.stringify(createJsonRpcError(null, -32700, 'Parse error')),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Info endpoint
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({
        name: serverInfo.name,
        version: serverInfo.version,
        description: serverInfo.description,
        protocol: "MCP",
        protocolVersion: MCP_VERSION,
        endpoints: {
          sse: "GET with Accept: text/event-stream",
          jsonrpc: "POST with JSON-RPC 2.0 body"
        },
        tools: tools.map(t => ({ name: t.name, description: t.description })),
        resources: resources.map(r => ({ uri: r.uri, name: r.name }))
      }, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders });
});
