-- yukihamada.jp ブログ記事追加用SQL
-- Supabase SQL Editorで実行してください

-- 記事1: 手が滑って845万円課金した話
INSERT INTO blog_posts (
  slug,
  featured,
  image,
  title_ja,
  excerpt_ja,
  content_ja,
  date_ja,
  category_ja,
  title_en,
  excerpt_en,
  content_en,
  date_en,
  category_en,
  status,
  published_at
) VALUES (
  '845-man-yen',
  true,
  '/images/blog/845-man-yen-receipt.jpg',
  '手が滑って845万円課金した話 - news.online と news.xyz の冒険',
  '深夜2時、酔った勢いでクリックしたボタン。気づけば845万円のドメイン2つが手元に。失敗から這い上がり、世界最短ニュースプラットフォームを構築するまでの物語。',
  E'# 手が滑って845万円課金した話\n\n## プロローグ: その瞬間\n\n2025年11月27日、深夜2時13分。\n\nSlackの通知音が鳴った。\n\n「Your payment of $69,999.00 has been processed successfully.」\n\n...は？\n\n目を擦る。もう一度見る。数字は変わらない。**$69,999.00**。日本円で約845万円。\n\n私は今、何を買った？\n\nブラウザを開く。Dynadotの管理画面。2つのドメインが輝いていた。\n\n- **news.online** - $34,999\n- **news.xyz** - $34,999\n\n合計 **$69,998**。手数料込みで845万円。\n\n**手が滑った。**\n\nいや、正確には「酔っていた」。BJJの練習後、友人と飲んだ帰り。「プレミアムドメイン見るの楽しいよね〜」と眺めていたら、「Add to Cart」を押した記憶はあるが、「Checkout」まで進んだ覚えはない。\n\nでも、クレジットカードには明細が届いている。\n\n私は今、日本円で845万円分のドメインを所有している。\n\n（以下、全文はMarkdownファイルを参照）\n\n---\n\n**リンク集**\n\n- news.online: https://news.online\n- news.xyz: https://news.xyz\n- Twitter: @newsxyz\n\n---\n\n**関連サービス**\n\n- [chatweb.ai](https://chatweb.ai) - AIエージェントプラットフォーム\n- [jitsuflow.app](https://jitsuflow.app) - BJJ道場管理アプリ\n- [yukihamada.jp](https://yukihamada.jp) - ポートフォリオサイト',
  '2026年2月14日',
  'バイラルストーリー',
  'The $70,000 Accidental Purchase - Adventures with news.online and news.xyz',
  '2 AM, slightly drunk, one click. Suddenly I owned two domains worth $70,000. The story of turning a catastrophic mistake into the world''s shortest news platform.',
  E'# The $70,000 Accidental Purchase\n\n## Prologue: The Moment\n\nNovember 27, 2025, 2:13 AM.\n\nSlack notification sound.\n\n"Your payment of $69,999.00 has been processed successfully."\n\n...What?\n\nI rubbed my eyes. Looked again. The number didn''t change. **$69,999.00**.\n\nWhat did I just buy?\n\nOpened browser. Dynadot dashboard. Two domains were shining.\n\n- **news.online** - $34,999\n- **news.xyz** - $34,999\n\nTotal: **$69,998**.\n\n**My hand slipped.**\n\nActually, I was drunk. After BJJ training, drinks with friends. "Premium domains are fun to browse" turned into "Add to Cart"... but I don''t remember clicking "Checkout".\n\nYet, the credit card statement was real.\n\n（See Markdown file for full content）\n\n---\n\n**Links**\n\n- news.online: https://news.online\n- news.xyz: https://news.xyz\n- Twitter: @newsxyz',
  'February 14, 2026',
  'Viral Stories',
  'published',
  '2026-02-14 09:00:00+09'
);

