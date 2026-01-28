

# ブログ記事修正計画：サウナ火事記事の更新

## 概要

以下の2点を修正します：
1. 「タワーマンション」への言及を削除
2. 粟田選手の試合での足関節による怪我エピソードを追加

---

## 修正箇所

### 修正1: タワーマンション削除

**日本語版（現在）**
```
僕らが死んでた可能性もあるし、
下手したら、同じ建物や近くのタワーマンションの人たちにも
被害が出てたかもしれない。
```

**日本語版（修正後）**
```
僕らが死んでた可能性もあるし、
下手したら、同じ建物の人たちにも
被害が出てたかもしれない。
```

**英語版（現在）**
```
Worse, people in the same building or nearby towers could have been affected.
```

**英語版（修正後）**
```
Worse, people in the same building could have been affected.
```

---

### 修正2: 粟田の足関節怪我を追加

「翌日、試合」セクションに以下を追加：

**日本語版（追加）**
```markdown
しかも粟田に関しては、大惨事がさらに大惨事に。

試合で足関節を極められて、足を故障。

火事で煙を吸って、翌日の試合で足を壊す。
なんというか、粟田の2日間の情報量、明らかにキャパオーバーだった。

パンを我慢して火事を発見した功績は認める。
でもその代償がこれって、人生のバランス調整どうなってるの。
```

**英語版（追加）**
```markdown
And for Awata specifically, disaster piled on disaster.

He got caught in a leg lock during the match and injured his leg.

Inhaled smoke from a fire one day, destroyed his leg in competition the next.
The amount of information Awata's life crammed into 48 hours was clearly over capacity.

I'll give him credit for resisting the bread and discovering the fire.
But this is the payback? Life's balancing algorithm is completely broken.
```

---

## 技術的な実装

SQLのUPDATE文で `content_ja` と `content_en` を更新：

```sql
UPDATE blog_posts 
SET 
  content_ja = REPLACE(
    REPLACE(
      content_ja, 
      '同じ建物や近くのタワーマンションの人たちにも',
      '同じ建物の人たちにも'
    ),
    'それでも試合はやる。',
    'しかも粟田に関しては、大惨事がさらに大惨事に。

試合で足関節を極められて、足を故障。

火事で煙を吸って、翌日の試合で足を壊す。
なんというか、粟田の2日間の情報量、明らかにキャパオーバーだった。

パンを我慢して火事を発見した功績は認める。
でもその代償がこれって、人生のバランス調整どうなってるの。

それでも試合はやる。'
  ),
  content_en = REPLACE(
    REPLACE(
      content_en, 
      'or nearby towers ',
      ''
    ),
    'But we competed anyway.',
    'And for Awata specifically, disaster piled on disaster.

He got caught in a leg lock during the match and injured his leg.

Inhaled smoke from a fire one day, destroyed his leg in competition the next.
The amount of information Awata''s life crammed into 48 hours was clearly over capacity.

I''ll give him credit for resisting the bread and discovering the fire.
But this is the payback? Life''s balancing algorithm is completely broken.

But we competed anyway.'
  ),
  updated_at = NOW()
WHERE slug = 'sauna-fire-incident-2025';
```

---

## 期待される効果

1. **正確性向上**: 不要な「タワーマンション」への言及を削除
2. **ストーリーの深み**: 粟田選手の災難が続くエピソードで、記事のドラマ性と人間味が増加
3. **ユーモアの強化**: 「パンを我慢した代償がこれ」という皮肉なオチ

