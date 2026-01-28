

# ブログ記事のタイポグラフィ改善計画

スクリーンショットを分析した結果、冒頭の引用ボックスと本文の間隔・行間が詰まりすぎて読みにくい状態です。以下の改善を実施します。

---

## 問題点

1. **引用ボックス**: 4行のテキストが詰まりすぎ。行間(`leading`)と内側パディングが不足
2. **箇条書き**: 太字キーワードと説明テキストが連続して視認性が悪い
3. **本文段落**: 行間(`line-height`)が狭く、段落間のマージンも不十分
4. **全体的な余白**: 引用後の本文との間隔が狭い

---

## 改善内容

### 1. 引用ボックス（.blog-quote）のスタイル改善

**変更前:**
- `py-4`（上下パディング1rem）
- `leading-relaxed`（行間1.625）

**変更後:**
- `py-5`（上下パディング1.25rem）
- `leading-loose`（行間2）
- テキストサイズを少し調整

### 2. 箇条書きの構造変更

現在の構造:
```html
<li>
  <span>●</span>
  <span><strong>AI</strong>（＝計算資源と電力の争奪戦）</span>
</li>
```

改善後（キーワードと説明を分離）:
```html
<li class="flex flex-col gap-1">
  <div class="flex items-center gap-2">
    <span>●</span>
    <strong>AI</strong>
  </div>
  <span class="pl-5">（＝計算資源と電力の争奪戦）</span>
</li>
```

→ ただし、これはマークダウン構文の変更が必要なため、まずはスペーシングの改善で対応

### 3. 本文段落の行間・間隔調整

**index.cssの変更:**
```css
.blog-content p {
  @apply my-6 leading-loose text-muted-foreground;
  /* my-5 → my-6, leading-relaxed → leading-loose */
}

.blog-quote p {
  @apply text-base md:text-lg text-foreground/85 leading-loose m-0;
  /* leading-relaxed → leading-loose */
}
```

### 4. 引用ボックス後のスペース拡大

```css
.blog-content .blog-quote + p,
.blog-content blockquote + p {
  @apply mt-8;
  /* mt-5 → mt-8 */
}
```

---

## 変更ファイル

### `src/index.css`

1. `.blog-quote`クラスのパディング・行間を拡大
2. `.blog-content p`の行間を`leading-loose`に変更
3. 引用後のスペースを拡大
4. 箇条書きの間隔を`mb-3`に拡大

### `src/pages/BlogPost.tsx`

1. 箇条書きのマージンを`mb-2`から`mb-3`に変更
2. 引用ボックスのインラインスタイルにleading-looseを追加

---

## 期待される結果

- 引用ボックス内のテキストが呼吸できる余白を持つ
- 箇条書きが縦に並んで視認性向上
- 本文が読みやすい行間・段落間隔になる
- 全体的に「詰まった感じ」が解消される

