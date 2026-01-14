UPDATE blog_posts 
SET content_ja = REPLACE(content_ja, 
  '<a href="mailto:yuki@ham.co">yuki@ham.co</a>までご連絡ください',
  '<button onclick="window.dispatchEvent(new CustomEvent(''openChat''))" class="text-primary hover:underline cursor-pointer bg-transparent border-none">AIチャットで問い合わせ</button>するか、<a href="mailto:yuki@ham.co">yuki@ham.co</a>までご連絡ください'
),
content_en = REPLACE(content_en, 
  '<a href="mailto:yuki@ham.co">yuki@ham.co</a>',
  '<button onclick="window.dispatchEvent(new CustomEvent(''openChat''))" class="text-primary hover:underline cursor-pointer bg-transparent border-none">Ask via AI chat</button> or email <a href="mailto:yuki@ham.co">yuki@ham.co</a>'
),
updated_at = now()
WHERE slug = 'totonos-29hours-8in1-saas'