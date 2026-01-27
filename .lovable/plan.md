

# 投資先企業ロゴの正式版への差し替え

## 現状の問題

現在 `public/images/investments/` に保存されているロゴファイルは、各企業のアプリアイコンやシンボルマークであり、正式なワードマーク（文字ロゴ）ではありません。

| 企業 | 現状 | あるべき姿 |
|------|------|------------|
| NOT A HOTEL | 建物のアイコン | "NOT A HOTEL" テキストのワードマーク |
| NEWT (令和トラベル) | アプリアイコン | 緑のウミガメ + "NEWT" テキスト |
| ELSOUL LABO | ✅ 正しいSVG | Solanaグラデーション + テキスト |
| FiNANCiE | "f" アイコンのみ | "FiNANCiE" フルワードマーク |
| VUILD | 木目調アイコン | "VUILD" テキストワードマーク |

## 解決策

### Phase 1: 各企業の公式ロゴを取得

各企業の公式サイトからワードマークロゴを取得します：

| 企業 | ロゴ取得元 | 形式 |
|------|------------|------|
| NOT A HOTEL | notahotel.com のヘッダー | SVG/PNG |
| NEWT | newt.net/brand（ブランドページ） | SVG/PNG |
| FiNANCiE | corp.financie.jp のヘッダー | SVG/PNG |
| VUILD | vuild.co.jp のヘッダー | SVG/PNG |

### Phase 2: ファイル差し替え

```text
public/images/investments/
├── notahotel-logo.png  → SVG/PNGワードマークに差し替え
├── newt-logo.png       → ウミガメ+NEWTワードマークに差し替え
├── elsoul-logo.svg     → ✅ そのまま（正しい）
├── financie-logo.png   → FiNANCiEワードマークに差し替え
└── vuild-logo.jpg      → VUILDワードマークに差し替え
```

### Phase 3: コンポーネント調整（必要に応じて）

ロゴのサイズや色調整が必要な場合：

```tsx
// src/components/InvestmentsSection.tsx
// ロゴサイズを横長のワードマークに対応できるよう調整
className="w-auto h-10 max-w-[120px] object-contain"
```

## 実装手順

1. 各企業の公式サイトにアクセスしてロゴ画像を取得
2. 取得したロゴを `public/images/investments/` に保存
3. ダークモードでの表示確認・調整
4. 必要に応じてサイズ調整

## 注意点

- SVG形式を優先（拡大縮小しても劣化しない）
- 透過背景推奨
- ダークモード対応が必要な場合は `dark:invert` フィルターで対応

