

# サイト全体デザイン刷新 - 空間デザイン & グラスモーフィズム 2.0

## 概要

Apple Vision Pro時代の空間デザイン（Glassmorphism 2.0）を取り入れ、奥行き・3D要素・すりガラス効果を強化します。課金要素は含まず、純粋なビジュアル・インタラクション改善に焦点を当てます。

---

## 1. グラスモーフィズム 2.0 の強化

### 新しいCSSユーティリティクラスの追加（src/index.css）

| クラス名 | 効果 |
|----------|------|
| `.glass-premium` | 高品質すりガラス効果（blur 40px + 彩度180%） |
| `.glass-card-3d` | 3D変形を有効化（preserve-3d） |
| `.depth-layer-1/2/3` | 奥行きレイヤー（translateZ 10/30/60px） |
| `.ambient-glow` | 空間的なグロー効果 |

---

## 2. 3Dインタラクティブ要素の強化

### OrganicBackground.tsx の拡張
- 多層パララックス効果（遠景・中景・近景）
- マウス追従の3Dオーブ
- 奥行きを感じるレイヤー構造

### HeroSection.tsx の拡張
- プロフィール画像の3Dホバー効果強化
- 浮遊感のあるテキストアニメーション

---

## 3. ナビゲーション＆カード類のデザイン刷新

### Navigation.tsx
- スクロール時のグラスモーフィズム強化（blur 16→40px）
- 3Dドロップシャドウの追加
- インナーハイライト効果

### カード類（Timeline, Investments, Hobbies, Enabler）
- `.glass-premium` クラスの適用
- ホバー時の3D傾斜効果強化
- インナーシャドウによる深度表現

---

## 4. 新規CSSアニメーション

| アニメーション | 効果 |
|----------------|------|
| `spatial-float` | 浮遊アニメーション（Y軸 + Z軸移動） |
| `depth-pulse` | 奥行きを感じるシャドウパルス |

---

## 5. 実装ファイル一覧

| ファイル | 変更内容 |
|----------|----------|
| `src/index.css` | Glassmorphism 2.0クラス、3Dアニメーション追加 |
| `src/components/OrganicBackground.tsx` | 多層パララックス、深度レイヤー追加 |
| `src/components/HeroSection.tsx` | 3D効果強化、空間的な浮遊感 |
| `src/components/Navigation.tsx` | グラスモーフィズム強化 |
| `src/components/EnablerSection.tsx` | glass-premiumクラス適用 |
| `src/components/TimelineSection.tsx` | カード3D効果強化 |
| `src/components/InvestmentsSection.tsx` | カード3D効果強化 |
| `src/components/HobbiesSection.tsx` | カード3D効果強化 |

---

## 6. 技術的な考慮事項

**パフォーマンス:**
- モバイルでは `backdrop-filter` を軽量化
- 3D transform は `will-change` で最適化
- `prefers-reduced-motion` でアニメーション制御

**レスポンシブ:**
- モバイルでは3D効果を抑制
- タブレット・デスクトップでフル体験

---

## まとめ

この刷新により、サイトは以下の特徴を持つようになります：

1. **Apple Vision Pro風の空間デザイン** - 奥行きと浮遊感のあるUI
2. **洗練されたグラスモーフィズム** - すりガラス効果の進化版
3. **インタラクティブな3D要素** - ホバー・スクロールで動く立体的UI
4. **統一されたビジュアルアイデンティティ** - 全セクションで一貫したデザイン言語

