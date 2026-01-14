-- Update Totonos blog post with screenshots and OGP image
UPDATE public.blog_posts 
SET 
  image = '/images/blog-totonos-ogp.png',
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

<ul>
<li><strong>開発時間</strong>: 29時間（2026/1/13 15:33 〜 1/14 20:15）</li>
<li><strong>コード量</strong>: 64,174行（TypeScript）</li>
<li><strong>ページ数</strong>: 106ページ</li>
<li><strong>成果物</strong>: 会計・労務・採用・経費・CRM・プロジェクト管理・契約・Wikiを統合したAll-in-One SaaS</li>
</ul>

<h2>開発チーム：私と3人の「天才AI」たち</h2>

<p>今回、私はコードをほとんど書いていません。私の仕事は「指揮」でした。雇ったのは3人のスペシャリストたちです。</p>

<h3>1. PM/アーキテクト：Gemini</h3>

<p><strong>役割：要件定義、仕様策定</strong></p>

<p>開発の初手、私はGeminiに相談しました。</p>

<p>「freeeとSmartHRとSalesforceを混ぜたいんだけど、DB設計どうすればいい？」「競合の機能差分をリストアップして」</p>

<p>Geminiは膨大なWebの知識から、必要な機能要件（MVP）を完璧に定義してくれました。彼が作った設計図があったからこそ、迷走せずに済みました。</p>

<h3>2. UI/フロントエンド実装：Lovable (Pro Plan)</h3>

<p><strong>役割：爆速UI構築</strong></p>

<p>今回、気合を入れてLovableの<strong>Proプラン（月額$480）</strong>を契約しました。</p>

<p>しかし驚くべきことに、消費したトークンは1,000トークン未満です。</p>

<p>なぜか？ <strong>Lovableが優秀すぎて「手戻り」がなかったから</strong>です。</p>

<p>「〇〇なダッシュボードを作って」と一言投げるだけで、shadcn/uiベースの美しいUIが一発で上がってくる。修正のラリーが要らない。</p>

<p>480ドル払ってフェラーリを買いましたが、1速に入れただけでゴールテープを切ってしまった感覚です。</p>

<h3>3. ロジック/バックエンド実装：Claude (MAX Plan)</h3>

<p><strong>役割：難解なロジックのねじ伏せ</strong></p>

<p>Lovableが作ったガワに魂（ロジック）を吹き込むのは、最強モデルを搭載したClaude（MAXプラン）の役目です。</p>

<p>SCIM 2.0の実装や、複雑な会計仕訳のロジックなど、人間でも頭を抱える処理を彼に任せました。</p>

<h2>完成したもの：全103ページの機能一覧</h2>

<p>「29時間で作った」と言うと、「どうせハリボテだろう」と思われるかもしれません。</p>

<p>しかし、AIネイティブ開発の速度は次元が違います。以下は、実装された全103ページ・8つのモジュールの完全なリストです。</p>

<h3>1. 会計・経理（freee対抗）- 14ページ</h3>

<p>複式簿記に対応し、レシートOCRから決算書の作成まで完結します。</p>

<figure class="blog-image">
<img src="/images/totonos-accounting.jpg" alt="Totonos会計モジュール" />
<figcaption>会計モジュール - 仕訳入力から財務諸表まで</figcaption>
</figure>

<ul>
<li>Accounting: 会計ダッシュボード</li>
<li>AccountingJournal: 仕訳帳</li>
<li>AccountingJournalNew: 仕訳入力（複式簿記）</li>
<li>AccountingLedger: 総勘定元帳</li>
<li>AccountingStatements: 財務諸表（BS/PL/CF）</li>
<li>AccountingAssets: 固定資産管理・減価償却</li>
<li>AccountingBudget: 予算管理・実績比較</li>
<li>AccountingExpenses: 経費管理</li>
<li>AccountingReceivables: 売掛金管理</li>
<li>AccountingSettings: 勘定科目・会計設定</li>
<li>Invoices: 請求書作成・送付</li>
<li>Estimates: 見積書</li>
<li>PurchaseOrders: 発注書</li>
<li>ReceiptCapture: レシートOCR（写真→仕訳）</li>
<li>BankConnections: 銀行口座連携</li>
<li>Reconciliation: 消込・照合</li>
<li>EBookkeeping: 電子帳簿保存法対応</li>
</ul>

