import { getAllArticles } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

// Google News sitemap: only articles published in the last 48 hours belong here.
export async function GET() {
  const base = `https://${siteConfig.domain}`;
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const recent = getAllArticles().filter((a) => new Date(a.publishedAt).getTime() >= cutoff);

  const urls = recent.map(
    (a) => `<url>
  <loc>${base}/article/${a.slug}</loc>
  <news:news>
    <news:publication>
      <news:name>${siteConfig.name}</news:name>
      <news:language>en</news:language>
    </news:publication>
    <news:publication_date>${new Date(a.publishedAt).toISOString()}</news:publication_date>
    <news:title>${escapeXml(a.title)}</news:title>
  </news:news>
</url>`
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.join("\n")}
</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
