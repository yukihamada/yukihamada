# Quick Start Guide - Service CTA Cards

## 即座に確認する方法

```bash
cd /Users/yuki/workspace/personal/yukihamada-seo

# 依存関係のインストール
bun install

# 開発サーバー起動
bun run dev
```

ブラウザで http://localhost:5173 を開く

## 確認ポイント

### 1. HobbiesSection（#hobbies）
スクロールダウン → 趣味3つのカードの下に:
- **"Related Project"** セクション見出し
- **"柔術をもっと学ぶ"** タイトル
- **jitsuflow.app** CTAカード（紫色グラデーション）

### 2. AIToolsSection（#ai-tools）
BlogSectionの直後、HobbiesSectionの前に:
- **"AIツール"** セクション見出し
- 浮遊するSparklesアニメーション
- **chatweb.ai** CTAカード（青色グラデーション）

### 3. EnablerSection（#enabler）
"3つの事業領域"セクション:
- **4つのサービスカード**が横並び
- 4番目に**stayflowapp.com**（青→インディゴグラデーション）

## 言語切替テスト

右上の言語切替ボタン（EN/JA）をクリック:
- すべてのCTA訴求文が切り替わる
- バッジテキストが切り替わる

## リンクテスト

各CTAカードをクリック:
- [ ] https://jitsuflow.app （新しいタブで開く）
- [ ] https://chatweb.ai （新しいタブで開く）
- [ ] https://stayflowapp.com （新しいタブで開く）

## レスポンシブテスト

ブラウザのデベロッパーツール（F12）を開く:

1. モバイル（iPhone 14 Pro - 393px）
2. タブレット（iPad - 768px）
3. デスクトップ（1920px）

各サイズでレイアウトが適切に表示されることを確認

## 本番デプロイ

すべて確認できたら:

```bash
# ビルド
bun run build

# デプロイ（Vercelの場合）
vercel --prod
```

## トラブルシューティング

### CTAカードが表示されない
→ ブラウザのコンソール（F12）でエラー確認

### 言語切替が動かない
→ LanguageContext.tsxの`cta`オブジェクトを確認

### ビルドエラー
→ `rm -rf node_modules && bun install` で再インストール

## ファイル一覧（変更分のみ）

```
新規:
✓ src/components/ServiceCTACard.tsx
✓ src/components/AIToolsSection.tsx

修正:
✓ src/contexts/LanguageContext.tsx
✓ src/components/HobbiesSection.tsx
✓ src/components/EnablerSection.tsx
✓ src/pages/Index.tsx

ドキュメント:
✓ DEPLOYMENT_GUIDE.md
✓ IMPLEMENTATION_SUMMARY.md
✓ QUICK_START.md
```

完了!
