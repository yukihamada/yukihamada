# yukihamada.jp サイト構造更新提案書

## 概要

yukihamada.jpをトラフィックハブ化するための構造更新提案。
4つのブログ記事追加と、サイト全体のUX改善を実施。

---

## 1. 新規ブログ記事（4本）

### 記事一覧

| slug | タイトル（日本語） | カテゴリ | featured |
|------|-------------------|---------|----------|
| 845-man-yen | 手が滑って845万円課金した話 | バイラルストーリー | ✓ |
| offline-ai-enterprise | ChatGPT禁止の会社でAI使う方法 | 技術解説 | ✓ |
| bjj-dojo-dx | BJJ道場を月12万円でDX化した話 | プロダクト開発 | - |
| 2026-02-report | 2026年2月 月次レポート | 月次レポート | - |

### カテゴリ追加

現在のSupabaseの`blog_posts`テーブルに、以下の新カテゴリを追加:

- **バイラルストーリー** (Viral Stories)
- **技術解説** (Technical Deep Dive)
- **プロダクト開発** (Product Development)
- **月次レポート** (Monthly Report)

### 画像準備

各記事用の画像を`/public/images/blog/`に配置:

- `/public/images/blog/845-man-yen-receipt.jpg` - 請求書スクリーンショット
- `/public/images/blog/elio-privacy.jpg` - Elioアプリのプライバシー機能
- `/public/images/blog/jitsuflow-dashboard.jpg` - jitsuflowダッシュボード
- `/public/images/blog/2026-02-dashboard.jpg` - 月次レポートグラフ

---

## 2. Hero セクション更新

### 現状

現在のHeroセクションは、シンプルなプロフィール表示のみ。

### 提案: Newsletter登録フォーム追加

**配置**: Heroセクションの直下（プロフィール情報の下）

**デザイン**:
```tsx
<section className="newsletter-cta bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 mb-12">
  <div className="max-w-2xl mx-auto text-center">
    <h2 className="text-2xl font-bold mb-3">
      {language === 'ja' ? '最新記事をメールで受け取る' : 'Get Latest Articles via Email'}
    </h2>
    <p className="text-muted-foreground mb-6">
      {language === 'ja'
        ? 'AI・スタートアップ・失敗談を週1回配信。登録者限定のディープダイブ記事も。'
        : 'Weekly updates on AI, startups, and lessons learned. Exclusive deep dives for subscribers.'}
    </p>
    <form className="flex gap-3 max-w-md mx-auto">
      <input
        type="email"
        placeholder={language === 'ja' ? 'メールアドレス' : 'Email address'}
        className="flex-1 px-4 py-3 rounded-lg border border-border bg-background"
      />
      <button className="btn-primary px-6 py-3 rounded-lg">
        {language === 'ja' ? '登録' : 'Subscribe'}
      </button>
    </form>
    <p className="text-xs text-muted-foreground mt-3">
      {language === 'ja'
        ? '配信停止はいつでも可能です。'
        : 'Unsubscribe anytime.'}
    </p>
  </div>
</section>
```

**機能**:
- Supabase Edgeで`newsletter_subscribers`テーブルに保存
- 重複登録チェック
- ダブルオプトイン（確認メール送信）
- Resend API連携で自動配信

---

## 3. サービス紹介カルーセル

### 現状

サービスは静的なグリッドで表示。

### 提案: インタラクティブカルーセル

**配置**: Newsletter登録フォームの下

**デザイン**:
- Swiper.js または Embla Carousel使用
- 自動スクロール（5秒間隔）
- モバイル対応（スワイプ可能）

**サービス一覧（8個）**:

1. **chatweb.ai**
   - 説明: 14チャネル対応AIエージェントプラットフォーム
   - アイコン: 🤖
   - リンク: https://chatweb.ai

2. **jitsuflow.app**
   - 説明: BJJ道場管理SaaS（1,300ユーザー）
   - アイコン: 🥋
   - リンク: https://jitsuflow.app

