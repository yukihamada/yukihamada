UPDATE blog_posts 
SET content_ja = REPLACE(
  REPLACE(content_ja, 
    '<div class="ai-price">$100/月（MAX）</div>', 
    '<div class="ai-price">$100〜200/月（MAX）</div>'
  ),
  '<div class="ai-price">無料</div>',
  '<div class="ai-price">$19.99/月（AI Pro）</div>'
),
content_en = REPLACE(
  REPLACE(content_en, 
    '<div class="ai-price">$100/mo (MAX)</div>', 
    '<div class="ai-price">$100-200/mo (MAX)</div>'
  ),
  '<div class="ai-price">Free</div>',
  '<div class="ai-price">$19.99/mo (AI Pro)</div>'
),
updated_at = now()
WHERE slug = 'totonos-29hours-8in1-saas'