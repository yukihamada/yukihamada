

# ブログ記事レイアウト調整計画

## 概要

スクリーンショットに基づき、以下の4つのレイアウト問題を修正します。

## 変更内容

### 1. アバターカードから名前を削除し、サブタイトルを名前の横に表示

**現状の問題:**
```
### Yuval Noah Harari — 地獄の解像度  ← 見出しに名前あり
[avatar:/images/davos-yuval-harari.jpg:Yuval Noah Harari:歴史学者・作家]
                                      ↑ ここにも名前が重複
```

**解決策:**
- `[avatar]` 構文の処理を変更
- 名前の代わりに「サブタイトル」（地獄の解像度）を表示
- 役職は名前の横に表示

**修正後のイメージ:**
```
### Yuval Noah Harari — 地獄の解像度
[avatar画像] 歴史学者・作家   ← 名前なし、役職のみ
```

**または、新しい構文を導入:**
```markdown
[avatar:/images/davos-yuval-harari.jpg::歴史学者・作家]
```
（名前を空にすると非表示）

### 2. 箇条書き間のスペースを詰める

**現状:** `src/index.css` の `.blog-content ul, ol` に `space-y-4` が設定されている

**修正:**
```css
/* Before */
.blog-content ul,
.blog-content ol {
  @apply my-6 space-y-4;  /* space-y-4 = 16px間隔 */
}

/* After */
.blog-content ul,
.blog-content ol {
  @apply my-6 space-y-2;  /* space-y-2 = 8px間隔 */
}
```

### 3. セッション見出しと箇条書きの間隔を広げる

**現状:** `.player-card + ul` に `mt-4` が設定されているが、通常の段落/見出し後のリストは十分なマージンがない

**修正:**
```css
/* 見出しやセッション名の後のリストに余白追加 */
.blog-content p + ul,
.blog-content p + ol,
.blog-content strong + ul {
  @apply mt-6;
}
```

### 4. 箇条書きを右にずらす（インデント追加）

**現状:** `src/pages/BlogPost.tsx` でリストアイテムに `gap-3` が設定されているが、左マージンがない

**修正:** リストアイテムに左パディングを追加
```css
.blog-content ul,
.blog-content ol {
  @apply my-6 space-y-2 pl-4;  /* pl-4 = 16px左インデント追加 */
}
```

## 技術的変更

### ファイル: `src/index.css`

| 行 | 変更内容 |
|-----|---------|
| 1073-1076 | `space-y-4` → `space-y-2` に変更、`pl-4` 追加 |
| 新規追加 | 見出し/段落後のリスト用マージンルール |

### ファイル: `src/pages/BlogPost.tsx`（オプション）

アバター構文の処理を変更し、名前が空の場合は非表示にする

```typescript
// 名前が空の場合は表示しない
.replace(/\[avatar:([^\]]+)\]/g, (_, avatarInfo) => {
  const parts = avatarInfo.split(':');
  const imagePath = parts[0];
  const name = parts[1] || '';
  const role = parts.slice(2).join(':') || '';
  return `<div class="player-card">
    <div class="player-header">
      <div class="player-avatar">
        <img src="${imagePath}" alt="${name || role}" ... />
      </div>
      <div class="player-info">
        ${name ? `<div class="player-name">${name}</div>` : ''}
        ${role ? `<div class="player-role">${role}</div>` : ''}
      </div>
    </div>
  </div>`;
})
```

### データベース変更

Yuval Noah Harariのセクションの `[avatar]` 構文を更新：

**Before:**
```markdown
[avatar:/images/davos-yuval-harari.jpg:Yuval Noah Harari:歴史学者・作家]
```

**After:**
```markdown
[avatar:/images/davos-yuval-harari.jpg::歴史学者・作家 | 地獄の解像度]
```

## 変更後のイメージ

```
### Yuval Noah Harari — 地獄の解像度

[アバター画像] 歴史学者・作家 | 地獄の解像度
                     ↑ 名前なし、役職+サブタイトル

セッション「An Honest Conversation on AI and Humanity」

                     ↑ ここに余白（mt-6）

    • AIは「ツール」ではない...
                     ↑ 少し右にインデント（pl-4）
    • 「AI移民」が到来する...
         ↑ 間隔を詰める（space-y-2）
```