3. **news.online**
   - 説明: 240文字以内の短文ニュース
   - アイコン: 📰
   - リンク: https://news.online

4. **news.xyz**
   - 説明: 次世代ニュースプラットフォーム
   - アイコン: 🌐
   - リンク: https://news.xyz

5. **Elio**
   - 説明: プライバシー重視のローカルAI（iOS）
   - アイコン: 🔒
   - リンク: https://github.com/yukihamada/elio

6. **webllm.app**
   - 説明: ブラウザで動くLLM（WebGPU）
   - アイコン: 💻
   - リンク: https://webllm.app

7. **voiceGPTweb**
   - 説明: 音声でChatGPTと会話
   - アイコン: 🎙️
   - リンク: https://voicegptweb.com

8. **Enabler Inc.**
   - 説明: 運営会社（AI×プロダクト）
   - アイコン: 🏢
   - リンク: https://enabler.co.jp

**実装例**:
```tsx
<section className="services-carousel mb-12">
  <h2 className="text-3xl font-bold mb-6 text-center">
    {language === 'ja' ? '運営サービス' : 'Services'}
  </h2>
  <Swiper
    modules={[Autoplay, Pagination]}
    spaceBetween={20}
    slidesPerView={1}
    breakpoints={{
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
      1280: { slidesPerView: 4 },
    }}
    autoplay={{ delay: 5000 }}
    pagination={{ clickable: true }}
  >
    {services.map((service) => (
      <SwiperSlide key={service.name}>
        <a href={service.url} target="_blank" rel="noopener noreferrer">
          <div className="service-card p-6 rounded-xl border border-border hover:border-primary transition-colors h-full">
            <div className="text-4xl mb-3">{service.icon}</div>
            <h3 className="text-lg font-bold mb-2">{service.name}</h3>
            <p className="text-sm text-muted-foreground">{service[language].description}</p>
          </div>
        </a>
      </SwiperSlide>
    ))}
  </Swiper>
</section>
```

---

## 4. ブログカテゴリ追加

### 現状のカテゴリ（Blog.tsxから推測）

既存のカテゴリはSupabaseの`blog_posts`テーブルに保存。

### 提案: 新カテゴリ追加

#### 日本語カテゴリ

1. **バイラルストーリー** - 失敗談・成功談など共感を呼ぶ記事
2. **技術解説** - AI、MCP、DX等の技術的詳細
3. **プロダクト開発** - サービス開発の舞台裏
4. **月次レポート** - 毎月の活動・数字報告
5. **ポートフォリオ** - プロジェクト紹介
6. **AI** - AI関連全般
7. **起業・ビジネス** - スタートアップ、マネタイズ等

#### 英語カテゴリ

1. **Viral Stories**
2. **Technical Deep Dive**
3. **Product Development**
4. **Monthly Report**
5. **Portfolio**
6. **AI**
7. **Entrepreneurship**

### カテゴリフィルター強化

既存の`Blog.tsx`のカテゴリフィルター機能を維持しつつ、
カテゴリページを追加:

- `/blog/category/viral-stories`
- `/blog/category/technical`
- `/blog/category/product-development`
- `/blog/category/monthly-report`

**実装**:
```tsx
// src/pages/BlogCategory.tsx（新規作成）
const BlogCategory = () => {
  const { category } = useParams();
  const { posts } = useBlogPosts();
  const filteredPosts = posts.filter(p => p.slug === category);

  return (
    <div>
      <h1>Category: {category}</h1>
      {/* 記事一覧表示 */}
    </div>
  );
};
```

---

## 5. 関連サービスリンク（記事末尾）

### 現状

記事末尾には、関連記事リンクなし。

### 提案: 関連サービス + 関連記事セクション

**配置**: 各ブログ記事の最後（コメントセクションの上）

