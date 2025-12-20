import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Blog posts data for OGP
const blogPosts: Record<string, { title: string; excerpt: string; image: string; date: string; category: string }> = {
  '2025-12-20-sinic': {
    title: '【衝撃】55年前の予言が的中。オムロン「サイニック理論」が示す、AIの次の未来',
    excerpt: 'サイニック理論が示す社会の方向性と限界費用ゼロ社会が示す経済のメカニズム。この2つを組み合わせると、未来の解像度が劇的に上がります。',
    image: '/images/blog-sinic-theory.jpg',
    date: '2025-12-20',
    category: '未来予測',
  },
  '2025-12-20': {
    title: 'JiuFlowを作った話：AI開発で変わるサービス開発の形',
    excerpt: '柔術の動画共有サイト「JiuFlow」をAIで開発。20年のウェブ開発経験から見たAI開発の革命、月10万円超えのコスト、そしてオープンソースモデルによる同質化の課題について。',
    image: '/images/blog-jiuflow.jpg',
    date: '2025-12-20',
    category: 'プロダクト開発',
  },
  '2025-12-19': {
    title: 'Lovable.devでyukihamada.jpをリニューアル：ノーコードAI開発の真価',
    excerpt: 'Lovable.devを使ってサイトを完全リニューアル。Claude Codeよりもウェブに特化し、チームでの更新も簡単、環境設定不要でバックエンドも自動構築。',
    image: '/images/blog-lovable.jpg',
    date: '2025-12-19',
    category: '開発ツール',
  },
  '2025-12-18': {
    title: 'AIエコーチェンバーの危険性：自分の分身に囲まれる未来',
    excerpt: 'AIが自分に寄り添いすぎることで、エコーチェンバーに陥るリスクについて。偏った情報空間から抜け出すための対策を考えます。',
    image: '/images/blog-echo-chamber.jpg',
    date: '2025-12-18',
    category: 'AI論考',
  },
  '2025-12-17': {
    title: 'AIは「人間」を必要としている：ChatGPT o1 proとの対話から見えた真実',
    excerpt: 'ChatGPT o1 proとの深い対話を通じて見えてきた、AIと人間の関係性。AIは人間を置き換えるのではなく、人間と共に成長していく存在だという気づき。',
    image: '/images/blog-ai-human.jpg',
    date: '2025-12-17',
    category: 'AI論考',
  },
  '2025-12-15': {
    title: 'Claude vs ChatGPT: AIモデルの使い分け術',
    excerpt: 'ClaudeとChatGPTの特性を理解し、用途に応じて使い分けることで、AIの力を最大限に引き出す方法を解説します。',
    image: '/images/blog-claude.jpg',
    date: '2025-12-15',
    category: 'AI活用',
  },
  '2025-12-14-music': {
    title: '音楽を作る理由：AIと共に創造する喜び',
    excerpt: 'Sunoを使って音楽を作り始めた理由と、AI時代における創造性について。人間らしさとは何かを音楽を通じて探求します。',
    image: '/images/blog-voice.jpg',
    date: '2025-12-14',
    category: '音楽・創作',
  },
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    
    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'slug parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const post = blogPosts[slug];
    const baseUrl = 'https://yukihamada.jp';
    
    if (!post) {
      // Return default OGP for unknown posts
      return new Response(
        JSON.stringify({
          title: 'Yuki Hamada - イノベーター・起業家・コミュニティビルダー',
          description: '濱田優貴 - イネブラ創業者、エンジェル投資家。世界中のクリエイターを支援し、新しい価値を生み出すコミュニティを構築。',
          image: `${baseUrl}/images/default-ogp.jpg`,
          url: baseUrl,
          type: 'website',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const postUrl = `${baseUrl}/blog/${slug}`;
    const imageUrl = post.image.startsWith('http') ? post.image : `${baseUrl}${post.image}`;

    const ogData = {
      title: post.title,
      description: post.excerpt,
      image: imageUrl,
      url: postUrl,
      type: 'article',
      publishedTime: post.date,
      section: post.category,
      siteName: 'Yuki Hamada',
      twitterCard: 'summary_large_image',
      twitterSite: '@yukihamada',
    };

    return new Response(
      JSON.stringify(ogData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
