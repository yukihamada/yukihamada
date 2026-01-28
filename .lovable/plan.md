

# ブログ記事の画像表示修正計画

## 問題の特定

現在、記事内の画像が正しく表示されていない原因：

1. **Markdown画像構文の未対応**: 記事内で標準的なMarkdown画像構文 `![alt](/images/path.jpg)` を使用しているが、`processContent`関数がこの構文を画像として処理していない
2. **リンクとして誤認識**: `[text](url)` のリンク変換ロジックが画像構文にも適用され、画像がクリック可能なリンクとして表示されている

---

## 修正内容

### Step 1: Markdownイメージ構文のサポート追加

`src/pages/BlogPost.tsx` の `processContent` 関数に、標準Markdown画像構文 `![alt](src)` を処理するロジックを追加

```typescript
// Markdownリンク処理の前に、Markdown画像構文を処理する
.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
  return `<figure class="my-8"><img src="${src}" alt="${alt || ''}" loading="lazy" decoding="async" class="w-full rounded-xl shadow-lg ring-1 ring-border/20" />${alt ? `<figcaption class="text-center text-sm text-muted-foreground mt-3">${alt}</figcaption>` : ''}</figure>`;
})
```

この処理は、既存のリンク処理 `[text](url)` の**前**に配置する必要がある（そうしないと画像構文がリンクとして誤処理される）

---

### Step 2: 新しい写真の追加（おんぶ写真）

1. **画像ファイルをプロジェクトにコピー**
   - `user-uploads://IMG_0782.JPG` → `public/images/blog-sauna-fire-awata-piggyback.jpg`

2. **記事コンテンツの更新**
   - 粟田選手の足関節怪我エピソードの後に、おんぶ写真を追加
   - ユーモラスなキャプション付き

**日本語版（追加）**
```markdown
![足関節を極められた粟田を良蔵先生がおんぶ](/images/blog-sauna-fire-awata-piggyback.jpg)

これが、その証拠写真。
良蔵先生が粟田をおんぶしている。

試合後、歩けなくなった粟田を師匠がおんぶする図。
なんかもう、絵面が強すぎる。

パンを我慢して建物を救ったヒーローが、
翌日には師匠におんぶされてる。

人生って、バランスの取り方が雑すぎない？
```

**英語版（追加）**
```markdown
![Ryozo-sensei giving Awata a piggyback ride after his leg injury](/images/blog-sauna-fire-awata-piggyback.jpg)

Here's the photographic evidence.
Ryozo-sensei carrying Awata on his back.

After the match, when Awata couldn't walk, his master had to piggyback him.
The visual is just too powerful.

The hero who resisted bread and saved a building
is now being carried by his master the very next day.

Life really doesn't know how to balance things, does it?
```

---

## 技術的な実装

### 1. BlogPost.tsx の修正

`processContent` 関数内で、リンク処理の前に画像処理を追加：

```typescript
// 現在のリンク処理（228行目付近）:
.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2"...>$1</a>')

// この前に画像処理を追加:
.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
  return `<figure class="my-8">...</figure>`;
})
.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2"...>$1</a>')
```

### 2. 画像ファイルのコピー

```
lov-copy user-uploads://IMG_0782.JPG public/images/blog-sauna-fire-awata-piggyback.jpg
```

### 3. データベース更新

SQL UPDATE文で `content_ja` と `content_en` を更新し、おんぶ写真とキャプションを追加

---

## 変更サマリー

| 変更種別 | ファイル/対象 | 内容 |
|---------|-------------|------|
| コード修正 | `src/pages/BlogPost.tsx` | Markdown画像構文 `![]()`のサポート追加 |
| 画像追加 | `public/images/` | おんぶ写真を追加 |
| DB更新 | `blog_posts` | おんぶ写真とユーモラスなキャプションを記事に追加 |

---

## 期待される結果

1. **既存の3枚の写真**（焦げ跡、外観、内部煙跡）が記事内で正しく画像として表示される
2. **新しいおんぶ写真**が粟田選手の怪我エピソードの直後に表示される
3. ユーモラスなキャプションで記事の締めくくりが強化される

