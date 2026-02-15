# yukihamada.jp CTA実装ガイド

## プロジェクト概要

### 調査結果サマリー

**メインプロジェクト:** `/Users/yuki/workspace/personal/yukihamada-seo`
**サブプロジェクト:** `/Users/yuki/workspace/yukihamada-jp` (コンテンツのみ、現在はほぼ空)

yukihamada.jpは**React + Vite + TypeScript + shadcn/ui**で構築されたモダンなSPAです。
Supabaseをバックエンドに使用し、ブログ機能、ニュースレター登録、AI チャット機能を実装済みです。

### 既存のCTA実装状況

#### 実装済みCTA（2026年2月14日時点）

1. **Newsletter signup** - Footer、Newsletter専用ページ
2. **jitsuflow.app** - HobbiesSection下部
3. **chatweb.ai** - AIToolsSection（BlogSectionとHobbiesSectionの間）
4. **stayflowapp.com** - EnablerSection内（4番目のサービス）
5. **BlogPostCTA** - ブログ記事下部（Newsletter登録、AIチャット、関連記事）
6. **Patreon** - 認証済みユーザー向け（HeroSection、Footer）

#### 技術スタック

```
フロントエンド:
  - React 18.3.1
  - TypeScript 5.8.3
  - Vite 5.4.19
  - Tailwind CSS 3.4.17
  - shadcn/ui (Radix UI ベース)
  - Framer Motion 11.18.2 (アニメーション)
  - React Router DOM 6.30.1

バックエンド:
  - Supabase (PostgreSQL)
  - Cloudflare Workers (動的sitemap)

デプロイ:
  - Cloudflare Pages (推測)
  - または Vercel/Netlify
```

---

## CTA実装パターン分析

### 1. ServiceCTACard コンポーネント

**ファイル:** `/Users/yuki/workspace/personal/yukihamada-seo/src/components/ServiceCTACard.tsx`

#### 使用例

```tsx
<ServiceCTACard
  title="chatweb.ai"
  description="マルチモデル対応AIチャットプラットフォーム"
  features={[
    '複数のAIモデル対応',
    '無料プランあり',
    'API・連携機能'
  ]}
  href="https://chatweb.ai"
  icon={Bot}
  color="from-blue-500 to-cyan-600"
  badge="AIツール"
/>
```

#### 特徴

- 再利用可能な統一デザイン
- Framer Motionによるホバーアニメーション
- 日英対応（LanguageContext経由）
- 外部リンク（新規タブで開く）
- グラデーション背景カスタマイズ可能

### 2. BlogPostCTA コンポーネント

**ファイル:** `/Users/yuki/workspace/personal/yukihamada-seo/src/components/BlogPostCTA.tsx`

#### 機能

- ニュースレター登録CTA（メインビジュアル）
- AIチャット起動ボタン（記事内容に関する質問）
- 他の記事を読むリンク
- 関連記事表示（最大2件）

### 3. NewsletterSignupForm コンポーネント

**ファイル:** `/Users/yuki/workspace/personal/yukihamada-seo/src/components/NewsletterSignupForm.tsx`

#### バリエーション

- **Full variant:** 名前、メール、興味のカテゴリ選択（Newsletter専用ページ）
- **Compact variant:** メールのみ（Footer内）

#### Supabaseテーブル

```sql
newsletter_subscriptions
  - id (uuid)
  - email (text, unique)
  - name (text, nullable)
  - interests (text[], nullable)
  - created_at (timestamp)
```

---

## 新規CTA実装手順

### ステップ1: 訴求内容の決定

#### 決定すべき項目

1. **ターゲットサービス/行動**
   - サービスURL
   - 内部ページ遷移 or 外部リンク

2. **配置場所**
   - HeroSection（最優先CTA）
   - BlogSection（コンテンツ関連）
   - HobbiesSection（趣味・パーソナル）
   - AIToolsSection（AI/テック）
   - EnablerSection（ビジネスサービス）
   - Footer（常時表示）

3. **訴求メッセージ（日英両言語）**
   - タイトル（20-30文字）
   - 説明文（50-80文字）
   - 特徴リスト（3-5項目、各15文字以内）

4. **ビジュアル要素**
   - アイコン（lucide-reactから選択）
   - カラーグラデーション（Tailwind CSS）
   - バッジテキスト（任意）

### ステップ2: LanguageContextへの追加

**ファイル:** `/Users/yuki/workspace/personal/yukihamada-seo/src/contexts/LanguageContext.tsx`

#### 型定義の追加

```typescript
type TranslationKeys = {
  // 既存のキー...
  cta: {
    // 既存のCTA...
    yourNewCTA: string;
  };
};
```

