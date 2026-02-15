# yukihamada.jp トラフィックハブ化 実装チェックリスト

## ✅ 完了した作業

### 1. コンテンツ作成

- [x] ブログ記事4本をMarkdown形式で作成
  - [x] `content/blog/845-man-yen.md` - 手が滑って845万円課金した話
  - [x] `content/blog/offline-ai-enterprise.md` - ChatGPT禁止の会社でAI使う方法
  - [x] `content/blog/bjj-dojo-dx.md` - BJJ道場を月12万円でDX化した話
  - [x] `content/blog/2026-02-report.md` - 2026年2月 月次レポート

- [x] SNS投稿テンプレート作成
  - [x] `social/facebook-templates.md` - Facebook投稿テンプレート（5パターン × 4記事）
  - [x] `social/twitter-threads.md` - Twitterスレッドテンプレート（4スレッド × 6〜10ツイート）
  - [x] `social/linkedin-posts.md` - LinkedIn投稿テンプレート（4記事 × 3パターン）

- [x] サイト構造更新提案書作成
  - [x] `SITE_STRUCTURE_UPDATE.md` - 詳細な実装ガイド

- [x] SQL挿入文作成
  - [x] `content/blog/INSERT_BLOG_POSTS.sql` - Supabase投稿用SQL

---

## ⬜ 次のステップ（実装待ち）

### Phase 1: コンテンツ投稿（即座に実施）

#### 1.1 ブログ記事をSupabaseに投稿

**方法1: Admin Dashboard経由（推奨）**

1. ⬜ `https://yukihamada.jp/admin/blog` にアクセス
2. ⬜ 「新規記事作成」をクリック
3. ⬜ 以下の記事を1本ずつ作成:
   - ⬜ 845万円課金した話（featured: true）
   - ⬜ ChatGPT禁止の会社でAI使う方法（featured: true）
   - ⬜ BJJ道場DX化（featured: false）
   - ⬜ 2026年2月月次レポート（featured: false）

**方法2: SQL直接実行**

1. ⬜ Supabase Dashboard → SQL Editor を開く
2. ⬜ `content/blog/INSERT_BLOG_POSTS.sql` の内容をコピペ
3. ⬜ 実行
4. ⬜ 確認クエリで投稿成功を確認

#### 1.2 画像準備

⬜ 以下の画像を `/public/images/blog/` に配置:

- ⬜ `845-man-yen-receipt.jpg` - 請求書スクリーンショット（仮）
  - 推奨サイズ: 1200×630px
  - 内容: Dynadotの請求書、または金額を強調したグラフィック

- ⬜ `elio-privacy.jpg` - Elioアプリのプライバシー機能
  - 推奨サイズ: 1200×630px
  - 内容: Elioのスクリーンショット + "データ送信ゼロ" のテキスト

- ⬜ `jitsuflow-dashboard.jpg` - jitsuflowダッシュボード
  - 推奨サイズ: 1200×630px
  - 内容: jitsuflowの管理画面

- ⬜ `2026-02-dashboard.jpg` - 月次レポートグラフ
  - 推奨サイズ: 1200×630px
  - 内容: MRR・訪問者数のグラフ

**画像作成ツール**:
- Canva（テンプレート利用）
- Figma（デザイン自由度高）
- Photopea（無料のPhotoshop代替）

---

### Phase 2: サイト機能追加（1週間以内）

#### 2.1 Newsletter登録フォーム

**ファイル**: `src/pages/Index.tsx`

⬜ 実装手順:

1. ⬜ Heroセクション直下にNewsletterセクション追加
   ```tsx
   <NewsletterSignup />
   ```

2. ⬜ `src/components/NewsletterSignup.tsx` を新規作成
   - フォーム（email入力 + 送信ボタン）
   - Supabase `newsletter_subscribers` テーブルに保存
   - バリデーション（メール形式チェック、重複チェック）
   - 成功/エラーメッセージ表示

