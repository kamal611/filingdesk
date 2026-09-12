import { getAllArticles } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const articles = getAllArticles();
  const base = `https://${siteConfig.domain}`;
  const staticUrls = ["", "/about", "/editorial-standards", "/contact"].map(
    (p) => `<url><loc>${base}${p}</loc></url>`
  );
  const articleUrls = articles.map(
    (a) =>
      `<url><loc>${base}/article/${a.slug}</loc><lastmod>${new Date(
        a.publishedAt
      ).toISOString()}</lastmod></url>`
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...articleUrls].join("\n")}
</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}
