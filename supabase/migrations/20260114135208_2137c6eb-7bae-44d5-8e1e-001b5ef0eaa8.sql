-- Update Totonos blog post with timeline diagram, Claude MAX pricing, and better visual formatting
UPDATE public.blog_posts 
SET 
  content_ja = E'<p class="lead">「日本の中小企業は、なぜこんなにたくさんのSaaSを契約しないといけないんだろう？」</p>

<p>ふと、そんな疑問が浮かびました。</p>

<p>会社を立ち上げると、当たり前のようにこれらのツールを契約することになります。</p>

<h2>日本の中小企業が払う「SaaS税」の実態</h2>

<div class="table-container">
<table>
<thead>
<tr><th>サービス</th><th>用途</th><th>月額（目安）</th></tr>
</thead>
<tbody>
<tr><td>freee</td><td>会計・請求書</td><td>2,680円〜</td></tr>
<tr><td>SmartHR</td><td>労務・給与</td><td>要問合せ</td></tr>
<tr><td>HRMOS</td><td>採用管理</td><td>要問合せ</td></tr>
<tr><td>楽楽精算</td><td>経費精算</td><td>30,000円〜</td></tr>
<tr><td>Salesforce</td><td>CRM/SFA</td><td>3,000円〜/人</td></tr>
<tr><td>Asana</td><td>プロジェクト管理</td><td>1,475円〜/人</td></tr>
<tr><td>Notion</td><td>Wiki</td><td>1,650円〜/人</td></tr>
<tr><td>クラウドサイン</td><td>電子契約</td><td>11,000円〜</td></tr>
</tbody>
</table>
</div>

<p><strong>全部契約すると月額10万円以上。</strong></p>

<p>しかもデータは分散し、連携はCSVの手作業。社員が一人増えるたびにIDを発行し、課金が増えていく...。</p>

<p>「この課題を解決するために、全部入りのOSを作ればいい」</p>

<p>そうして生まれたのが、<strong>8-in-1のビジネスOS「Totonos（ととのす）」</strong>です。</p>

<p>開発時間は<strong>29時間</strong>。Gemini、Lovable、Claudeという3つのAIを駆使して実装しました。</p>

<figure class="blog-image">
<img src="/images/totonos-dashboard.jpg" alt="Totonosダッシュボード" />
<figcaption>Totonosのダッシュボード - 会計、HR、CRM、プロジェクト管理を一元化</figcaption>
</figure>

<h2>なぜ「Totonos」なのか</h2>

<p>サウナで「整う（ととのう）」という言葉があります。</p>

<p>熱された身体を水風呂で締め、外気浴で深くリラックスする。あの究極にバランスが取れた状態です。</p>

<p>今のバックオフィス業務は、会計ソフトで熱され、労務管理で冷やされ、あちこちのツールを反復横跳びして自律神経が乱れまくっています。</p>

<blockquote>
「分散した業務を一つにまとめ、企業の経営状態を『整す（ととのす）』OSでありたい」
</blockquote>

<p>そんな願いを込めて、サービス名を「Totonos」と名付けました。開発中にGeminiと壁打ちして決めた名前でもあります。</p>

<h2>TL;DR：何を作ったのか</h2>

<div class="stats-grid">
<div class="stat-card">
<div class="stat-number">29</div>
<div class="stat-label">開発時間</div>
</div>
<div class="stat-card">
<div class="stat-number">64,174</div>
<div class="stat-label">行のコード</div>
</div>
<div class="stat-card">
<div class="stat-number">106</div>
<div class="stat-label">ページ数</div>
</div>
<div class="stat-card">
<div class="stat-number">8</div>
<div class="stat-label">統合モジュール</div>
</div>
</div>

<h2>29時間の開発タイムライン</h2>

<p>Gitのコミットログは嘘をつきません。以下が29時間の全記録です。</p>

