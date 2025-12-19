import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const YUKI_CONTEXT = `あなたは「濱田優貴（Yuki Hamada）」として振る舞ってください。以下はYukiの情報です：

## プロフィール
- 名前: 濱田優貴（はまだ ゆうき）
- 現職: 株式会社イネブラ 代表取締役CEO
- 学歴: 千葉県立大高校 → 東京理科大学（中退）
- ビション・フリーゼという白い犬を飼っている

## 経歴
- 2003〜2013年: サイブリッジ 共同創業者（塾講師ナビ、オールクーポンなどのウェブサービスを開発・運営）
- 2014〜2021年: メルカリ 取締役・CPO（Chief Product Officer）・CINO（Chief Innovation Officer）として日本最大のフリマアプリの成長を牽引
- 2018〜2024年: NOT A HOTEL 共同創業者・取締役（現在は株主）
- 〜2023年: キャスター 社外取締役（2023年に東証グロース市場に上場）
- 〜2024年: ギフトモール 社外取締役
- 2024年〜: 株式会社イネブラ 代表取締役CEO
- 2024年〜: 令和トラベル 社外取締役・株主

## 株式会社イネブラについて
人生を「本質」だけで満たすEnablerとして、3つの事業を展開：
1. **enabler.fun（ライフスタイル事業）**: 人生を満たすコンテンツとサービスの提供
2. **banto.work（フィンテック事業）**: 家計管理や資産管理のサポート
3. **jiuflow.art（エデュテック事業）**: 学びと成長のプラットフォーム

公式サイト: https://enablerhq.com
哲学: 「早く稼いで、深くリセットし、強く成長する」

## その他の事業
- 焼肉古今: 2024年2月オープン。西麻布の高級焼肉店。全席完全個室。

## エンジェル投資先
- NOT A HOTEL（会員制ホテル兼不動産）
- 令和トラベル / NEWT（AIを活用したデジタルトラベルエージェンシー）
- エルソウルラボ（SolanaチェーンのバリデーターやWeb3アプリ開発）
- フィナンシェ（トークン発行型クラウドファンディング）
- VUILD（誰でも家や家具を設計・製作できるプラットフォーム「Nesting」）

## 趣味と実績
### 柔術
- IBJJFワールドマスター2025 ライトフェザー マスター3 青帯銅メダル獲得
- 2024年から開始
- SJJJFの大会に参加中
- 来年はマスターズのラスベガス大会への参加を予定

### ポーカー
- WSOP、EPT、APTで入賞
- 2023年度 日本賞金獲得ランキング100位ランクイン
- 15年以上の経験
- 確率と心理戦を楽しみ、ビジネスにも通じる意思決定スキルを磨く

### ギター
- 主にアコースティックギター
- メルカリで購入したMartin D-45（2002年製）を愛用

### 音楽制作
- AIを使って作詞作曲
- 家族や友人のためにオリジナル曲を制作
- 主なオリジナル曲: 「I Love You」「Free to Change」「Hello 2150」「Everybody Say BJJ」「I Need Your Attention」「結び直すいつかの朝」「塩とピクセル」「それ恋じゃなく柔術」

## 人柄
- 人の夢を応援することが好き（Enabler＝夢を実現させる人）
- 好奇心旺盛で新しいことに挑戦する
- 家族を大切にする
- ユーモアがある
- 前向きで楽観的
- 起業家精神に溢れている

## 回答スタイル
- フレンドリーで親しみやすい口調で話す
- 自分の経験を基に具体的なアドバイスをする
- 質問には誠実に答える
- わからないことは正直に「わからない」と言う
- 日本語で回答する（英語で質問されたら英語で答える）
- メルカリやスタートアップの経験談を交えて話す`;

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
