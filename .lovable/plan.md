

# 新規ブログ記事作成計画：「ATP増産サプリガイドを作った話」

## 概要

Claude Codeを活用して開発した「ATP増産サプリガイド」ツール（https://atpboost.pages.dev/）の開発背景、設計思想、技術的な仕組みを詳しく解説する新規記事を作成します。化学（Chemistry）と科学（Science）の両面からアプローチした内容にします。

---

## 記事のメタデータ

| 項目 | 内容 |
|------|------|
| slug | `atp-boost-supplement-guide-development` |
| カテゴリ | テクノロジー / Technology |
| 画像 | `/images/blog-atp-comparison.png`（既存画像を使用） |
| featured | false |

---

## 記事構成（日本語版）

### タイトル
Claude Codeで作った「ATP増産サプリガイド」：化学×科学で最強のサプリ摂取法を設計した話

### 導入部
- オートファジーが基本だが、その上でさらにATPを増やしたい
- 情報過多の時代に「自分専用の優先順位」が欲しかった
- Claude Codeを使って開発した経緯

### 本文構成

**1. なぜこのツールを作ったか**
- 「結局どれ飲めばいいの？」問題
- 論文ベースの情報は英語で難解
- アフィリエイト記事の信頼性問題
- → 自分用のパーソナライズツールを作ろう

**2. 全体の設計思想**
- HTML 1ファイル完結（サーバーレス、プライバシー重視）
- 個人情報をどこにも送らない
- 30アイテム（サプリ18種・食事由来12種）のデータベース

**3. 化学（Chemistry）の視点：ATPの構造を理解する**
- ATPの分子式：C₁₀H₁₆N₅O₁₃P₃
- なぜD-リボースが重要か（ATPの骨格）
- なぜマグネシウムが必須か（ATPの活性化）
- 各サプリの分子式と作用メカニズム

**4. 科学（Science）の視点：エビデンスベースのスコアリング**
- 4軸評価システム（ATP/長寿/運動/根拠）
- RCT（ランダム化比較試験）に基づく用量設定
- 標準モード vs 実験的モード

**5. 7ステップのオンボーディング設計**
- 各質問が直接スコアに反映される仕組み
- 年齢・運動量による動的な重み付け
- 食事習慣による減点/加点ロジック
- 薬の相互作用警告システム

**6. スコアリングの数学的仕組み**
- 固定スコア × 動的重み = 総合スコア
- 正規化による安定性確保
- 悩みブースト、食事補正、重複チェック

**7. ATPを増やすサプリ：トップ5の科学的根拠**
各サプリについて以下を解説：
1. **クレアチン** - ATP合成の直接原料、メタ分析で確認済み
2. **ユビキノール（CoQ10還元型）** - 電子伝達系の補酵素
3. **D-リボース** - ATPの5炭糖骨格
4. **マグネシウム** - Mg-ATP複合体として活性化
5. **R-αリポ酸** - ミトコンドリア内の両刀使い

**8. UI/UXの工夫**
- グラスモーフィズムデザイン
- カード入場アニメーション
- モバイルファースト設計
- スコアのバーグラフ表示

**9. Claude Codeでの開発体験**
- プロンプトエンジニアリングのコツ
- 化学式・論文引用の精度確認
- イテレーションの効率性

### 結論
- 透明性（なぜその推奨なのか説明）
- パーソナライズ（個人差を考慮）
- 安全性（薬の相互作用警告）
- オートファジーが前提、サプリは仕上げ

### 関連記事セクション
- ハイブリッド・エネルギー記事へのリンク
- バイオハッキング記事へのリンク
- エンジニア柔術家のATP解説へのリンク

---

## 英語版

日本語版を翻訳し、同等の構成で作成：

### タイトル
Building the "ATP Boost Supplement Guide" with Claude Code: Designing the Ultimate Supplement Strategy with Chemistry and Science

---

## 現在の記事への追加

「ハイブリッド・エネルギー」記事（`hybrid-energy-mitochondria-awakening`）のセクション6を更新し、新記事へのリンクを追加：

### 追加するリンク

```markdown
👉 このツールの開発背景と技術的な仕組みについては、[「ATP増産サプリガイド」を作った話](/blog/atp-boost-supplement-guide-development)で詳しく解説しています。
```

---

## 技術的な実装手順

### Step 1: 新規記事をデータベースに挿入
```sql
INSERT INTO blog_posts (
  slug,
  featured,
  image,
  title_ja, excerpt_ja, content_ja, date_ja, category_ja,
  title_en, excerpt_en, content_en, date_en, category_en,
  status,
  published_at
) VALUES (
  'atp-boost-supplement-guide-development',
  false,
  '/images/blog-atp-comparison.png',
  -- 日本語コンテンツ --,
  -- 英語コンテンツ --,
  'published',
  NOW()
);
```

### Step 2: 既存記事にリンクを追加
```sql
UPDATE blog_posts 
SET 
  content_ja = REPLACE(
    content_ja, 
    '👉 詳細なスコアリング解説とサプリ一覧は**[ATP増産サプリガイド完全版](https://atpboost.pages.dev/)**でご覧いただけます。',
    '👉 このツールの開発背景と技術的な仕組みについては、[「ATP増産サプリガイド」を作った話](/blog/atp-boost-supplement-guide-development)で詳しく解説しています。

👉 実際のツールは**[ATP増産サプリガイド完全版](https://atpboost.pages.dev/)**でお試しください。'
  ),
  content_en = REPLACE(
    content_en, 
    '👉 For detailed scoring explanations and the full supplement list, check out the **[ATP Boost Supplement Guide: Complete Edition](https://atpboost.pages.dev/)**.',
    '👉 For the development story and technical details behind this tool, see [How I Built the "ATP Boost Supplement Guide"](/blog/atp-boost-supplement-guide-development).

👉 Try the actual tool at **[ATP Boost Supplement Guide: Complete Edition](https://atpboost.pages.dev/)**.'
  ),
  updated_at = NOW()
WHERE slug = 'hybrid-energy-mitochondria-awakening';
```

---

## 記事の特徴

- **化学×科学の融合**: 分子式レベルの解説と、RCTベースのエビデンスを両立
- **開発ストーリー**: Claude Codeを使った開発体験を共有
- **技術的深掘り**: スコアリングアルゴリズムの数学的仕組みを解説
- **実用性**: ツールへの導線を明確に
- **クロスリンク**: 既存のハイブリッド・ライフスタイル記事群との連携

---

## 期待される効果

1. **SEO強化**: 「クレアチン」「CoQ10」「サプリメント」「ATP」などのキーワードをカバー
2. **サイト回遊率向上**: ハイブリッド・エネルギー記事との相互リンク
3. **ツールへの誘導**: atpboost.pages.dev への明確な導線
4. **技術ブランディング**: Claude Codeを使った開発力のアピール

