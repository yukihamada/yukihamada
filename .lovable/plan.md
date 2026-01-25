
## いま起きていること（原因）
- `taiwan-bjj-result-2026` は **DBの `image` が `/images/blog-taiwan-bjj-result.jpg` に設定されている**ため、OGP生成側は「画像あり」と判断してそのURLを `og:image` に入れています。
- ところが **SNSクローラーが取りに行ったときにその画像URLが 404 / 取得失敗（または不正なContent-Type等）扱いになっている**ため、SNS側が画像を表示できません。
- 一方、`biohacking...` と `taiwan-bjj-anger...` は参照している画像URLが正常に取得できるので表示されます。
- いまのフォールバック処理は「`image` が空ならデフォルト」なので、**`image` が“入っているけど実体が取れない”ケースではフォールバックされません**。ここが本質的な穴です。

## 目標
- 今後、記事ごとの `image` が
  - 未設定（null/空）
  - 間違っている（404）
  - 一時的に取れない
  どのパターンでも **必ずデフォルトOGP画像が出る**（SNS側で「画像なし」にならない）ようにする。

## 実装方針（直す場所）
現状、OGPを返している可能性が2系統あります（ドメイン前段のWorker / Pages Functions のmiddleware）。確実に直すため **両方に同じ堅牢化**を入れます。

### A) OGP画像の“実在チェック”を追加してフォールバックを強化
- 画像候補URLを作る（いまのロジック）
- その画像URLに対して **`HEAD`（または軽量な`GET`）で疎通確認**して
  - `200` かつ `Content-Type` が `image/*` なら採用
  - それ以外は **デフォルト画像へ強制フォールバック**
- これで「DBに入ってるけど壊れてる/未デプロイ/404」でも必ずデフォルトが出ます。

### B) キャッシュ・SNS側の握りつぶし対策（キャッシュバスター）
- 画像URLに `?v=<記事のupdated_at or published_at>` のようなバージョン値を付与して、  
  以前にSNSやCDNが 404 を掴んでいた場合でも再取得されやすくします。
- そのために、OGP用のDB取得 `select` に `updated_at`（または `published_at`）を追加します。

### C) `taiwan-bjj-result-2026` の即時復旧（保険）
- コードの堅牢化に加え、今回の該当記事だけは「確実に表示させる」ために
  - `blog_posts.image` を **空（null）に戻してデフォルトを使わせる**（最短で確実）
  - もしくは、確実に配信されている既存画像に差し替える
  のどちらかを行います（あなたの希望に合わせます）。

## 実装ステップ（作業順）
1. **本番の画像URL疎通を確認**
   - `https://yukihamada.jp/images/blog-taiwan-bjj-result.jpg` がクローラーから見て 200 かを確認（Status/Content-Type）
2. **OGPを返している経路を確定**
   - どちら（Worker / Pages middleware）が本番でOGP HTMLを返しているかをログとレスポンスで特定
3. **OGP生成コードを堅牢化**
   - Worker側（`worker/src/index.ts`）に「画像URLの存在チェック→ダメならデフォルト」実装
   - Pages middleware側（`functions/_middleware.ts`）にも同等実装（将来の経路変更でも安全）
4. **キャッシュバスター実装**
   - OGP用に取得する記事データに `updated_at` を追加し、`og:image` に `?v=` を付与
5. **即時復旧のDB更新（必要なら）**
   - `taiwan-bjj-result-2026` の `image` を null にする（デフォルトへ）or 正しいURLへ修正
6. **確認**
   - Twitter Card Validator / Facebook Sharing Debugger / Slack 等で再検証（SNS側のキャッシュは反映に時間がかかることがあるので `?v=` が効きます）

## リスクと対応
- `HEAD` が通らないオリジンが稀にある → その場合は `GET` + `Range: bytes=0-1024` のような軽量取得に切り替えます。
- 画像の存在チェックでレイテンシが増える → **クローラー判定時のみ**実施なので通常ユーザーには影響なし。さらに `Cache-Control` と内部キャッシュで緩和します。

## 追加で確認したいこと（実装前に1つだけ）
- 「OGP画像が出ない」は、どの環境で見てますか？
  - Twitter Card Validator
  - Facebook Sharing Debugger
  - Slack/Discordのリンクプレビュー
  - LINE 等
（キャッシュの癖が違うので、検証手順を最短にできます）
