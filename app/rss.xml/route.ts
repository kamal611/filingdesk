import { getAllArticles } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = `https://${siteConfig.domain}`;
  const items = getAllArticles()
    .slice(0, 50)
    .map(
      (a) => `<item>
  <title>${escapeXml(a.title)}</title>
  <link>${base}/article/${a.slug}</link>
  <guid>${base}/article/${a.slug}</guid>
  <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
  <description>${escapeXml(a.dek)}</description>
</item>`
    );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>${siteConfig.name}</title>
  <link>${base}</link>
  <description>${siteConfig.description}</description>
  ${items.join("\n")}
</channel></rss>`;
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