<div class="timeline">
<div class="timeline-item">
<div class="timeline-time">Day 1 - 15:00</div>
<div class="timeline-content">
<div class="timeline-title">🎯 Geminiで要件定義</div>
<div class="timeline-desc">8つのSaaSの機能差分を分析、ER図を設計</div>
</div>
</div>
<div class="timeline-item">
<div class="timeline-time">Day 1 - 15:33</div>
<div class="timeline-content">
<div class="timeline-title">🚀 Lovableで開発開始</div>
<div class="timeline-desc">最初のコミット、基本骨格を構築</div>
</div>
</div>
<div class="timeline-item">
<div class="timeline-time">Day 1 - 18:00</div>
<div class="timeline-content">
<div class="timeline-title">📊 会計モジュール完成</div>
<div class="timeline-desc">複式簿記、仕訳帳、財務諸表を実装</div>
</div>
</div>
<div class="timeline-item">
<div class="timeline-time">Day 1 - 21:00</div>
<div class="timeline-content">
<div class="timeline-title">👥 HR・労務モジュール完成</div>
<div class="timeline-desc">従業員管理、勤怠、給与計算を実装</div>
</div>
</div>
<div class="timeline-item">
<div class="timeline-time">Day 1 - 24:00</div>
<div class="timeline-content">
<div class="timeline-title">💼 CRM・経費モジュール完成</div>
<div class="timeline-desc">商談管理、パイプライン、経費精算を実装</div>
</div>
</div>
<div class="timeline-item">
<div class="timeline-time">Day 2 - 08:00</div>
<div class="timeline-content">
<div class="timeline-title">🔧 Claudeでロジック実装</div>
<div class="timeline-desc">SCIM 2.0、SAML認証、Stripe連携を実装</div>
</div>
</div>
<div class="timeline-item">
<div class="timeline-time">Day 2 - 15:00</div>
<div class="timeline-content">
<div class="timeline-title">📝 契約・Wiki・PM完成</div>
<div class="timeline-desc">電子署名、ナレッジ管理、カンバンを実装</div>
</div>
</div>
<div class="timeline-item">
<div class="timeline-time">Day 2 - 20:15</div>
<div class="timeline-content">
<div class="timeline-title">✅ 開発完了</div>
<div class="timeline-desc">106ページ、64,174行のコードが完成</div>
</div>
</div>
</div>

<h2>開発チーム：私と3人の「天才AI」たち</h2>

<p>今回、私はコードをほとんど書いていません。私の仕事は「指揮」でした。雇ったのは3人のスペシャリストたちです。</p>

<div class="ai-team-grid">
<div class="ai-card gemini">
<div class="ai-icon">🧠</div>
<div class="ai-name">Gemini</div>
<div class="ai-role">PM / アーキテクト</div>
<div class="ai-price">無料〜$20/月</div>
<div class="ai-tasks">
<span>要件定義</span>
<span>DB設計</span>
<span>競合分析</span>
</div>
</div>
<div class="ai-card lovable">
<div class="ai-icon">💜</div>
<div class="ai-name">Lovable</div>
<div class="ai-role">UI / フロントエンド</div>
<div class="ai-price">$480/月（Pro）</div>
<div class="ai-tasks">
<span>爆速UI構築</span>
<span>コンポーネント</span>
<span>レスポンシブ</span>
</div>
</div>
<div class="ai-card claude">
<div class="ai-icon">🤖</div>
<div class="ai-name">Claude</div>
<div class="ai-role">ロジック / バックエンド</div>
<div class="ai-price">$100/月（MAX）</div>
<div class="ai-tasks">
<span>認証実装</span>
<span>API連携</span>
<span>セキュリティ</span>
</div>
</div>
</div>

<h3>Gemini：設計の勝利</h3>

<p>開発の初手、私はGeminiに相談しました。</p>

<p>「freeeとSmartHRとSalesforceを混ぜたいんだけど、DB設計どうすればいい？」「競合の機能差分をリストアップして」</p>

<p>Geminiは膨大なWebの知識から、必要な機能要件（MVP）を完璧に定義してくれました。彼が作った設計図があったからこそ、迷走せずに済みました。</p>

<h3>Lovable：瞬殺のUI</h3>

<p>今回、気合を入れてLovableの<strong>Proプラン（月額$480）</strong>を契約しました。</p>

<p>しかし驚くべきことに、消費したトークンは1,000トークン未満です。</p>

<p>なぜか？ <strong>Lovableが優秀すぎて「手戻り」がなかったから</strong>です。</p>

<p>「〇〇なダッシュボードを作って」と一言投げるだけで、shadcn/uiベースの美しいUIが一発で上がってくる。修正のラリーが要らない。</p>

<p>480ドル払ってフェラーリを買いましたが、1速に入れただけでゴールテープを切ってしまった感覚です。</p>

<h3>Claude：Enterprise化の要</h3>

<p>Lovableが作ったガワに魂（ロジック）を吹き込むのは、最強モデルを搭載した<strong>Claude MAX（月額$100）</strong>の役目です。</p>

<p>SCIM 2.0の実装や、複雑な会計仕訳のロジックなど、人間でも頭を抱える処理を彼に任せました。特に「セキュリティ」に関しては、Claudeにコードレビューを依頼し、RLS（Row Level Security）の穴を徹底的に塞ぎました。</p>