**デザイン**:
```tsx
<section className="related-content mt-12 pt-8 border-t border-border">
  {/* 関連サービス */}
  <div className="mb-8">
    <h3 className="text-xl font-bold mb-4">
      {language === 'ja' ? '関連サービス' : 'Related Services'}
    </h3>
    <div className="grid md:grid-cols-3 gap-4">
      {relatedServices.map((service) => (
        <a
          key={service.name}
          href={service.url}
          target="_blank"
          rel="noopener noreferrer"
          className="service-link-card p-4 rounded-lg border border-border hover:border-primary transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{service.icon}</span>
            <div>
              <h4 className="font-bold">{service.name}</h4>
              <p className="text-xs text-muted-foreground">{service[language].tagline}</p>
            </div>
          </div>
        </a>
      ))}
    </div>
  </div>

  {/* 関連記事 */}
  <div>
    <h3 className="text-xl font-bold mb-4">
      {language === 'ja' ? '関連記事' : 'Related Articles'}
    </h3>
    <div className="grid md:grid-cols-2 gap-4">
      {relatedPosts.map((post) => (
        <Link
          key={post.slug}
          to={`/blog/${post.slug}`}
          className="related-post-card p-4 rounded-lg border border-border hover:border-primary transition-colors"
        >
          <h4 className="font-bold mb-2">{post[language].title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{post[language].excerpt}</p>
        </Link>
      ))}
    </div>
  </div>
</section>
```

**ロジック**:
- 同じカテゴリの記事を優先
- 最大3〜4記事表示
- 現在の記事を除外

---

## 6. SEO強化

### メタデータ更新

各記事のメタデータを充実:

```tsx
<SEO
  title={`${post[language].title} | Yuki Hamada`}
  description={post[language].excerpt}
  url={`https://yukihamada.jp/blog/${post.slug}`}
  image={post.image || '/images/og-default.jpg'}
  type="article"
  publishedTime={post.publishedAt}
  modifiedTime={post.updatedAt}
  author="Yuki Hamada"
  keywords={post.tags}
/>
```

### 構造化データ追加

各ブログ記事に`Article`構造化データを追加:

```tsx
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{post.title}",
  "image": "{post.image}",
  "datePublished": "{post.publishedAt}",
  "dateModified": "{post.updatedAt}",
  "author": {
    "@type": "Person",
    "name": "Yuki Hamada",
    "url": "https://yukihamada.jp"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Enabler Inc.",
    "logo": {
      "@type": "ImageObject",
      "url": "https://yukihamada.jp/logo.png"
    }
  },
  "description": "{post.excerpt}"
}
</script>
```

### sitemap.xml強化

`public/sitemap.xml`を動的生成:

```tsx
// src/utils/generateSitemap.ts
export const generateSitemap = async () => {
  const posts = await fetchAllPosts();
  const urls = posts.map(post => ({
    loc: `https://yukihamada.jp/blog/${post.slug}`,
    lastmod: post.updatedAt,
    changefreq: 'weekly',
    priority: post.featured ? 0.9 : 0.7,
  }));

  // XML生成...
};
```

---

## 7. パフォーマンス最適化

### 画像最適化

- WebP形式への変換（既存の`OptimizedImage`コンポーネント使用）
- Lazy Loading（既存実装済み）
- Cloudflare Image Resizing活用

### コード分割

```tsx
// 動的インポートで初回ロード高速化
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
```

### キャッシュ戦略

```tsx
// Cloudflare Workersで静的ページキャッシュ
export default {
  async fetch(request, env) {
    const cache = caches.default;
    let response = await cache.match(request);

    if (!response) {
      response = await fetch(request);
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', 'public, max-age=3600');
      response = new Response(response.body, { ...response, headers });
      await cache.put(request, response.clone());
    }

    return response;
  }
};
```

---

## 8. アナリティクス強化

### イベントトラッキング追加

```tsx
// Newsletter登録
trackEvent('newsletter_subscribe', { source: 'hero' });

// サービスカードクリック
trackEvent('service_click', { service: 'chatweb.ai' });