#### 翻訳データの追加

```typescript
const translations = {
  ja: {
    cta: {
      yourNewCTA: '日本語の訴求文'
    }
  },
  en: {
    cta: {
      yourNewCTA: 'English CTA message'
    }
  }
};
```

### ステップ3: CTAコンポーネントの実装

#### パターンA: ServiceCTACardを使用（推奨）

```tsx
import ServiceCTACard from '@/components/ServiceCTACard';
import { YourIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const YourSection = () => {
  const { t } = useLanguage();

  return (
    <section id="your-section" className="py-24">
      <div className="container mx-auto px-6">
        <ServiceCTACard
          title="サービス名"
          description={t.cta.yourNewCTA}
          features={[
            '特徴1',
            '特徴2',
            '特徴3'
          ]}
          href="https://example.com"
          icon={YourIcon}
          color="from-green-500 to-teal-600"
          badge="カテゴリ"
        />
      </div>
    </section>
  );
};
```

#### パターンB: カスタムCTAコンポーネント

```tsx
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const CustomCTA = () => {
  const { language } = useLanguage();

  return (
    <motion.div
      className="glass-premium rounded-2xl p-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h3 className="text-2xl font-bold mb-4">
        {language === 'ja' ? '日本語タイトル' : 'English Title'}
      </h3>
      <p className="text-muted-foreground mb-6">
        {language === 'ja' ? '日本語説明' : 'English Description'}
      </p>
      <Button asChild className="gradient-bg">
        <a href="https://example.com" target="_blank" rel="noopener noreferrer">
          {language === 'ja' ? '今すぐ試す' : 'Try Now'}
        </a>
      </Button>
    </motion.div>
  );
};
```

### ステップ4: ページへの配置

**ファイル:** `/Users/yuki/workspace/personal/yukihamada-seo/src/pages/Index.tsx`

```tsx
import YourNewSection from '@/components/YourNewSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO url="https://yukihamada.jp" />
      <Navigation />
      <main className="relative z-10">
        <HeroSection />
        <ProjectsSection />
        <EnablerSection />
        <TimelineSection />
        <InvestmentsSection />
        <BlogSection />
        <AIToolsSection />
        <YourNewSection /> {/* ← ここに追加 */}
        <HobbiesSection />
      </main>
      <Footer />
    </div>
  );
};
```

### ステップ5: テスト

#### ローカル開発サーバー起動

```bash
cd /Users/yuki/workspace/personal/yukihamada-seo
npm run dev
# または
bun run dev
```

#### 確認項目

- [ ] CTAが期待通りの位置に表示される
- [ ] リンクが正しく動作する（新規タブで開く）
- [ ] 日英言語切替が正常に動作する
- [ ] ホバーアニメーションが滑らかに動作する
- [ ] モバイル（375px）で適切に表示される
- [ ] タブレット（768px）で適切に表示される
- [ ] デスクトップ（1280px以上）で適切に表示される
- [ ] Lighthouse Performance スコア > 90
- [ ] アクセシビリティチェック（WCAG AA準拠）

### ステップ6: デプロイ

#### ビルド

```bash
npm run build
# または
bun run build
```

#### 静的ファイル確認

```bash
ls -la dist/
```

#### 本番デプロイ

```bash
# Vercelの場合
vercel --prod

# Netlifyの場合
netlify deploy --prod

# Cloudflare Pagesの場合
npx wrangler pages deploy dist
```

---

## 推奨CTA実装案

### 優先度A: elio（iOS AI Agent）

#### 配置場所
AIToolsSection内（chatweb.aiの下に追加）

#### 訴求内容

**日本語:**
- タイトル: elio
- 説明: iOSネイティブのローカルAIエージェント。プライバシー重視、クラウド不要。
- 特徴:
  - オンデバイス処理
  - MCP統合
  - App Store配信中

**英語:**
- Title: elio
- Description: Native iOS AI agent. Privacy-first, works locally without cloud dependency.
- Features:
  - On-device processing
  - MCP integration
  - Available on App Store

#### 実装コード例

```tsx
// src/components/AIToolsSection.tsx に追加

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
  <ServiceCTACard
    title="chatweb.ai"
    description={t.cta.chatweb}
    features={[
      '複数のAIモデル対応',
      '無料プランあり',
      'API・連携機能'
    ]}
    href="https://chatweb.ai"
    icon={Bot}
    color="from-blue-500 to-cyan-600"
    badge={t.cta.badgeAITools}
  />

  <ServiceCTACard
    title="elio"
    description={t.cta.elio}
    features={[
      language === 'ja' ? 'オンデバイス処理' : 'On-device processing',
      language === 'ja' ? 'MCP統合' : 'MCP integration',
      language === 'ja' ? 'App Store配信中' : 'Available on App Store'
    ]}
    href="https://github.com/yukihamada/elio"
    icon={Smartphone}
    color="from-purple-500 to-pink-600"
    badge={language === 'ja' ? 'iOSアプリ' : 'iOS App'}
  />
</div>
```