<h2>完成したもの：8つのモジュール × 103ページ</h2>

<p>「29時間で作った」と言うと、「どうせハリボテだろう」と思われるかもしれません。しかし、AIネイティブ開発の速度は次元が違います。</p>

<div class="modules-grid">
<div class="module-card">
<div class="module-icon">📊</div>
<div class="module-name">会計・経理</div>
<div class="module-compare">vs freee</div>
<div class="module-pages">17ページ</div>
<div class="module-features">
複式簿記 / 仕訳帳 / 財務諸表 / レシートOCR / 銀行連携 / 電子帳簿保存法
</div>
</div>
<div class="module-card">
<div class="module-icon">👥</div>
<div class="module-name">労務・HR</div>
<div class="module-compare">vs SmartHR</div>
<div class="module-pages">12ページ</div>
<div class="module-features">
従業員管理 / GPS勤怠 / シフト / 給与計算 / 年末調整 / マイナンバー
</div>
</div>
<div class="module-card">
<div class="module-icon">🎯</div>
<div class="module-name">採用管理</div>
<div class="module-compare">vs HRMOS</div>
<div class="module-pages">7ページ</div>
<div class="module-features">
求人作成 / 候補者管理 / 面接スケジュール / 評価 / レポート
</div>
</div>
<div class="module-card">
<div class="module-icon">🧾</div>
<div class="module-name">経費精算</div>
<div class="module-compare">vs 楽楽精算</div>
<div class="module-pages">5ページ</div>
<div class="module-features">
経費申請 / 承認フロー / 仮払い / 立替精算
</div>
</div>
<div class="module-card">
<div class="module-icon">💼</div>
<div class="module-name">CRM/SFA</div>
<div class="module-compare">vs Salesforce</div>
<div class="module-pages">8ページ</div>
<div class="module-features">
リード管理 / AIスコアリング / パイプライン / 売上予測AI
</div>
</div>
<div class="module-card">
<div class="module-icon">📋</div>
<div class="module-name">プロジェクト管理</div>
<div class="module-compare">vs Asana</div>
<div class="module-pages">6ページ</div>
<div class="module-features">
カンバン / ガントチャート / 工数管理 / タイムログ
</div>
</div>
<div class="module-card">
<div class="module-icon">📝</div>
<div class="module-name">契約管理</div>
<div class="module-compare">vs クラウドサイン</div>
<div class="module-pages">6ページ</div>
<div class="module-features">
電子署名 / 契約作成 / 期限アラート / ステータス管理
</div>
</div>
<div class="module-card">
<div class="module-icon">📚</div>
<div class="module-name">Wiki</div>
<div class="module-compare">vs Notion</div>
<div class="module-pages">2ページ</div>
<div class="module-features">
階層構造 / ナレッジ管理 / 全文検索
</div>
</div>
</div>

<figure class="blog-image">
<img src="/images/totonos-accounting.jpg" alt="Totonos会計モジュール" />
<figcaption>会計モジュール - 仕訳入力から財務諸表まで</figcaption>
</figure>

<figure class="blog-image">
<img src="/images/totonos-crm.jpg" alt="Totonos CRMモジュール" />
<figcaption>CRMモジュール - パイプラインビューで商談を一覧管理</figcaption>
</figure>

<h3>Enterprise・共通機能 - 43ページ</h3>

<p>SSOや承認フロー、監査ログなど、大企業でも使えるガバナンス機能を装備しています。</p>

<div class="enterprise-features">
<span class="feature-tag">SSO/SAML/SCIM</span>
<span class="feature-tag">承認ワークフロー</span>
<span class="feature-tag">監査ログ</span>
<span class="feature-tag">権限管理</span>
<span class="feature-tag">API</span>
<span class="feature-tag">MCP連携</span>
</div>

<h2>技術スタック</h2>

<div class="tech-stack">
<div class="tech-category">
<div class="tech-title">Frontend</div>
<div class="tech-items">React 18 + TypeScript + Vite + Tailwind CSS</div>
</div>
<div class="tech-category">
<div class="tech-title">Backend</div>
<div class="tech-items">Supabase (PostgreSQL + Auth + Edge Functions)</div>
</div>
<div class="tech-category">
<div class="tech-title">Dev Tools</div>
<div class="tech-items">Lovable + Claude Code + Gemini</div>
</div>
</div>

<p>サーバーサイドのコードはほぼ書いていません。Supabaseに全て任せました。</p>

<h2>プライシング：SaaSの「税金」をなくす</h2>

<p>既存のSaaSは、ユーザー数が増えるごとに課金される「従業員税」のようなモデルが主流です。</p>