<h3>2. 労務・HR（SmartHR対抗）- 12ページ</h3>

<p>入社手続きから年末調整、給与計算まで。GPS打刻にも対応。</p>

<ul>
<li>Employees: 従業員マスタ</li>
<li>Attendance: 勤怠打刻（GPS対応）</li>
<li>Shifts: シフト管理</li>
<li>LeaveRequests: 休暇申請・承認</li>
<li>Payroll: 給与計算</li>
<li>Payslips: 給与明細発行</li>
<li>YearEnd: 年末調整</li>
<li>SocialInsurance: 社会保険手続き</li>
<li>MyNumberManagement: マイナンバー管理</li>
<li>EmployeePortal: 従業員セルフサービス</li>
</ul>

<h3>3. 採用管理（HRMOS対抗）- 7ページ</h3>

<p>求人ページの自動生成から、候補者のステータス管理まで。</p>

<ul>
<li>Recruiting: 採用ダッシュボード</li>
<li>JobPostings: 求人作成・公開</li>
<li>JobPostingNew: 求人新規作成</li>
<li>Candidates: 候補者管理</li>
<li>CandidateDetail: 候補者詳細・評価</li>
<li>InterviewSchedule: 面接スケジュール</li>
<li>RecruitingReports: 採用レポート・分析</li>
</ul>

<h3>4. 経費精算（楽楽精算対抗）- 5ページ</h3>

<p>申請・承認フローを標準装備。仮払いや立替経費を一元管理。</p>

<ul>
<li>Expenses: 経費一覧</li>
<li>ExpenseNew: 経費申請</li>
<li>ExpenseDetail: 経費詳細・承認</li>
<li>ExpenseSettings: 経費科目設定</li>
<li>AdvancePayment: 前払金・仮払管理</li>
</ul>

<h3>5. CRM/SFA（Salesforce対抗）- 8ページ</h3>

<p>AIによるスコアリングと売上予測を搭載した現代的なCRM。</p>

<figure class="blog-image">
<img src="/images/totonos-crm.jpg" alt="Totonos CRMモジュール" />
<figcaption>CRMモジュール - パイプラインビューで商談を一覧管理</figcaption>
</figure>

<ul>
<li>Leads: リード管理</li>
<li>LeadScoring: AIリードスコアリング</li>
<li>Deals: 商談管理</li>
<li>Pipeline: パイプラインビュー</li>
<li>Activities: 活動記録</li>
<li>SalesForecast: 売上予測AI</li>
<li>Clients: 顧客マスタ</li>
<li>Reports: 営業レポート</li>
</ul>

<h3>6. プロジェクト管理（Asana対抗）- 6ページ</h3>

<p>カンバン、ガントチャート、工数管理を統合。</p>

<ul>
<li>Projects: プロジェクト一覧</li>
<li>ProjectNew: プロジェクト作成</li>
<li>ProjectDetail: プロジェクト詳細</li>
<li>ProjectKanban: カンバンボード</li>
<li>ProjectGantt: ガントチャート</li>
<li>ProjectTimelog: 工数管理・タイムログ</li>
</ul>

<h3>7. 契約管理（クラウドサイン対抗）- 6ページ</h3>

<p>電子署名と期限管理。もう紙の契約書を探す必要はありません。</p>

<ul>
<li>Contracts: 契約一覧</li>
<li>ContractNew: 契約作成</li>
<li>ContractEdit: 契約編集</li>
<li>ContractDetail: 契約詳細</li>
<li>ContractSign: 電子署名</li>
<li>ContractAlerts: 期限アラート</li>
</ul>

