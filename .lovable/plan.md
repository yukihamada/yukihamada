

# ダボス2026ブログ記事のデザイン改善計画

参考画像のデザインを分析した結果、以下の改善を実施します。

---

## 現状の問題点

1. **アバターカード**: 現在は小さな横並びカードで、参考画像のような「人物セクション全体をカード化」するデザインではない
2. **著者コメント（YUKI'S TAKE）**: 現在は通常の引用スタイル。参考画像では紫のラベル付きの専用ボックス
3. **見出し（h3）**: 現在は左にプライマリカラーのボーダー。参考画像ではより洗練されたスタイル
4. **スペーシング**: 引用や箇条書きの間隔が詰まりすぎている箇所がある
5. **プレイヤーカード**: 人物ごとの情報が個別のカード内に収まっていない

---

## 実装内容

### 1. 人物（キープレイヤー）カードの再設計

現在の `[avatar:...]` 構文を拡張し、人物ごとのセクション全体をカードで囲む新しい構文を追加：

```markdown
[player-card]
[avatar:/images/davos-elon-musk.jpg:Elon Musk:Tesla / SpaceX / X CEO]

**ダボス初登場 / BlackRock ラリー・フィンクとの対談**

- AIとロボットの普及で「前例のない経済爆発」が起きる
- ロボットの数はいずれ人間を超える
[/player-card]
```

**レンダリング結果:**
- ダークなカード背景（`bg-muted/30`）
- 左側に縦のプライマリカラーライン
- アバターが名前・役職と横並び（大きめサイズ）
- 箇条書きがカード内に収まる

### 2. 著者コメント（YUKI'S TAKE）ボックスの新設

現在の `> **著者コメント：**` を専用のスタイルに変換：

```css
.author-comment-box {
  background: linear-gradient(135deg, hsl(var(--primary)/0.08), hsl(var(--accent)/0.05));
  border-radius: 1rem;
  padding: 1.5rem;
  border-left: none; /* 通常の引用スタイルとは異なる */
}

.author-comment-label {
  color: hsl(var(--primary));
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}
```

### 3. テーブルスタイルの改善

参考画像のテーブルは非常にミニマルで、ボーダーが薄い：

```css
.blog-table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
}

.blog-table-th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid hsl(var(--border));
}

.blog-table-td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid hsl(var(--border)/0.5);
}
```

### 4. 見出し（h3）のスタイル改善

参考画像では左側に太いプライマリカラーのバーがあり、背景なし：

```css
.blog-heading-h3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-left: 1rem;
  border-left: 4px solid hsl(var(--primary));
  margin-top: 2.5rem;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}
```

### 5. スペーシングの最適化

- 箇条書き間のマージンを調整（`mb-3` → `mb-2`）
- 引用ブロックの上下マージンを削減
- 段落間の間隔を統一

---

## 技術的な変更ファイル

### `src/pages/BlogPost.tsx`

1. **著者コメント変換の追加**:
```javascript
.replace(/^> \*\*著者コメント[：:]\*\* (.+)$/gm, (_, text) => {
  return `<div class="author-comment-box">
    <div class="author-comment-label">YUKI'S TAKE</div>
    <p class="text-muted-foreground leading-relaxed">${text}</p>
  </div>`;
})
```

2. **アバター構文の改善**:
```javascript
// より大きなアバター + 横並びレイアウト
return `<div class="player-header flex items-center gap-4 mb-4">
  <div class="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/30 flex-shrink-0">
    <img src="${imagePath}" alt="${name}" ... />
  </div>
  <div>
    <div class="text-xl font-bold text-foreground">${name}</div>
    <div class="text-sm text-muted-foreground">${role}</div>
  </div>
</div>`;
```

3. **プレイヤーカード構文の追加（オプション）**:
```javascript
.replace(/\[player-card\]([\s\S]*?)\[\/player-card\]/g, (_, content) => {
  return `<div class="player-card">
    ${processPlayerCardContent(content)}
  </div>`;
})
```

### `src/index.css`

1. **著者コメントボックスのスタイル追加**
2. **プレイヤーカードのスタイル追加**
3. **テーブルスタイルの微調整**
4. **h3見出しのスタイル調整**

---

## データベース更新

`blog_posts` テーブルの `content_ja` を更新し、著者コメントのフォーマットを調整：

```markdown
<!-- Before -->
> **著者コメント：** 僕がイネブラでプロダクトを作るとき...

<!-- After (マークダウン構文は同じ、CSSで処理) -->
> **著者コメント：** 僕がイネブラでプロダクトを作るとき...
```

---

## 実装の優先順位

1. **著者コメントボックス（YUKI'S TAKE）**: 最も視覚的なインパクトが大きい
2. **アバターサイズと配置の改善**: 現在のデザインを洗練
3. **スペーシング調整**: 全体的な読みやすさ向上
4. **h3見出しスタイル**: より洗練された外観
5. **プレイヤーカード（オプション）**: 人物セクションの囲み

