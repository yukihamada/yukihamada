/**
 * Cloudflare Pages Function: Dynamic Sitemap Generator
 *
 * Generates sitemap.xml by querying all published blog posts from Supabase.
 * This replaces the static sitemap.xml that only had 11 URLs.
 *
 * Route: GET /sitemap.xml
 */

interface BlogPost {
  slug: string;
  title_ja: string;
  image: string | null;
  updated_at: string;
  status: string;
}

interface Env {
  // Environment variables can be set in Cloudflare Pages dashboard
}

async function fetchAllBlogPosts(
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<BlogPost[]> {
  const allPosts: BlogPost[] = [];
  const pageSize = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/blog_posts?select=slug,title_ja,image,updated_at,status&status=eq.published&order=updated_at.desc&offset=${offset}&limit=${pageSize}`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch blog posts (offset=${offset}):`,
        response.status
      );
      break;
    }

    const data: BlogPost[] = await response.json();
    allPosts.push(...data);

    if (data.length < pageSize) {
      hasMore = false;
    } else {
      offset += pageSize;
    }
  }

  return allPosts;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
    return d.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

function buildSitemapXml(posts: BlogPost[]): string {
  const baseUrl = "https://yukihamada.jp";
  const today = new Date().toISOString().split("T")[0];

  // Static pages
  const staticPages = [
    {
      loc: `${baseUrl}/`,
      lastmod: today,
      changefreq: "weekly",
      priority: "1.0",
      image: {
        loc: `${baseUrl}/images/default-ogp.jpg`,
        title: "Yuki Hamada",
      },
    },
    {
      loc: `${baseUrl}/blog`,
      lastmod: today,
      changefreq: "daily",
      priority: "0.9",
      image: null,
    },
    {
      loc: `${baseUrl}/community`,
      lastmod: today,
      changefreq: "daily",
      priority: "0.8",
      image: null,
    },
    {
      loc: `${baseUrl}/auth`,
      lastmod: "2025-12-20",
      changefreq: "monthly",
      priority: "0.5",
      image: null,
    },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  // Add static pages
  for (const page of staticPages) {
    xml += `  <url>
    <loc>${escapeXml(page.loc)}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>`;

    if (page.image) {
      xml += `
    <image:image>
      <image:loc>${escapeXml(page.image.loc)}</image:loc>
      <image:title>${escapeXml(page.image.title)}</image:title>
    </image:image>`;
    }

    xml += `
  </url>
`;
  }

  // Add blog posts
  for (const post of posts) {
    const postUrl = `${baseUrl}/blog/${post.slug}`;
    const lastmod = formatDate(post.updated_at);

    xml += `  <url>
    <loc>${escapeXml(postUrl)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>`;

    if (post.image && post.image.trim() !== "") {
      const imageUrl = post.image.startsWith("http")
        ? post.image
        : `${baseUrl}${post.image}`;
      xml += `
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:title>${escapeXml(post.title_ja || "")}</image:title>
    </image:image>`;
    }

    xml += `
  </url>
`;
  }

  xml += `</urlset>
`;

  return xml;
}

export const onRequest: PagesFunction<Env> = async () => {
  const supabaseUrl = "https://itryqwkqnexuawvpoetz.supabase.co";
  const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0cnlxd2txbmV4dWF3dnBvZXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTMyNTYsImV4cCI6MjA4MTY2OTI1Nn0.qrPduVUHBWup00n3UaATLQPtF8fASgqLxaSD9TdGurs";

  try {
    const posts = await fetchAllBlogPosts(supabaseUrl, supabaseAnonKey);
    console.log(`[Sitemap] Generated sitemap with ${posts.length} blog posts`);

    const xml = buildSitemapXml(posts);

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("[Sitemap] Error generating sitemap:", error);

    // Fallback: return a minimal sitemap with just static pages
    const fallbackXml = buildSitemapXml([]);
    return new Response(fallbackXml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  }
};