3. ⬜ Supabaseテーブル作成
   ```sql
   CREATE TABLE newsletter_subscribers (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     email TEXT UNIQUE NOT NULL,
     status TEXT DEFAULT 'pending',
     source TEXT,
     confirmed_at TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

4. ⬜ Row Level Security (RLS) 設定
   ```sql
   -- 誰でも自分のメールアドレスを登録可能
   CREATE POLICY "Anyone can insert own email"
   ON newsletter_subscribers FOR INSERT
   WITH CHECK (true);

   -- 管理者のみ全データ閲覧可能
   CREATE POLICY "Admin can view all"
   ON newsletter_subscribers FOR SELECT
   USING (auth.role() = 'authenticated');
   ```

#### 2.2 カテゴリ追加

⬜ Supabaseの既存記事のカテゴリを確認・整理:

```sql
-- 既存カテゴリ一覧
SELECT DISTINCT category_ja, category_en
FROM blog_posts
ORDER BY category_ja;
```

⬜ 新カテゴリが正しく表示されることを確認:
- バイラルストーリー / Viral Stories
- 技術解説 / Technical Deep Dive
- プロダクト開発 / Product Development
- 月次レポート / Monthly Report

---

### Phase 3: UI/UX改善（2週間以内）

#### 3.1 サービス紹介カルーセル

**ファイル**: `src/components/ServicesCarousel.tsx`（新規作成）

⬜ 実装手順:

1. ⬜ Swiperインストール
   ```bash
   npm install swiper
   ```

2. ⬜ `src/components/ServicesCarousel.tsx` を作成
   - 8サービスのデータ配列
   - Swiper設定（自動スクロール、レスポンシブ）

3. ⬜ `src/pages/Index.tsx` に追加
   ```tsx
   <ServicesCarousel />
   ```

4. ⬜ スタイリング（`src/index.css` または個別CSS）

**サービスデータ**:
```typescript
const services = [
  {
    name: 'chatweb.ai',
    icon: '🤖',
    url: 'https://chatweb.ai',
    ja: { description: '14チャネル対応AIエージェント' },
    en: { description: '14-channel AI agent platform' },
  },
  // ... 残り7サービス
];
```

#### 3.2 関連サービス・関連記事セクション

**ファイル**: `src/pages/BlogPost.tsx`

⬜ 実装手順:

1. ⬜ 関連記事取得ロジック追加
   ```typescript
   const relatedPosts = posts
     .filter(p => p.slug !== currentSlug && p.category === currentCategory)
     .slice(0, 3);
   ```

2. ⬜ 関連サービス選定ロジック
   - 記事のキーワードに基づいて関連サービスを選択
   - 例: "AI"キーワード → chatweb.ai, Elio, webllm.app

3. ⬜ UIコンポーネント追加（記事末尾）
   ```tsx
   <RelatedContent
     services={relatedServices}
     posts={relatedPosts}
   />
   ```

---

### Phase 4: SEO強化（2週間以内）

#### 4.1 構造化データ追加

**ファイル**: `src/pages/BlogPost.tsx`

⬜ 実装手順:

1. ⬜ BlogPosting構造化データを追加
   ```tsx
   <script type="application/ld+json">
   {JSON.stringify({
     "@context": "https://schema.org",
     "@type": "BlogPosting",
     "headline": post.title,
     "image": post.image,
     "datePublished": post.publishedAt,
     "author": {
       "@type": "Person",
       "name": "Yuki Hamada"
     }
   })}
   </script>
   ```

2. ⬜ PersonとOrganizationのデータも追加
   - ホームページ: Person（著者情報）
   - 全ページ: Organization（Enabler Inc.）

#### 4.2 sitemap.xml動的生成

**ファイル**: `src/utils/generateSitemap.ts`（新規作成）

⬜ 実装手順:

1. ⬜ Supabaseから全記事取得 → sitemap.xml生成
2. ⬜ Cloudflare Workersで動的生成
   - `/sitemap.xml` アクセス時に生成
3. ⬜ Google Search Consoleにサイトマップ送信

#### 4.3 robots.txt更新

**ファイル**: `/public/robots.txt`

⬜ 確認・更新:

```
User-agent: *
Allow: /

