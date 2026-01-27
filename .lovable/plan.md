

# サイト改善計画 - ニュースレター・投資先ロゴ・ダークモード切替

## 概要

3つの主要な改善を実施:
1. **ニュースレター登録ページ** - 専用ページとフッター埋め込み
2. **投資先ロゴ表示** - 絵文字から実際のロゴ画像へ
3. **ダークモード切替の改善** - ライトモードを実用的に

---

## 1. ニュースレター登録機能

### 1.1 データベース（新テーブル作成）

既存の`elio_signups`は特定プロダクト用なので、汎用ニュースレター用に新テーブルを作成:

| カラム | 型 | 説明 |
|--------|------|------|
| `id` | uuid | 主キー |
| `email` | text | メールアドレス（UNIQUE） |
| `name` | text | 名前（任意） |
| `interests` | text[] | 興味カテゴリ（任意） |
| `created_at` | timestamp | 登録日時 |

**RLSポリシー:**
- 公開ユーザー: INSERTのみ（メール形式バリデーション付き）
- 管理者: SELECT可能

### 1.2 専用ページ（/newsletter）

```text
src/pages/Newsletter.tsx
├── ヒーローセクション（登録フォーム）
├── 配信内容の説明
│   ├── 📝 ブログ更新通知
│   ├── 🚀 投資・プロジェクト情報
│   └── 💡 AI・テック最新情報
├── 興味カテゴリ選択（チェックボックス）
└── プライバシー説明
```

### 1.3 フッター統合

`Footer.tsx`にニュースレター登録フォームを追加（メールアドレスのみのシンプル版）

---

## 2. 投資先ロゴ表示

### 2.1 ロゴ画像の追加

投資先企業のロゴ画像を`public/images/investments/`に配置:

| 企業 | ファイル名 |
|------|------------|
| NOT A HOTEL | `notahotel-logo.png` |
| 令和トラベル (NEWT) | `newt-logo.png` |
| エルソウルラボ | `elsoul-logo.png` |
| フィナンシェ | `financie-logo.png` |
| VUILD | `vuild-logo.png` |

> ロゴ画像はユーザーからの提供が必要です

### 2.2 InvestmentsSectionの更新

絵文字の代わりにロゴ画像を表示:

```tsx
// 現在
logo: '🏨'

// 変更後
logo: '/images/investments/notahotel-logo.png'
```

**UI変更:**
- 絵文字表示 → `<img>` タグでロゴ表示
- ダークモード対応（白背景ロゴの場合はフィルター適用）
- フォールバック: 画像がない場合は現在の絵文字を表示

---

## 3. ダークモード/ライトモード切替の改善

### 3.1 現状

- `ThemeToggle.tsx`は既に実装済み
- `Navigation.tsx`に既に組み込み済み
- `ThemeProvider`で`defaultTheme="dark"`に設定

### 3.2 改善点

**ライトモードの視認性向上（index.css）:**

| 要素 | 現在 | 改善後 |
|------|------|--------|
| `.glass-premium`のライトモード | ダーク用の色 | ライト用に調整 |
| OrganicBackground | ダーク前提 | ライトモード対応 |
| グラデーションテキスト | 同一 | ライトモードで視認性向上 |

**CSS追加例:**
```css
/* Light mode specific glass effect */
:root .glass-premium {
  background: linear-gradient(
    135deg,
    hsl(var(--card) / 0.8) 0%,
    hsl(var(--card) / 0.6) 100%
  );
}

.dark .glass-premium {
  /* 現在の設定を維持 */
}
```

**OrganicBackground.tsx:**
- ライトモードでは明るい色のオーブを使用
- `useTheme()`でテーマを検知して色を切り替え

---

## 4. 実装ファイル一覧

| ファイル | 変更内容 |
|----------|----------|
| **新規作成** | |
| `src/pages/Newsletter.tsx` | ニュースレター登録ページ |
| `src/components/NewsletterSignupForm.tsx` | 再利用可能な登録フォーム |
| `public/images/investments/*.png` | 投資先ロゴ画像（ユーザー提供待ち） |
| **データベース** | |
| 新マイグレーション | `newsletter_subscriptions`テーブル作成 |
| **既存ファイル変更** | |
| `src/App.tsx` | `/newsletter`ルート追加 |
| `src/components/Footer.tsx` | ニュースレター登録フォーム追加 |
| `src/components/InvestmentsSection.tsx` | ロゴ画像対応 |
| `src/index.css` | ライトモード用スタイル追加 |
| `src/components/OrganicBackground.tsx` | ライトモード対応 |
| `src/components/Navigation.tsx` | ライトモード対応確認 |

---

## 5. 実装順序

```text
Phase 1: ニュースレター機能
├── DBテーブル作成
├── 登録フォームコンポーネント作成
├── 専用ページ作成
└── フッターに統合

Phase 2: 投資先ロゴ
├── データ構造更新（画像パス追加）
├── UI更新（img表示）
└── フォールバック実装

Phase 3: ライトモード改善
├── CSS変数調整
├── glass-premiumライトモード対応
└── OrganicBackgroundテーマ対応
```

---

## 6. ユーザーへの確認事項

1. **投資先企業のロゴ画像** - 各企業のロゴ画像をアップロードしていただく必要があります（PNG/SVG推奨、透過背景）

2. **ニュースレターの配信内容** - 現在の想定:
   - ブログ更新通知
   - 投資・プロジェクト情報
   - AI・テック関連情報
   
   他に追加したいカテゴリはありますか？