// 関連記事クリック
trackEvent('related_post_click', { from: slug, to: relatedSlug });
```

### ヒートマップ

- Hotjar または Microsoft Clarity導入
- ユーザーのスクロール深度・クリック位置を分析

---

## 9. モバイル対応強化

### レスポンシブデザイン確認項目

- [ ] Newsletter登録フォーム（モバイルで縦配置）
- [ ] サービスカルーセル（スワイプ可能）
- [ ] ブログ記事（読みやすいフォントサイズ）
- [ ] 関連コンテンツ（カード縦配置）

### タッチ操作最適化

- カルーセル: スワイプジェスチャー対応
- 記事内リンク: タップしやすいサイズ（最低44px × 44px）
- メニュー: ハンバーガーメニュー

---

## 10. 実装優先順位

### Phase 1: 即座に実装（1週間以内）

1. ✅ ブログ記事4本追加（Markdown作成済み → Supabase投稿）
2. ⬜ Newsletter登録フォーム追加
3. ⬜ カテゴリ追加（Supabaseテーブル更新）

### Phase 2: 中期実装（2週間以内）

4. ⬜ サービス紹介カルーセル
5. ⬜ 関連サービス・関連記事セクション
6. ⬜ SEO強化（構造化データ、sitemap動的生成）

### Phase 3: 長期実装（1ヶ月以内）

7. ⬜ パフォーマンス最適化
8. ⬜ アナリティクス強化
9. ⬜ A/Bテスト（Newsletter登録CTAの位置等）

---

## 11. 成功指標（KPI）

### トラフィック

- **目標**: 月間訪問者数を現在の3,800人 → 10,000人に（3ヶ月以内）
- **測定**: Google Analytics、Cloudflare Analytics

### エンゲージメント

- **目標**: Newsletter登録者を月50人獲得
- **測定**: Supabase `newsletter_subscribers` テーブル

### SEO

- **目標**: "BJJ 道場管理" "ChatGPT 禁止" "ドメイン 失敗" でトップ3入り
- **測定**: Google Search Console

### コンバージョン

- **目標**: ブログ → サービス（chatweb.ai、jitsuflow等）への流入を月100セッション
- **測定**: UTMパラメータ付きリンク

---

## 12. Supabase データベース更新

### 新規テーブル: `newsletter_subscribers`

```sql
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, confirmed, unsubscribed
  source TEXT, -- hero, blog-post, etc.
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_status ON newsletter_subscribers(status);
```

### `blog_posts` テーブル更新

新カテゴリを追加（既存レコードの`category_ja`/`category_en`フィールドに値追加）。

---

## 13. 次のステップ

1. **ブログ記事をSupabaseに投稿**
   - 既存のAdmin Dashboard（`/admin/blog`）から手動投稿
   - または、SQL INSERT文で一括投稿

2. **Newsletter登録フォームをIndex.tsxに追加**
   - `src/pages/Index.tsx`を編集
   - Heroセクション直下に配置

3. **サービスカルーセルを実装**
   - Swiper.jsインストール: `npm install swiper`
   - `src/components/ServicesCarousel.tsx`を新規作成

4. **関連コンテンツセクションをBlogPost.tsxに追加**
   - `src/pages/BlogPost.tsx`を編集

5. **SEO強化**
   - `src/components/SEO.tsx`を更新
   - 構造化データ追加

---

## まとめ

この更新により、yukihamada.jpは以下を実現します。

✅ **コンテンツ充実**: 4本の高品質記事追加（バイラル性高い）
✅ **エンゲージメント向上**: Newsletter登録、サービスカルーセル
✅ **SEO強化**: カテゴリ整理、構造化データ、関連コンテンツ
✅ **トラフィックハブ化**: ブログ → サービスへの導線強化

**推定効果**:
- 月間訪問者: 3,800 → 10,000人（3ヶ月後）
- Newsletter登録: 月50人
- サービス流入: 月100セッション

次は、実装フェーズに移ります。