### 優先度B: Contact Form（お問い合わせフォーム）

#### 配置場所
Footer直前（全ページ共通）

#### 機能要件

1. **入力項目**
   - 名前（必須）
   - メールアドレス（必須）
   - 件名（必須）
   - メッセージ（必須、テキストエリア）
   - カテゴリ選択（任意）
     - ビジネス相談
     - 講演依頼
     - 取材依頼
     - その他

2. **バックエンド**
   - Supabaseテーブル: `contact_submissions`
   - または Cloudflare Workers + Email Workers

3. **通知**
   - 管理者へのメール通知（Resend or SendGrid）
   - ユーザーへの自動返信

#### 実装例

```tsx
// src/components/ContactSection.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

const ContactSection = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          category: formData.category || null,
        });

      if (error) throw error;

      toast({
        title: language === 'ja' ? '送信完了' : 'Message Sent',
        description: language === 'ja'
          ? 'お問い合わせありがとうございます。近日中にご連絡いたします。'
          : 'Thank you for your message. We will get back to you soon.',
      });

      // フォームリセット
      setFormData({ name: '', email: '', subject: '', message: '', category: '' });
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: language === 'ja' ? 'エラー' : 'Error',
        description: language === 'ja'
          ? '送信に失敗しました。もう一度お試しください。'
          : 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'ja' ? 'お問い合わせ' : 'Contact'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'ja'
                ? 'ビジネス相談、講演依頼、取材など、お気軽にご連絡ください'
                : 'Feel free to reach out for business inquiries, speaking engagements, or media requests'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="glass-premium rounded-2xl p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">
                  {language === 'ja' ? 'お名前' : 'Name'} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="email">
                  {language === 'ja' ? 'メールアドレス' : 'Email'} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">
                {language === 'ja' ? 'カテゴリ' : 'Category'}
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ja' ? '選択してください' : 'Select a category'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">
                    {language === 'ja' ? 'ビジネス相談' : 'Business Inquiry'}
                  </SelectItem>
                  <SelectItem value="speaking">
                    {language === 'ja' ? '講演依頼' : 'Speaking Engagement'}
                  </SelectItem>
                  <SelectItem value="media">
                    {language === 'ja' ? '取材依頼' : 'Media Request'}
                  </SelectItem>
                  <SelectItem value="other">
                    {language === 'ja' ? 'その他' : 'Other'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">
                {language === 'ja' ? '件名' : 'Subject'} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="message">
                {language === 'ja' ? 'メッセージ' : 'Message'} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full gradient-bg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'ja' ? '送信中...' : 'Sending...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {language === 'ja' ? '送信する' : 'Send Message'}
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
```

#### Supabaseマイグレーション

```sql
-- Create contact_submissions table
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  replied BOOLEAN DEFAULT FALSE
);

-- Add indexes
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX idx_contact_submissions_read ON contact_submissions(read);

-- Add RLS policies
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for contact form)
CREATE POLICY "Allow anonymous inserts" ON contact_submissions
  FOR INSERT TO anon
  WITH CHECK (true);

-- Only authenticated admins can read
CREATE POLICY "Only admins can read" ON contact_submissions
  FOR SELECT TO authenticated
  USING (auth.jwt()->>'role' = 'admin');
```

### 優先度C: Calendly統合（ミーティング予約）

#### 配置場所
ContactSection内、またはHeroSection（高優先度の場合）

#### 実装例

```tsx
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CalendlyButton = () => {
  const openCalendly = () => {
    window.open('https://calendly.com/yukihamada/30min', '_blank');
  };

  return (
    <Button
      onClick={openCalendly}
      variant="outline"
      className="border-primary/50 text-foreground hover:bg-primary/10"
    >
      <Calendar className="w-4 h-4 mr-2" />
      {language === 'ja' ? 'ミーティングを予約' : 'Schedule a Meeting'}
    </Button>
  );
};
```

---

## デザインガイドライン

### カラーパレット（グラデーション）

既存のCTAで使用されているグラデーション:

