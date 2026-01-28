

# ダボス2026記事：キープレイヤーのオフィシャル画像追加計画

## 概要

記事内で言及されている8名の主要人物について、各セクションにオフィシャルの顔写真を追加します。外部の公式ソースから画像をダウンロードし、プロジェクト内に保存して使用します。

---

## 追加する人物と画像ソース

| 人物 | 役職 | 画像ソース | 著作権/利用可否 |
|------|------|------------|----------------|
| **Elon Musk** | Tesla/SpaceX/X CEO | WEF公式（Reuters/Denis Balibouse） | 報道・編集目的で使用可 |
| **Yuval Noah Harari** | 歴史学者・作家 | [公式プレスキット](https://www.ynharari.com/about/press-kit/) | メディア使用許可あり |
| **Donald Trump** | 米国大統領 | [Wikimedia Commons公式肖像](https://commons.wikimedia.org/wiki/File:Official_Presidential_Portrait_of_President_Donald_J._Trump_(2025).jpg) | パブリックドメイン |
| **Jensen Huang** | NVIDIA CEO | NVIDIA公式/WEF公式 | 報道目的で使用可 |
| **Dario Amodei** | Anthropic CEO | Anthropic公式 | 報道目的で使用可 |
| **Ray Dalio** | Bridgewater創業者 | Bridgewater公式/WEF | 報道目的で使用可 |
| **Jamie Dimon** | JPMorgan Chase CEO | JPMorgan公式ニュースルーム | 報道目的で使用可 |
| **Kristalina Georgieva** | IMF専務理事 | [IMF公式バイオ](https://www.imf.org/en/About/senior-officials/Bios/kristalina-georgieva) | 公式写真 |

---

## 実装方法

### Step 1: 画像ファイルの準備

`public/images/` ディレクトリに以下のファイルを追加：

```text
public/images/
├── davos-elon-musk.jpg
├── davos-yuval-harari.jpg
├── davos-donald-trump.jpg
├── davos-jensen-huang.jpg
├── davos-dario-amodei.jpg
├── davos-ray-dalio.jpg
├── davos-jamie-dimon.jpg
└── davos-kristalina-georgieva.jpg
```

### Step 2: 記事コンテンツの更新

各キープレイヤーのセクションに、マークダウン画像構文で顔写真を挿入：

```markdown
### Elon Musk — 天国の設計者

![Elon Musk - Davos 2026](/images/davos-elon-musk.jpg)

**ダボス初登場 / BlackRock ラリー・フィンクとの対談**
...
```

### Step 3: 推奨される画像スタイル

記事のトーンに合わせて、以下のスタイルで統一：

- **サイズ**: 丸型アバター風、または小さめの正方形
- **配置**: 各人物の名前の直下、または名前の横にインライン表示
- **キャプション**: 「Photo: WEF/Reuters」などクレジット表記

---

## 技術的な実装詳細

現在の `BlogPost.tsx` は以下の画像構文をサポート：

1. **マークダウン標準**: `![alt text](url)` → フルサイズ画像
2. **カスタム構文**: `[image:/path:caption]` → キャプション付き画像

人物写真は小さめのインライン表示が望ましいため、新しいカスタム構文を追加することを推奨：

```markdown
[avatar:/images/davos-elon-musk.jpg:Elon Musk]
```

この構文は以下のようにレンダリング：
- 丸型クリップ（64px x 64px）
- 名前を下に表示
- ホバーで拡大なし（ポートレートは lightbox 不要）

---

## コンテンツ更新の概要

`blog_posts` テーブルの `content_ja` と `content_en` を更新し、各キープレイヤーセクションに画像を挿入：

### 更新箇所（日本語版）

| セクション | 追加する画像 |
|------------|--------------|
| 2. キープレイヤーたちの主張 → Elon Musk | `davos-elon-musk.jpg` |
| 2. キープレイヤーたちの主張 → Yuval Noah Harari | `davos-yuval-harari.jpg` |
| 2. キープレイヤーたちの主張 → Donald Trump | `davos-donald-trump.jpg` |
| 2. キープレイヤーたちの主張 → Jensen Huang | `davos-jensen-huang.jpg` |
| 2. キープレイヤーたちの主張 → Dario Amodei | `davos-dario-amodei.jpg` |
| 2. キープレイヤーたちの主張 → Ray Dalio | `davos-ray-dalio.jpg` |
| 3. 雇用論争 → Jamie Dimon | `davos-jamie-dimon.jpg` |
| 3. 雇用論争 → Kristalina Georgieva | `davos-kristalina-georgieva.jpg` |

---

## 画像取得の注意点

1. **パブリックドメイン画像を優先**: トランプ大統領の公式肖像はパブリックドメイン
2. **プレスキット画像**: ハラリ、IMFは公式プレスキットを提供
3. **WEF公式写真**: ダボス2026の公式写真はWEFサイトから取得可能
4. **フェアユース**: 報道・論評目的での使用は一般的に許容される

---

## 次のステップ

1. 上記8名の公式画像をダウンロードして `public/images/` に配置
2. `BlogPost.tsx` に `[avatar:...]` 構文のパーサーを追加（オプション）
3. `blog_posts` テーブルの `content_ja` / `content_en` を更新して画像を挿入
4. 動作確認