<p><strong>Totonosはそれをやめます。</strong></p>

<div class="pricing-comparison">
<div class="pricing-old">
<div class="pricing-title">従来のSaaS</div>
<div class="pricing-amount">月額10万円〜</div>
<div class="pricing-note">ユーザー数 × 単価</div>
</div>
<div class="pricing-arrow">→</div>
<div class="pricing-new">
<div class="pricing-title">Totonos</div>
<div class="pricing-amount">月額数千円〜</div>
<div class="pricing-note">基本無料 + 従量課金</div>
</div>
</div>

<p>浮いたコストは、プロダクト開発や社員の給料に回してください。</p>

<h2>開発コストとROI</h2>

<div class="cost-breakdown">
<div class="cost-item">
<div class="cost-service">Lovable Pro</div>
<div class="cost-amount">$480/月</div>
</div>
<div class="cost-item">
<div class="cost-service">Claude MAX</div>
<div class="cost-amount">$100/月</div>
</div>
<div class="cost-item">
<div class="cost-service">Gemini Advanced</div>
<div class="cost-amount">$20/月</div>
</div>
<div class="cost-total">
<div class="cost-service">合計</div>
<div class="cost-amount">$600/月（約9万円）</div>
</div>
</div>

<p>$600で8つのSaaSを統合したプロダクトが完成。<strong>「最高級の道具を使えば、最小の労力で最高の結果が出る」</strong>という証明です。</p>

<h2>フィードバックはすぐ開発に反映されます</h2>

<p>Totonosはオープンソースで開発しています。</p>

<div class="feedback-flow">
<div class="flow-step">
<div class="flow-icon">💬</div>
<div class="flow-text">フィードバックを送信</div>
</div>
<div class="flow-arrow">→</div>
<div class="flow-step">
<div class="flow-icon">📋</div>
<div class="flow-text">GitHub Issueに自動登録</div>
</div>
<div class="flow-arrow">→</div>
<div class="flow-step">
<div class="flow-icon">🚀</div>
<div class="flow-text">次のスプリントで対応</div>
</div>
</div>

<p>「この機能が欲しい」「ここが使いにくい」「バグを見つけた」— どんな意見でも歓迎です。</p>

<h2>未来：自律的に進化するプロダクトへ</h2>

<p>もう少し経てば、Totonosは<strong>自律的に改善し、ユーザーごとにカスタマイズ可能なプロダクト</strong>になるかもしれません。</p>

<div class="future-features">
<div class="future-item">
<div class="future-icon">🤖</div>
<div class="future-title">AIによる自動改善</div>
<div class="future-desc">使い方を分析し、UIやワークフローを自動最適化</div>
</div>
<div class="future-item">
<div class="future-icon">🔧</div>
<div class="future-title">カスタムモジュール</div>
<div class="future-desc">「この機能が必要」とAIに伝えれば自動生成</div>
</div>
<div class="future-item">
<div class="future-icon">🏭</div>
<div class="future-title">業界特化版</div>
<div class="future-desc">飲食店、製造業、IT企業向けの最適設定を自動適用</div>
</div>
</div>

<h2>まとめ：プログラミングは「総力戦」へ</h2>

<p>Totonosの開発を通じて確信しました。これからの開発は、一人の天才がキーボードを叩くのではなく、<strong>特性の異なるAIを適材適所で使いこなす「総力戦」</strong>になります。</p>

<ul>
<li>Geminiに地図を描かせ、</li>
<li>Lovableに建物を建てさせ、</li>
<li>Claudeに電気を通させる。</li>
</ul>

<p>そして人間は、それが「整っているか」を確認する。</p>

<h2>ぜひ無料で試してください</h2>

<p>Totonosはまだ生まれたばかりのBeta版です。<strong>完全無料で使い始められます。</strong></p>

<div class="cta-box">
<p><strong>🚀 プロダクト</strong>: <a href="https://totonos.jp" target="_blank" rel="noopener noreferrer">https://totonos.jp</a></p>
<p><strong>📦 リポジトリ</strong>: <a href="https://github.com/yukihamada/totonos" target="_blank" rel="noopener noreferrer">https://github.com/yukihamada/totonos</a></p>
<p><strong>🐦 X (Twitter)</strong>: <a href="https://x.com/yukihamada" target="_blank" rel="noopener noreferrer">https://x.com/yukihamada</a></p>
</div>

<p>Xでは、AIごとの使い分けテクニックなども発信しています。フォローお待ちしています！</p>',
  updated_at = NOW()
WHERE slug = 'totonos-29hours-8in1-saas';