```css
/* jitsuflow.app - 学習・趣味系 */
from-violet-500 to-purple-600

/* chatweb.ai - AI・テック系 */
from-blue-500 to-cyan-600

/* stayflowapp.com - 生産性系 */
from-blue-500 to-indigo-600

/* 推奨: elio - モバイルアプリ系 */
from-purple-500 to-pink-600

/* 推奨: Contact - プロフェッショナル系 */
from-green-500 to-teal-600

/* 推奨: Patreon/サポート系 */
from-orange-500 to-red-600
```

### タイポグラフィ

```tsx
// タイトル
className="text-xl font-bold text-foreground"

// 説明文
className="text-sm text-muted-foreground"

// 特徴リスト
className="text-xs text-muted-foreground"

// バッジ
className="text-xs font-medium uppercase tracking-wide"

// CTAボタンテキスト
className="text-sm font-medium text-primary"
```

### スペーシング

```tsx
// セクション間
className="py-24"

// カード内余白
className="p-6 md:p-8"

// 要素間マージン
className="mb-4 md:mb-6"
```

### アニメーション

```tsx
// 基本のフェードイン
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ duration: 0.5 }}

// ホバー時
whileHover={{ scale: 1.02, y: -5 }}
transition={{ type: 'spring', stiffness: 300 }}
```

---

## パフォーマンス最適化

### 画像最適化

```tsx
// 優先度の高い画像（LCP）
<img fetchPriority="high" loading="eager" />

// 遅延読み込み
<img loading="lazy" />
```

### コード分割

```tsx
// 大きなコンポーネントの遅延読み込み
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('@/components/HeavyComponent'));

<Suspense fallback={<div>Loading...</div>}>
  <HeavyComponent />
</Suspense>
```

### フォント最適化

```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

---

## アナリティクス追加

### Google Analytics 4 イベント追跡

```tsx
const trackCTAClick = (ctaName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'cta_click', {
      event_category: 'engagement',
      event_label: ctaName,
      value: 1
    });
  }
};

// 使用例
<Button onClick={() => trackCTAClick('chatweb_ai_cta')}>
  Try chatweb.ai
</Button>
```

---

## トラブルシューティング

### よくある問題

#### 1. CTAが表示されない

**原因:**
- LanguageContextに翻訳が追加されていない
- コンポーネントのインポートミス

**解決策:**
```bash
# ブラウザコンソールでエラー確認
# 型エラーがある場合は型定義を確認
```

#### 2. ホバーアニメーションが動作しない

**原因:**
- Framer Motionのバージョン不整合

**解決策:**
```bash
npm install framer-motion@latest
```

#### 3. ビルドエラー

**原因:**
- 型定義の不一致

**解決策:**
```bash
rm -rf node_modules
npm install
npm run build
```

---

## デプロイチェックリスト

### ビルド前

- [ ] ローカル開発環境で動作確認
- [ ] 全デバイスサイズでレスポンシブデザイン確認
- [ ] 日英両言語で表示確認
- [ ] リンクが正しく動作することを確認
- [ ] Lighthouse パフォーマンステスト（> 90）
- [ ] アクセシビリティチェック（WCAG AA準拠）

### ビルド

```bash
npm run build
```

### デプロイ後

- [ ] 本番URLで動作確認
- [ ] Google Analytics でトラッキング確認
- [ ] 各CTAのクリック率測定開始
- [ ] モニタリング設定（エラー追跡）

---

## メンテナンス

### 定期レビュー（月次）

1. **コンバージョン率確認**
   - 各CTAのクリック数
   - Newsletter登録数
   - Contact Form送信数

2. **A/Bテスト候補**
   - 異なる訴求文
   - 配置位置
   - デザインバリエーション

3. **コンテンツ更新**
   - 新サービス追加
   - 古いCTA削除
   - メッセージのブラッシュアップ

---

## 参考リンク

- **プロジェクトリポジトリ:** `/Users/yuki/workspace/personal/yukihamada-seo`
- **既存実装ドキュメント:** `IMPLEMENTATION_SUMMARY.md`
- **デプロイガイド:** `DEPLOYMENT_GUIDE.md`
- **shadcn/ui ドキュメント:** https://ui.shadcn.com/
- **Framer Motion ドキュメント:** https://www.framer.com/motion/
- **Supabase ドキュメント:** https://supabase.com/docs

---

## まとめ

yukihamada.jpには既に多数のCTA実装パターンが存在します。
新規CTAを追加する際は、既存の`ServiceCTACard`コンポーネントを活用することで、
統一感のあるデザインと保守性の高いコードを実現できます。

### クイックスタート（新規CTA追加）

1. **LanguageContext に訳文追加**
2. **ServiceCTACard を使用**
3. **Index.tsx に配置**
4. **ローカルでテスト**
5. **ビルド & デプロイ**

この手順に従えば、30分以内に新しいCTAを本番環境に追加できます。
