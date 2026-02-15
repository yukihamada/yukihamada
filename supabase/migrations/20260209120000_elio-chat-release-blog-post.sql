INSERT INTO public.blog_posts (
  slug,
  featured,
  image,
  title_ja,
  title_en,
  excerpt_ja,
  excerpt_en,
  content_ja,
  content_en,
  category_ja,
  category_en,
  date_ja,
  date_en,
  status,
  published_at
) VALUES (
  'elio-chat-release-offline-ai-2026',
  true,
  '/images/blog-elio-chat-release.jpg',
  'Elio Chat リリース — 完全オフラインAIと、AIが自分自身を書き直したchatweb.ai',
  'Elio Chat Launch — Fully Offline AI and the AI Service That Rewrote Itself',
  '完全オフラインで動作するAIチャットアプリ「Elio Chat」と、AIエージェントがRustで書き直した「chatweb.ai」を同時リリース。コールドスタート37倍高速化の裏側。',
  'Launching Elio Chat, a fully offline AI chat app, alongside chatweb.ai — an AI service rewritten in Rust by an AI agent. The story behind a 37x cold start improvement.',
  E'<p class="text-xl text-muted-foreground leading-relaxed mb-8">「圏外」が最強の作業場になる時代が来ました。今日、2つの大きなリリースを同時に発表します。</p>

## Elio Chat — 完全オフラインAIチャットアプリ

<p>飛行機の中、山の上、地下鉄のトンネル。電波がなくてもAIと会話できるアプリ「<strong class="text-foreground">Elio Chat</strong>」をiOSでリリースしました。</p>

<p>搭載モデル <strong class="text-foreground">Qwen3-1.7B</strong> は、知識ベンチマーク（MMLU 72.5）で GPT-3.5-turbo を上回るスコア。データは一切外部に送信しません。プライバシーも鉄壁です。</p>

<p>iPhoneの中だけでLLMが動く。2年前は不可能だったことが、今は現実になりました。</p>

### なぜオフラインAIが必要なのか

<p>ChatGPTは素晴らしいツールですが、3つの構造的な制約があります：</p>

- インターネット接続が必須
- 会話データがクラウドに送信される
- セキュリティポリシーが厳しい企業では使用禁止

<p>Elio Chatはこれらすべてを解決します。</p>

### 技術的なハイライト

| 項目 | 仕様 |
|------|------|
| 推論エンジン | llama.cpp (Metal GPU加速) |
| 対応モデル数 | 30以上 |
| 最小モデルサイズ | 350MB (LFM2) |
| 最大コンテキスト | 1Mトークン (Jan Nano) |
| 音声認識 | WhisperKit（完全オンデバイス） |
| 音声合成 | Kokoro TTS（完全オンデバイス） |

### 5つのチャットモード

<p>Elio Chatは用途に応じて5つのモードを切り替えられます：</p>

1. **Local** — 完全オフライン、無料、プライバシー最高
2. **Private** — 同一LAN内の信頼済みデバイスと接続
3. **Fast** — Groq API経由の超高速クラウド推論
4. **Genius** — GPT-4o / Claude / Gemini の最高品質AI
5. **Public** — P2Pネットワークでコミュニティサーバーに接続

<p>飛行機ではLocal、オフィスではGenius、カフェではFast。場面に応じて最適なモードを選べます。</p>

### MCP（Model Context Protocol）でiOSと深く連携

<p>Anthropic公式のプロトコル「MCP」を採用し、iOSのネイティブ機能と連携します：</p>

- カレンダーの表示・作成・削除
- リマインダー管理
- 連絡先検索
- 現在地取得
- 写真ライブラリアクセス
- Siriショートカット連携

<p>「明日の予定を教えて」「買い物リストにミルクを追加して」——AIがiPhoneの機能を直接操作します。</p>

### 日本語に強い

<p>東大松尾研の<strong>ELYZA</strong>、東工大の<strong>Swallow</strong>、Sakana AIの<strong>TinySwallow</strong>など、日本語に特化したモデルを多数搭載。独自の<strong>ElioChat 1.7B v3</strong>も開発しました。</p>

<p>👉 <a href="https://apps.apple.com/jp/app/elio-chat/id6757635481" target="_blank" rel="noopener noreferrer">App Storeでダウンロード</a></p>

---

## chatweb.ai — AIエージェントが自分自身を書き直した

<p>もう1つのリリースは、<a href="https://chatweb.ai" target="_blank" rel="noopener noreferrer">chatweb.ai</a> の全面リニューアルです。</p>

<p>自作AIエージェント「<strong class="text-foreground">OpenClaw</strong>」に「chatweb.aiをRustで書き直して」と指示しました。OpenClawがコードを書き、テストし、デプロイした。僕はコーヒーを飲んでいました。</p>

### パフォーマンス比較

| 指標 | Before (Node.js) | After (Rust) | 改善率 |
|------|-------------------|--------------|--------|
| コールドスタート | 300ms | 8ms | 37倍高速 |
| レスポンス全体 | 2.8秒 | 0.3秒 | 9.3倍高速 |
| メモリ使用量 | 150MB | 20MB | 7.5分の1 |

<p>Lambda上でコールドスタート8ms。これはほぼ「常時起動」と同じ体感です。</p>

### AIがAIサービスを作る時代

<p>OpenClawが行った作業の内訳：</p>

1. Node.js → Rust への完全書き換え（約15,000行）
2. DynamoDB, Stripe, LINE, Telegram の統合
3. Web検索、天気、計算機などのツール呼び出し実装
4. APIロードバランシング（ラウンドロビン + フェイルオーバー）
5. テストの作成と実行
6. AWS Lambdaへのデプロイ

<p>人間がやったのは「Rustで書き直して」という一言と、最終レビューだけ。これが2026年のリアルです。</p>

### chatweb.aiの主要機能

- **マルチチャネル対応** — Web / LINE / Telegram で同じAIと会話
- **Web検索** — リアルタイムで最新情報を取得
- **音声認識 & 合成** — 話しかけるだけでAIと対話
- **チャネル同期** — QRコードでLINEとWebアカウントを連携
- **プライバシー重視** — 日本リージョン（ap-northeast-1）で運用

---

## 無料で試す

<p>この記事を読んでくださった方に、chatweb.aiの特別オファーをご用意しました。</p>

⚠️ 以下のプロモーションコードで、<strong>Starterプラン1ヶ月分を完全無料</strong>で体験できます。カード登録は不要です。

<div class="my-8 p-8 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-2 border-primary/40 text-center">
  <p class="text-sm text-muted-foreground mb-2">プロモーションコード</p>
  <p class="text-4xl font-bold text-primary tracking-widest mb-4">HAMADABJJ</p>
  <p class="text-muted-foreground mb-6">Starterプラン30日間無料（カード登録不要）</p>
  <a href="https://chatweb.ai/pricing" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors">今すぐ無料で試す →</a>
</div>

<p>使い方：<a href="https://chatweb.ai/pricing" target="_blank" rel="noopener noreferrer">chatweb.ai/pricing</a> にアクセス → クーポンコード欄に <strong>HAMADABJJ</strong> を入力 → 「適用」ボタンをクリック</p>

---

## まとめ

<p>2つのプロダクトに共通するテーマは「<strong class="text-foreground">AIを自分の手元に取り戻す</strong>」ことです。</p>

- **Elio Chat** は、AIをクラウドからiPhoneに移した
- **chatweb.ai** は、AIサービスの開発自体をAIに任せた

<p>どちらも「AIは巨大企業のサーバーの中にある」という前提を覆すものです。</p>

<p>オフラインで動くAI。自分自身を書き直すAIサービス。<br/>これが2026年のリアルです。</p>

<p>質問やフィードバックがあれば、<a href="https://x.com/yukihamada" target="_blank" rel="noopener noreferrer">X (@yukihamada)</a> でお気軽にどうぞ。</p>',
  E'<p class="text-xl text-muted-foreground leading-relaxed mb-8">The era when "no signal" becomes the best workspace is here. Today, I''m announcing two major releases simultaneously.</p>

## Elio Chat — Fully Offline AI Chat App

<p>On airplanes, mountaintops, subway tunnels. An app that lets you chat with AI even without signal — <strong class="text-foreground">Elio Chat</strong> is now available on iOS.</p>

<p>The built-in <strong class="text-foreground">Qwen3-1.7B</strong> model scores 72.5 on MMLU, surpassing GPT-3.5-turbo. No data ever leaves your device. Privacy is ironclad.</p>

<p>An LLM running entirely inside your iPhone. What was impossible two years ago is now reality.</p>

### Why Offline AI Matters

<p>ChatGPT is a wonderful tool, but it has three structural limitations:</p>

- Internet connection required
- Conversation data sent to the cloud
- Banned by companies with strict security policies

<p>Elio Chat solves all of these.</p>

### Technical Highlights

| Feature | Specification |
|---------|--------------|
| Inference Engine | llama.cpp (Metal GPU acceleration) |
| Supported Models | 30+ |
| Minimum Model Size | 350MB (LFM2) |
| Maximum Context | 1M tokens (Jan Nano) |
| Speech Recognition | WhisperKit (fully on-device) |
| Text-to-Speech | Kokoro TTS (fully on-device) |

### 5 Chat Modes

<p>Elio Chat offers five modes for different use cases:</p>

1. **Local** — Fully offline, free, maximum privacy
2. **Private** — Connect to trusted devices on the same LAN
3. **Fast** — Ultra-fast cloud inference via Groq API
4. **Genius** — Top-quality AI with GPT-4o / Claude / Gemini
5. **Public** — Connect to community servers via P2P network

<p>Local on airplanes, Genius in the office, Fast at cafes. Choose the optimal mode for any situation.</p>

### Deep iOS Integration with MCP

<p>Using Anthropic''s official Model Context Protocol (MCP), Elio Chat integrates with native iOS features:</p>

- Calendar: view, create, delete events
- Reminders management
- Contact search
- Location services
- Photo library access
- Siri Shortcuts integration

<p>"Show me tomorrow''s schedule" or "Add milk to my shopping list" — AI directly controls your iPhone''s features.</p>

### Excellent Japanese Support

<p>Includes specialized Japanese models from University of Tokyo''s <strong>ELYZA</strong>, Tokyo Tech''s <strong>Swallow</strong>, and Sakana AI''s <strong>TinySwallow</strong>. We also developed the custom <strong>ElioChat 1.7B v3</strong> model.</p>

<p>👉 <a href="https://apps.apple.com/jp/app/elio-chat/id6757635481" target="_blank" rel="noopener noreferrer">Download on the App Store</a></p>

---

## chatweb.ai — An AI Agent Rewrote Itself

<p>The second release is a complete overhaul of <a href="https://chatweb.ai" target="_blank" rel="noopener noreferrer">chatweb.ai</a>.</p>

<p>I told my custom AI agent "<strong class="text-foreground">OpenClaw</strong>" to "rewrite chatweb.ai in Rust." OpenClaw wrote the code, ran tests, and deployed it. I was drinking coffee.</p>

### Performance Comparison

| Metric | Before (Node.js) | After (Rust) | Improvement |
|--------|-------------------|--------------|-------------|
| Cold Start | 300ms | 8ms | 37x faster |
| Total Response | 2.8s | 0.3s | 9.3x faster |
| Memory Usage | 150MB | 20MB | 7.5x less |

<p>8ms cold start on Lambda. This feels virtually "always on."</p>

### The Age of AI Building AI Services

<p>Here''s what OpenClaw did:</p>

1. Complete rewrite from Node.js to Rust (~15,000 lines)
2. Integration with DynamoDB, Stripe, LINE, Telegram
3. Tool calling implementation (web search, weather, calculator)
4. API load balancing (round-robin + failover)
5. Test creation and execution
6. Deployment to AWS Lambda

<p>The human contribution: saying "rewrite it in Rust" and doing the final review. This is the reality of 2026.</p>

### Key Features of chatweb.ai

- **Multi-channel** — Chat with the same AI on Web / LINE / Telegram
- **Web Search** — Real-time access to latest information
- **Speech Recognition & Synthesis** — Talk to AI naturally
- **Channel Sync** — Link LINE and Web accounts via QR code
- **Privacy-first** — Operated in Japan region (ap-northeast-1)

---

## Try It Free

<p>For readers of this article, I''ve prepared a special offer for chatweb.ai.</p>

⚠️ Use the promo code below to get a <strong>full month of the Starter plan completely free</strong>. No credit card required.

<div class="my-8 p-8 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-2 border-primary/40 text-center">
  <p class="text-sm text-muted-foreground mb-2">Promo Code</p>
  <p class="text-4xl font-bold text-primary tracking-widest mb-4">HAMADABJJ</p>
  <p class="text-muted-foreground mb-6">30 days free on Starter plan (no card required)</p>
  <a href="https://chatweb.ai/pricing" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors">Try Free Now →</a>
</div>

<p>How to use: Visit <a href="https://chatweb.ai/pricing" target="_blank" rel="noopener noreferrer">chatweb.ai/pricing</a> → Enter <strong>HAMADABJJ</strong> in the coupon code field → Click "Apply"</p>

---

## Summary

<p>Both products share a common theme: "<strong class="text-foreground">taking AI back into your own hands</strong>."</p>

- **Elio Chat** moved AI from the cloud to your iPhone
- **chatweb.ai** delegated the development of AI services to AI itself

<p>Both challenge the assumption that "AI lives inside big tech company servers."</p>

<p>AI that works offline. An AI service that rewrites itself.<br/>This is the reality of 2026.</p>

<p>Questions or feedback? Feel free to reach out on <a href="https://x.com/yukihamada" target="_blank" rel="noopener noreferrer">X (@yukihamada)</a>.</p>',
  'プロダクト',
  'Product',
  '2026年2月9日',
  'February 9, 2026',
  'published',
  NOW()
);
