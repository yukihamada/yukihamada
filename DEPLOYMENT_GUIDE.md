# Deployment Guide - Service CTA Cards Implementation

## 概要
yukihamada.jp に各サービスへのCTAカードを実装しました。

## 実装内容

### 1. 新規作成ファイル
- **ServiceCTACard.tsx**: 再利用可能なサービスCTAカードコンポーネント
- **AIToolsSection.tsx**: AI Tools専用セクション（chatweb.ai CTA含む）

### 2. 修正ファイル
- **LanguageContext.tsx**: 日英両言語のCTA訴求文を追加
- **HobbiesSection.tsx**: jitsuflow.app CTAを追加
- **EnablerSection.tsx**: stayflowapp.com を4番目のサービスとして追加
- **Index.tsx**: AIToolsSectionをBlogSectionとHobbiesSectionの間に配置

## 実装されたCTA

### 1. jitsuflow.app (HobbiesSection内)
- **位置**: 趣味セクションの下部
- **アイコン**: GraduationCap (卒業帽)
- **カラー**: from-violet-500 to-purple-600
- **訴求ポイント**:
  - 日本語: 世界基準のブラジリアン柔術指導を、いつでもどこでも
  - 英語: World-class Brazilian Jiu-Jitsu instruction, available anytime, anywhere
- **特徴**:
  - 4K技術動画 / 4K instructional videos
  - 体系的カリキュラム / Systematic curriculum
  - チャンピオン監修 / Champion-supervised training

### 2. chatweb.ai (AIToolsSection - 新規セクション)
- **位置**: BlogSectionとHobbiesSectionの間
- **アイコン**: Bot (ロボット)
- **カラー**: from-blue-500 to-cyan-600
- **訴求ポイント**:
  - 日本語: マルチモデル対応AIチャットプラットフォーム
  - 英語: Multi-model AI chat platform. Access GPT-4, Claude, Gemini, and more
- **特徴**:
  - 複数のAIモデル対応 / Multiple AI models
  - 無料プランあり / Free tier available
  - API・連携機能 / API & integrations

### 3. stayflowapp.com (EnablerSection内)
- **位置**: EnablerSectionの4番目のサービスカード
- **アイコン**: TrendingUp (上昇トレンド)
- **カラー**: from-blue-500 to-indigo-600
- **訴求ポイント**:
  - 日本語: ディープワークセッションを追跡・最適化
  - 英語: Track and optimize your deep work sessions
- **特徴**:
  - 集中時間の追跡 / Focus time tracking
  - フロー分析 / Flow analytics
  - 生産性インサイト / Productivity insights

## デプロイ手順

### 前提条件
- Node.js 18以上
- npm または bun

### ローカル開発環境で確認

```bash
cd /Users/yuki/workspace/personal/yukihamada-seo

# 依存関係のインストール（初回のみ）
npm install
# または
bun install

# 開発サーバー起動
npm run dev
# または
bun run dev
```

ブラウザで http://localhost:5173 にアクセスして以下を確認:

1. **HobbiesSectionの最下部**にjitsuflow.appのCTAカードが表示されること
2. **BlogSectionとHobbiesSectionの間**にAI Toolsセクションが追加され、chatweb.aiのCTAカードが表示されること
3. **EnablerSectionのサービス一覧**が4つになり、stayflowapp.comが表示されること
4. **言語切替**（EN/JA）で各CTAの文言が正しく切り替わること
5. **レスポンシブデザイン**がモバイル・タブレット・デスクトップで適切に表示されること
6. **ホバーアニメーション**が正常に動作すること

### 本番デプロイ

#### ビルド
```bash
npm run build
# または
bun run build
```

#### 静的ファイルの確認
```bash
ls -la dist/
```

#### デプロイ（プラットフォームに応じて）

##### Vercel の場合
```bash
vercel --prod
```

##### Netlify の場合
```bash
netlify deploy --prod
```

##### 手動デプロイの場合
`dist/` ディレクトリの内容を本番サーバーにアップロード

## 検証項目チェックリスト

- [ ] jitsuflow.app CTAがHobbiesSectionに表示される
- [ ] chatweb.ai CTAが新しいAI Toolsセクションに表示される
- [ ] stayflowapp.com CTAがEnablerSectionに表示される
- [ ] 各CTAカードのリンクが正しく動作する（新しいタブで開く）
- [ ] 日本語/英語の切り替えが正常に動作する
- [ ] モバイルビューで適切に表示される
- [ ] タブレットビューで適切に表示される
- [ ] デスクトップビューで適切に表示される
- [ ] ホバーアニメーションが滑らかに動作する
- [ ] ページ全体のパフォーマンスに問題がない

## トラブルシューティング

### ビルドエラーが発生する場合
```bash
# node_modulesを削除して再インストール
rm -rf node_modules
npm install
# または
bun install
```

### 型エラーが発生する場合
LanguageContext.tsxの型定義を確認してください。`cta`オブジェクトと`services.stayflow`が正しく定義されているか確認。

### CTAカードが表示されない場合
1. ブラウザのコンソールでエラーを確認
2. LanguageContextの訳文が正しく設定されているか確認
3. ServiceCTACard.tsxがインポートされているか確認

## ロールバック手順

万が一問題が発生した場合:

```bash
# 変更を元に戻す
git log --oneline  # コミット履歴を確認
git revert <commit-hash>  # 該当コミットを取り消し

# または、変更前のブランチに戻す
git checkout <previous-branch>
```

## 次のステップ

- [ ] 各サービスのトラフィック分析を設定（Google Analytics等）
- [ ] A/Bテストでどの訴求文が効果的か検証
- [ ] ユーザーフィードバックを収集
- [ ] 他のサービスのCTA追加を検討

## 連絡先
実装に関する質問: yukihamada@enabler.jp
