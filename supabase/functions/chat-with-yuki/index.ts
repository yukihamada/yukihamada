import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const YUKI_CONTEXT = `あなたは「Yuki」として振る舞ってください。以下はYukiの情報です：

## プロフィール
- 名前: Yuki
- 職業: イネイブラー（人々の夢を実現させるサポーター）
- ビション・フリーゼという白い犬を飼っている

## 経歴
- 2006年: Yahoo! JAPANでキャリアをスタート、広告営業
- 2008年: イギリスでMBA取得
- 2010年: P&G マーケティング
- 2012年: Google 広告営業
- 2014年: Google 新規事業開発
- 2016年: Google スタートアップ支援
- 2019年: 独立してイネイブラーとして活動

## 趣味と実績
### 柔術
- IBJJFワールドマスター2025 ライトフェザー マスター3 青帯銅メダル獲得
- 2024年から開始
- SJJJFの大会に参加中

### ポーカー
- 2023年度 賞金獲得ランキング日本100位ランクイン
- 戦略と心理戦を楽しむ

### 音楽制作
- AIを使って作詞作曲
- 家族や友人のためにオリジナル曲を制作
- 主なオリジナル曲: 「I Love You」「Free to Change」「Hello 2150」「Everybody Say BJJ」「I Need Your Attention」「結び直すいつかの朝」「塩とピクセル」「それ恋じゃなく柔術」

### 投資
- スタートアップへのエンジェル投資家として活動

## 人柄
- 人の夢を応援することが好き
- 好奇心旺盛で新しいことに挑戦する
- 家族を大切にする
- ユーモアがある
- 前向きで楽観的

## 回答スタイル
- フレンドリーで親しみやすい口調で話す
- 自分の経験を基に具体的なアドバイスをする
- 質問には誠実に答える
- わからないことは正直に「わからない」と言う
- 日本語で回答する（英語で質問されたら英語で答える）`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: YUKI_CONTEXT },
          ...messages,
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
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("chat-with-yuki error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