<h3>8. Wiki（Notion対抗）- 2ページ</h3>

<p>社内のナレッジを階層構造でストック。</p>

<ul>
<li>Wiki: Wikiページ</li>
<li>WikiHierarchy: 階層構造ビュー</li>
</ul>

<h3>Enterprise・共通機能 - 43ページ</h3>

<p>SSOや承認フロー、監査ログなど、大企業でも使えるガバナンス機能を装備。</p>

<ul>
<li>Workflows: 承認フロー・ワークフロー設定</li>
<li>TeamMembers: チームメンバー管理・権限設定</li>
<li>SSOSettings: SSO/SAML/SCIM設定</li>
<li>AuditLog: 監査ログ</li>
<li>ApiDocs: APIドキュメント（開発者向け）</li>
<li>McpSettings: MCP（Claude/ChatGPT連携）設定</li>
<li>Pricing/Credits: 料金・クレジット管理</li>
<li>Dashboard: 全体ダッシュボード</li>
</ul>

<h2>開発ハイライト</h2>

<h3>Phase 1：Geminiによる「設計の勝利」（Day 1 15:00）</h3>

<p>いきなりコードを書くのではなく、Geminiに「8つのSaaSを統合するためのER図」を描かせました。</p>

<p>ここで「組織（Organization）」を頂点としたマルチテナント構造を確定させたことが、後の勝因となります。</p>

<h3>Phase 2：Lovableによる「瞬殺のUI」（Day 1 15:33〜）</h3>

<p>Geminiの要件をLovableに投げます。</p>

<blockquote>
「会計、労務、CRM、Wiki、契約の5つのタブを持つSaaSを作って。デザインはモダンに」
</blockquote>

<p>これだけで骨格が完成。</p>

<p>契約管理機能（クラウドサイン相当）も、「契約書アップロード、署名フロー、ステータス管理画面を作って」の指示で、30分後には動くものが出来上がりました。</p>

<h3>Phase 3：Claudeによる「Enterprise化」（Day 2）</h3>

<p>形はできましたが、中身はまだ空っぽです。ここでClaudeの出番。</p>

<p>SupabaseのEdge Functionsを使い、Stripe決済連携やSAML認証を実装させました。</p>

<p>特に「セキュリティ」に関しては、Claudeにコードレビューを依頼し、RLS（Row Level Security）の穴を徹底的に塞ぎました。</p>

<h2>技術スタック：バックエンドは「書かない」</h2>

<ul>
<li><strong>Frontend</strong>: React 18 + TypeScript + Vite + Tailwind CSS</li>
<li><strong>Backend</strong>: Supabase (PostgreSQL + Auth + Edge Functions)</li>
<li><strong>Dev Tools</strong>: Lovable + Claude Code</li>
</ul>

<p>サーバーサイドのコードはほぼ書いていません。Supabaseに全て任せました。</p>

<p>私がやったのは、AIたちが生成したコードをGitにコミットし、たまに微調整するだけ。</p>

<h2>プライシング：SaaSの「税金」をなくす</h2>

<p>既存のSaaSは、ユーザー数が増えるごとに課金される「従業員税」のようなモデルが主流です。</p>

<p><strong>Totonosはそれをやめます。</strong></p>

<ul>
<li>✅ <strong>基本無料</strong></li>
<li>✅ <strong>使った分だけ課金（従量課金）</strong></li>
</ul>

<p>具体的には、クレジットを購入していただき、機能を使った分だけ消費するモデルを採用しています。</p>

<p>普通に使っていれば、<strong>月額10,000円もかからない設計</strong>にする予定です。</p>

<p>「月額10万円」の世界から、「月額数千円」の世界へ。</p>

<p>浮いたコストは、プロダクト開発や社員の給料に回してください。</p>

<h2>コストとROIのパラドックス</h2>

<p>今回の開発コストを見てください。</p>

<ul>
<li>Lovable Pro: $480/月</li>
<li>Claude MAX: 上位プラン契約</li>
<li>Gemini: 無料（またはAdvanced）</li>
</ul>