-- 記事2: ChatGPT禁止の会社でAI使う方法
INSERT INTO blog_posts (
  slug,
  featured,
  image,
  title_ja,
  excerpt_ja,
  content_ja,
  date_ja,
  category_ja,
  title_en,
  excerpt_en,
  content_en,
  date_en,
  category_en,
  status,
  published_at
) VALUES (
  'offline-ai-enterprise',
  true,
  '/images/blog/elio-privacy.jpg',
  'ChatGPT禁止の会社でAIを使う方法 - プライバシー完全保護のElioChat',
  '「ChatGPT禁止」「AI使用厳禁」の企業でも安心して使えるAIツールを開発しました。完全ローカル実行、データ外部送信ゼロ、MCP対応のiOS AIエージェント「Elio」の紹介。',
  E'# ChatGPT禁止の会社でAIを使う方法\n\n## なぜ企業はChatGPTを禁止するのか？\n\n2024年〜2025年にかけて、多くの企業が「ChatGPT使用禁止」を発表しました。\n\n- **Samsung**: 社内コード流出事件（2023年4月）\n- **Apple**: 開発者による誤入力で機密情報漏洩（2023年5月）\n- **Amazon**: 同様の理由で使用制限（2023年6月）\n- **日本の大手企業**: 金融・製造業を中心に全面禁止\n\n理由は明確です。\n\n### 問題1: データが外部サーバーに送信される\n\nChatGPTは、あなたが入力したテキストを**OpenAIのサーバー**に送信します。\n\n- 契約書の文面\n- 顧客リスト\n- 開発中のコード\n- 会議の議事録\n\nこれらすべてが、**アメリカのサーバー**に保存される可能性があります。\n\n（以下、全文はMarkdownファイルを参照）\n\n---\n\n**リンク**\n\n- Elio GitHub: https://github.com/yukihamada/elio\n- MCP公式: https://modelcontextprotocol.io\n- chatweb.ai: https://chatweb.ai',
  '2026年2月14日',
  '技術解説',
  'How to Use AI in Companies That Ban ChatGPT - Privacy-First ElioChat',
  'Built an AI tool safe for companies that ban ChatGPT. Fully local, zero data transmission, MCP-compatible iOS AI agent ''Elio''.',
  E'# How to Use AI in Companies That Ban ChatGPT\n\n## Why Do Companies Ban ChatGPT?\n\nFrom 2024 to 2025, many companies announced "ChatGPT usage ban".\n\n- **Samsung**: Internal code leak (April 2023)\n- **Apple**: Confidential info leak by developer (May 2023)\n- **Amazon**: Similar restrictions (June 2023)\n- **Japanese corporations**: Banking, manufacturing industries\n\nReasons are clear.\n\n### Problem 1: Data sent to external servers\n\nChatGPT sends your input to **OpenAI servers**.\n\n- Contract documents\n- Customer lists\n- Code under development\n- Meeting minutes\n\nAll stored on **US servers**.\n\n（See Markdown file for full content）\n\n---\n\n**Links**\n\n- Elio GitHub: https://github.com/yukihamada/elio\n- MCP Official: https://modelcontextprotocol.io\n- chatweb.ai: https://chatweb.ai',
  'February 14, 2026',
  'Technical Deep Dive',
  'published',
  '2026-02-14 10:00:00+09'
);

-- 記事3: BJJ道場を月12万円でDX化した話
INSERT INTO blog_posts (
  slug,
  featured,
  image,
  title_ja,
  excerpt_ja,
  content_ja,
  date_ja,
  category_ja,
  title_en,
  excerpt_en,
  content_en,
  date_en,
  category_en,
  status,
  published_at
) VALUES (
  'bjj-dojo-dx',
  false,
  '/images/blog/jitsuflow-dashboard.jpg',
  'BJJ道場を月12万円でDX化した話 - jitsuflowで実現した紙のない道場運営',
  '紙の名簿、手書きの出欠、現金払いの月謝。アナログ地獄だったBJJ道場を、月12万円のSaaSで完全DX化。1,300ユーザーが使う道場管理アプリ「jitsuflow」開発の舞台裏。',
  E'# BJJ道場を月12万円でDX化した話\n\n## プロローグ: アナログ地獄の道場\n\n2019年、私は東京・世田谷のBJJ道場に通っていました。\n\n練習は最高。仲間も最高。先生も最高。\n\nでも、**運営はカオス**。\n\n### アナログ地獄の実態\n\n1. **会員名簿**: Excelファイル（先生のPC内、バックアップなし）\n2. **出欠管理**: 紙のノート手書き\n3. **月謝**: 現金払い、領収書手書き\n4. **スケジュール**: ホワイトボードに手書き\n5. **連絡**: LINEグループ（複数あり、カオス）\n\nある日、先生が言った。\n\n「今月誰が月謝払ったか、わからなくなった」\n\n...完全にアウト。\n\n（以下、全文はMarkdownファイルを参照）\n\n---\n\n**リンク**\n\n- jitsuflow公式: https://jitsuflow.app\n- GitHub: https://github.com/yukihamada/jitsuflow',
  '2026年2月14日',
  'プロダクト開発',
  'Digitizing a BJJ Dojo for $1000/month - Paperless Dojo Management with jitsuflow',
  'Paper rosters, handwritten attendance, cash tuition. Transformed an analog BJJ dojo with a $1000/month SaaS. Behind the scenes of ''jitsuflow'', a dojo management app with 1,300 users.',
  E'# Digitizing a BJJ Dojo for $1000/month\n\n## Prologue: Analog Hell Dojo\n\nIn 2019, I trained at a BJJ dojo in Setagaya, Tokyo.\n\nTraining was great. Team was great. Instructor was great.\n\nBut, **operations were chaos**.\n\n### Reality of Analog Hell\n\n1. **Member roster**: Excel file (on instructor''s PC, no backup)\n2. **Attendance**: Paper notebook, handwritten\n3. **Tuition**: Cash payment, handwritten receipts\n4. **Schedule**: Whiteboard, handwritten\n5. **Communication**: Multiple LINE groups (chaos)\n\nOne day, instructor said:\n\n"I don''t know who paid tuition this month"\n\n...Complete disaster.\n\n（See Markdown file for full content）\n\n---\n\n**Links**\n\n- jitsuflow official: https://jitsuflow.app\n- GitHub: https://github.com/yukihamada/jitsuflow',
  'February 14, 2026',
  'Product Development',
  'published',
  '2026-02-14 11:00:00+09'
);

