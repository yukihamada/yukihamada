

# シェアボタンのiPhone対応修正

## 問題点

現在のシェアボタンは7つのアイテム（X, はてブ, LINE, Facebook, LinkedIn, その他, コピー）があり、iPhoneの画面幅では収まりきらず2行になってしまう。

## 解決策

### 方針: モバイルではボタンサイズを縮小 + gapを詰める

**変更内容（src/components/ShareButtons.tsx）:**

| 項目 | 現在 | 変更後 |
|------|------|--------|
| ボタンサイズ | `w-10 h-10` 固定 | `w-8 h-8 sm:w-10 sm:h-10` |
| アイコンサイズ | `w-5 h-5` 固定 | `w-4 h-4 sm:w-5 sm:h-5` |
| gap | `gap-3` 固定 | `gap-2 sm:gap-3` |
| 「シェア:」ラベル | 常時表示 | モバイルでは非表示 `hidden sm:block` |

**コード例:**
```tsx
<div className="flex items-center gap-2 sm:gap-3 flex-wrap">
  <span className="text-sm text-muted-foreground hidden sm:block">シェア:</span>
  {primaryLinks.map((link) => (
    <a
      ...
      className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors text-foreground"
    >
      <span className="[&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5">
        {link.icon}
      </span>
    </a>
  ))}
  ...
</div>
```

## 計算

iPhone SE (320px幅) の場合:
- ボタン8個 × 32px = 256px
- gap 7個 × 8px = 56px
- 合計: 312px → 余裕で1行に収まる

## 変更ファイル

| ファイル | 変更内容 |
|----------|----------|
| `src/components/ShareButtons.tsx` | レスポンシブサイズ調整 |