<p>一見、ツール代が高いように見えます。しかし、<strong>「エンジニア1人を29時間拘束するコスト」や「5つのSaaSを契約するランニングコスト」</strong>と比較してください。</p>

<p>$480のLovable Proプランを契約し、1000トークンも使わずにSaaSが完成した。</p>

<p>これは「無駄遣い」ではありません。<strong>「最高級の道具を使えば、最小の労力で最高の結果が出る」</strong>という証明です。</p>

<h2>フィードバックはすぐ開発に反映されます</h2>

<p>Totonosはオープンソースで開発しています。</p>

<p><strong>フィードバックはGitHubのIssueに登録していただければ、すぐに開発フローに乗ります。</strong></p>

<p>「この機能が欲しい」「ここが使いにくい」「バグを見つけた」</p>

<p>どんな意見でも歓迎です。Issueを登録してもらえれば、私とAIチームが優先度を判断し、次のスプリントで対応していきます。</p>

<p>オープンソースなので、もちろんPull Requestも大歓迎。一緒にTotonosを育てていきましょう。</p>

<h2>未来：自律的に進化するプロダクトへ</h2>

<p>もう少し経てば、Totonosは<strong>自律的に改善し、ユーザーごとにカスタマイズ可能なプロダクト</strong>になるかもしれません。</p>

<p>具体的には：</p>

<ul>
<li><strong>AIによる自動改善</strong>: ユーザーの使い方を分析し、UIやワークフローを自動最適化</li>
<li><strong>カスタムモジュール</strong>: 「うちの会社にはこの機能が必要」をAIに伝えれば、専用機能を自動生成</li>
<li><strong>業界特化版</strong>: 飲食店向け、製造業向け、IT企業向けなど、業界ごとの最適設定を自動適用</li>
</ul>

<p>これらはまだ構想段階ですが、29時間で8つのSaaSを作れたのなら、次のステップも夢ではありません。</p>

<h2>まとめ：プログラミングは「総力戦」へ</h2>

<p>Totonosの開発を通じて確信しました。これからの開発は、一人の天才がキーボードを叩くのではなく、<strong>特性の異なるAIを適材適所で使いこなす「総力戦」</strong>になります。</p>

<ul>
<li>Geminiに地図を描かせ、</li>
<li>Lovableに建物を建てさせ、</li>
<li>Claudeに電気を通させる。</li>
</ul>

<p>そして人間は、それが「整っているか」を確認する。</p>

<p>「プログラミング不要論」とか「AIで仕事がなくなる」とか議論している暇があったら、手を動かして「欲しい未来」を作ったほうが早い。</p>

<p>Totonosは、そんなAI時代の象徴的なプロダクトにしていきたいと思っています。</p>

<h2>ぜひ無料で試してください</h2>

<p>Totonosはまだ生まれたばかりのBeta版です。</p>

<p>これから実際に私自身も使い倒し、ユーザーの皆さんのフィードバックを受けながら、毎週のように改善を繰り返していきます。</p>

<p><strong>完全無料で使い始められます。</strong></p>

<p>ぜひ触ってみてください。そして、要望をぶつけてください。</p>

<div class="cta-box">
<p><strong>🚀 プロダクト</strong>: <a href="https://totonos.jp" target="_blank" rel="noopener noreferrer">https://totonos.jp</a></p>
<p><strong>📦 リポジトリ</strong>: <a href="https://github.com/yukihamada/totonos" target="_blank" rel="noopener noreferrer">https://github.com/yukihamada/totonos</a></p>
<p><strong>🐦 X (Twitter)</strong>: <a href="https://x.com/yukihamada" target="_blank" rel="noopener noreferrer">https://x.com/yukihamada</a></p>
</div>

<p>Xでは、AIごとの使い分けテクニックなども発信しています。フォローお待ちしています！</p>',
  updated_at = NOW()
WHERE slug = 'totonos-29hours-8in1-saas';