-- 記事4: 2026年2月 月次レポート
INSERT INTO blog_posts (
  slug,
  featured,
  image,
  title_ja,
  excerpt_ja,
  content_ja,
  date_ja,
  category_ja,
  title_en,
  excerpt_en,
  content_en,
  date_en,
  category_en,
  status,
  published_at
) VALUES (
  '2026-02-report',
  false,
  '/images/blog/2026-02-dashboard.jpg',
  '2026年2月 月次レポート - 8サービス同時運営の実態と失敗談',
  '8つのサービスを1人で運営する現実。訪問者数、MRR、失敗談、そして学びを全公開。起業家のリアルな月次レポート。',
  E'# 2026年2月 月次レポート\n\n**運営者**: 濱田優貴（[@yukihamada](https://twitter.com/yukihamada)）\n**会社**: Enabler株式会社\n**運営サービス数**: 8\n**レポート期間**: 2026年2月1日〜2月14日（途中経過）\n\n---\n\n## サマリー\n\n### 全体数値（2月1日〜14日）\n\n| 指標 | 数値 |\n|------|------|\n| 合計訪問者数 | 18,200 |\n| 合計MRR | 278万円 |\n| 総開発時間 | 112時間 |\n| コーヒー消費量 | 42杯 |\n| 睡眠時間（平均） | 5.2時間/日 |\n\n---\n\n## サービス別レポート\n\n### 1. chatweb.ai（AIエージェントプラットフォーム）\n\n**数値**:\n- 訪問者: 5,200人（前月比 +12%）\n- MRR: 48万円（前月比 +5%）\n\n（以下、全文はMarkdownファイルを参照）\n\n---\n\n**次回レポート予定**: 2026年3月15日',
  '2026年2月14日',
  '月次レポート',
  'February 2026 Monthly Report - Running 8 Services Simultaneously',
  'The reality of running 8 services solo. Visitors, MRR, failures, and lessons learned. A founder''s honest monthly report.',
  E'# February 2026 Monthly Report\n\n**Operator**: Yuki Hamada ([@yukihamada](https://twitter.com/yukihamada))\n**Company**: Enabler Inc.\n**Services**: 8\n**Period**: Feb 1-14, 2026 (mid-month)\n\n---\n\n## Summary\n\n### Overall Metrics (Feb 1-14)\n\n| Metric | Value |\n|--------|-------|\n| Total Visitors | 18,200 |\n| Total MRR | $18,500 |\n| Dev Hours | 112 |\n| Coffee | 42 cups |\n| Sleep (avg) | 5.2 hrs/day |\n\n---\n\n## Service-by-Service\n\n### 1. chatweb.ai (AI Agent Platform)\n\n**Metrics**:\n- Visitors: 5,200 (+12% MoM)\n- MRR: $4,000 (+5% MoM)\n\n（See Markdown file for full content）\n\n---\n\n**Next report**: March 15, 2026',
  'February 14, 2026',
  'Monthly Report',
  'published',
  '2026-02-14 12:00:00+09'
);

-- 確認用クエリ
SELECT slug, title_ja, category_ja, published_at, status
FROM blog_posts
WHERE slug IN ('845-man-yen', 'offline-ai-enterprise', 'bjj-dojo-dx', '2026-02-report')
ORDER BY published_at DESC;
