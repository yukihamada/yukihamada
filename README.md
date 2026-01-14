# Yuki Hamada - Personal Website

濱田優貴の個人ウェブサイト。イネブラ創業者、エンジェル投資家として、AI・テクノロジー・柔術など多様な分野で活動中。

## Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: TanStack Query
- **Backend**: Supabase
- **Hosting**: Cloudflare Pages

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Cloudflare Pages Deployment

### Initial Setup

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. **Pages** > **Create a project** > **Connect to Git**
3. GitHubリポジトリを選択
4. ビルド設定:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
5. **Deploy** をクリック

### Custom Domain Setup

1. Cloudflare Pages プロジェクト設定 > **Custom domains**
2. `yukihamada.jp` を追加
3. DNSレコードを設定:
   ```
   Type: CNAME
   Name: @
   Content: <your-project>.pages.dev
   ```

### Environment Variables

必要に応じて以下の環境変数を設定:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |

## SEO Features

### Implemented

- **Basic SEO Meta Tags**: title, description, keywords, robots
- **Open Graph Protocol**: og:title, og:description, og:image, etc.
- **Twitter Cards**: summary_large_image
- **Structured Data (JSON-LD)**: Person, WebSite schemas
- **Dynamic OGP**: Cloudflare Functions middleware for social crawlers
- **Sitemap**: `public/sitemap.xml`
- **Robots.txt**: `public/robots.txt`
- **Performance**: Preconnect, DNS Prefetch, Preload LCP

### Dynamic OGP for Social Sharing

Cloudflare Functions (`functions/_middleware.ts`) がTwitter、Facebook等のクローラーを検知し、サーバーサイドでOGPタグをインジェクトします。これによりSPAでも正しくOGP画像が表示されます。

### Adding New Blog Posts

ブログ記事を追加した場合:

1. `functions/_middleware.ts` の `blogPosts` オブジェクトに記事情報を追加
2. `public/sitemap.xml` にURLを追加
3. OGP画像を `public/images/` に配置

## Project Structure

```
├── functions/              # Cloudflare Pages Functions
│   └── _middleware.ts      # OGP injection for crawlers
├── public/
│   ├── _headers           # HTTP headers config
│   ├── _redirects         # SPA routing
│   ├── images/            # Static images
│   ├── robots.txt         # Robots config
│   └── sitemap.xml        # Sitemap
├── src/
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── pages/             # Page components
│   └── lib/               # Utilities
├── index.html             # Entry HTML with SEO meta
├── vite.config.ts         # Vite config
└── wrangler.toml          # Cloudflare config
```

## License

All rights reserved.
