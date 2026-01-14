UPDATE blog_posts 
SET content_ja = REPLACE(
  REPLACE(
    REPLACE(content_ja, 
      '<div class="pricing-new">
<div class="pricing-title">Totonos</div>
<div class="pricing-amount">¥9,800/月</div>
<div class="pricing-note">オールインワン</div>
</div>', 
      '<div class="pricing-new">
<div class="pricing-title">Totonos</div>
<div class="pricing-amount">¥0〜9,800/月</div>
<div class="pricing-note">基本無料・100トークン付き</div>
</div>'
    ),
    '<div class="ai-price">$19.99/月（AI Pro）</div>',
    '<div class="ai-price">$19.99〜249.99/月</div>'
  ),
  '<div class="callout-box">
<div class="callout-box-title">🎯 ROIポイント</div>
<div class="callout-box-content">従来の開発で同等のものを作ろうとすると、最低でも3〜6ヶ月、数千万円のコストがかかる。AIネイティブ開発は、そのコストを1/100以下に圧縮する。</div>
</div>',
  '<div class="callout-box">
<div class="callout-box-title">💡 Totonosの料金体系</div>
<div class="callout-box-content">
<strong>基本無料</strong>で全機能が使えます。毎月100トークンが付与され、AIリードスコアリングなどのAI機能を使うとトークンが消費されます。ヘビーユーザー向けに最大¥9,800/月のプランもありますが、普通に使う分には無料で十分です。
</div>
</div>

<div class="callout-box">
<div class="callout-box-title">🎯 ROIポイント</div>
<div class="callout-box-content">従来の開発で同等のものを作ろうとすると、最低でも3〜6ヶ月、数千万円のコストがかかる。AIネイティブ開発は、そのコストを1/100以下に圧縮する。</div>
</div>'
),
updated_at = now()
WHERE slug = 'totonos-29hours-8in1-saas'