Sitemap: https://yukihamada.jp/sitemap.xml
```

---

### Phase 5: SNS投稿（継続的）

#### 5.1 Facebook投稿

⬜ 各記事公開後、`social/facebook-templates.md` のテンプレートを使用して投稿

- ⬜ 845万円課金した話（パターン2: 共感を誘う系）
- ⬜ ChatGPT禁止（パターン1: 問題提起型）
- ⬜ BJJ道場DX（パターン1: Before/After型）
- ⬜ 月次レポート（パターン2: 透明性アピール型）

**投稿時間**: 平日12:00〜13:00、19:00〜21:00

#### 5.2 X (Twitter) スレッド投稿

⬜ 各記事公開後、`social/twitter-threads.md` のスレッドを投稿

- ⬜ 845万円課金（10ツイート）
- ⬜ ChatGPT禁止（8ツイート）
- ⬜ BJJ道場DX（7ツイート）
- ⬜ 月次レポート（6ツイート）

**投稿時間**: 平日7:00〜9:00、20:00〜22:00

#### 5.3 LinkedIn投稿

⬜ 各記事公開後、`social/linkedin-posts.md` のテンプレートを使用

- ⬜ ChatGPT禁止（パターン1: プロフェッショナル問題解決型）
- ⬜ BJJ道場DX（パターン1: ROI重視型）
- ⬜ 月次レポート（パターン1: 透明性重視型）
- ⬜ 845万円課金（パターン1: 教訓重視型）

**投稿時間**: 平日7:00〜9:00、12:00〜13:00

---

### Phase 6: 分析・改善（継続的）

#### 6.1 アナリティクス設定

⬜ Google Analytics 4 イベントトラッキング追加:

- ⬜ `newsletter_subscribe`（Newsletter登録）
- ⬜ `service_click`（サービスカードクリック）
- ⬜ `related_post_click`（関連記事クリック）
- ⬜ `blog_read_complete`（記事読了）

#### 6.2 A/Bテスト

⬜ Newsletter登録フォームの位置テスト:

- パターンA: Hero直下
- パターンB: 記事一覧の上
- パターンC: ブログ記事末尾

⬜ サービスカルーセルの表示形式テスト:

- パターンA: 自動スクロール
- パターンB: 手動スクロールのみ

#### 6.3 週次レビュー

⬜ 毎週金曜日、以下を確認:

- [ ] Google Analytics: 訪問者数、ページビュー、直帰率
- [ ] Google Search Console: 検索クエリ、表示回数、CTR
- [ ] Newsletter登録数
- [ ] SNSエンゲージメント（いいね、コメント、シェア）

---

## 📊 成功指標（KPI）

### 目標（3ヶ月後: 2026年5月14日）

| 指標 | 現在 | 目標 | 進捗 |
|------|------|------|------|
| 月間訪問者数 | 3,800 | 10,000 | ⬜ |
| Newsletter登録者 | 12/月 | 50/月 | ⬜ |
| ブログ記事数 | 既存 + 4 | 既存 + 12 | ⬜ |
| SEOトップ3キーワード | 1 | 5 | ⬜ |
| サービス流入 | 不明 | 100/月 | ⬜ |

### 測定方法

- **訪問者数**: Google Analytics
- **Newsletter**: Supabase `newsletter_subscribers` テーブル
- **SEO順位**: Google Search Console + Ahrefs/SEMrush
- **サービス流入**: UTMパラメータ付きリンク

---

## 🚨 トラブルシューティング

### 問題: Supabase挿入エラー

**原因**: `blog_posts` テーブルのスキーマ不一致

**解決策**:
1. Supabase Dashboard → Table Editor で `blog_posts` スキーマ確認
2. カラム名・型が一致しているか確認
3. 必要に応じて `ALTER TABLE` で調整

### 問題: 画像が表示されない

**原因**: `/public/images/blog/` に画像が存在しない

**解決策**:
1. 画像をCanva等で作成
2. `/public/images/blog/` にアップロード
3. ブラウザのキャッシュクリア

### 問題: Newsletter登録ができない

**原因**: Supabase RLS設定

**解決策**:
1. Supabase Dashboard → Authentication → Policies
2. `newsletter_subscribers` のINSERTポリシーを確認
3. `WITH CHECK (true)` で誰でも挿入可能にする

---

## 📝 次回ミーティング議題

⬜ 2026年2月21日（1週間後）

- [ ] ブログ記事投稿状況
- [ ] Newsletter登録フォーム実装状況
- [ ] 初回SNS投稿のエンゲージメント結果
- [ ] Phase 3（UI/UX改善）の優先順位決定

---

## 📚 参考資料

- [Supabase Documentation](https://supabase.com/docs)
- [Swiper Documentation](https://swiperjs.com/react)
- [Google Search Console](https://search.google.com/search-console)
- [Schema.org BlogPosting](https://schema.org/BlogPosting)

---

**最終更新**: 2026年2月14日
**担当**: 濱田優貴
**ステータス**: Phase 1（コンテンツ作成）完了 → Phase 2（実装）開始待ち
